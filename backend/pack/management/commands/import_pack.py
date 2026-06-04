"""
python manage.py import_pack

Reads the existing pack files from PACK_ROOT and seeds the database:
  - EntityBody  ← the configured base .jem file
  - ModelPart   ← every .jpm part file under optifine/cem
  - CarVariant  ← the default model plus numbered .jem variants

Run this once after setting up. Re-running is safe — it clears existing data first.
"""

import json
import os
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from pack.models import CarVariant, EntityBody, ModelPart, VariantPart


class Command(BaseCommand):
    help = 'Seed the database from the existing pack files in PACK_ROOT'

    def add_arguments(self, parser):
        parser.add_argument(
            '--model-name',
            default=os.environ.get('CEM_MODEL_NAME', 'boat'),
            help='Base CEM model name without extension, for example oak_boat or boat.',
        )

    def handle(self, *args, **options):
        pack_root = Path(settings.PACK_ROOT)
        cem_dir = pack_root / 'assets' / 'minecraft' / 'optifine' / 'cem'
        model_name = options['model_name']
        base_jem_path = cem_dir / f'{model_name}.jem'
        props_path = cem_dir / f'{model_name}.properties'

        if not base_jem_path.exists():
            raise FileNotFoundError(f'Missing base CEM model: {base_jem_path}')

        self.stdout.write('Clearing existing data...')
        VariantPart.objects.all().delete()
        CarVariant.objects.all().delete()
        ModelPart.objects.all().delete()
        EntityBody.objects.all().delete()

        # ── 1. Create the base body from the configured .jem ──────────────
        base_data = json.loads(base_jem_path.read_text(encoding='utf-8'))
        _remove_stale_inline_parts(base_data)

        body = EntityBody.objects.create(
            name='miata_base',
            jem_file_name=model_name,
            entity_type='boat',
            body_data=base_data,
        )
        self.stdout.write(self.style.SUCCESS(f'Created EntityBody: {body.name}'))

        # ── 2. Parse variant .jem files ────────────────────────────────────
        # Read .properties to get trigger names keyed by variant index
        trigger_map = _parse_properties(props_path)
        # trigger_map = {2: 'Duce', 3: 'DuceH'} (model index → name)

        # Default variant (base model itself, no trigger)
        CarVariant.objects.create(
            file_name=model_name,
            trigger_name='',
            body=body,
            order=0,
        )
        self.stdout.write(self.style.SUCCESS(f'Created CarVariant: {model_name} (default)'))

        parts_cache: dict[str, ModelPart] = {}

        # Import every .jpm so the Parts Library sees available parts even
        # before they are attached to a variant.
        for jpm_path in sorted(cem_dir.rglob('*.jpm')):
            _get_or_create_part(_jpm_ref_from_path(jpm_path, cem_dir), {}, cem_dir, parts_cache)

        # Indexed variants: boat2, boat3, ...
        variant_index = 2
        while True:
            jem_path = cem_dir / f'{model_name}{variant_index}.jem'
            if not jem_path.exists():
                break

            jem_data = json.loads(jem_path.read_text(encoding='utf-8'))
            _remove_stale_inline_parts(jem_data)
            jpm_entries, _ = _split_models(jem_data['models'])

            # The clean base should already match body_data, but we store it as-is
            trigger_name = trigger_map.get(variant_index, '')
            variant = CarVariant.objects.create(
                file_name=f'{model_name}{variant_index}',
                trigger_name=trigger_name,
                body=body,
                order=variant_index - 1,  # order 1, 2, ...
            )

            for i, entry in enumerate(jpm_entries):
                jpm_path_str = entry['model']
                part = _get_or_create_part(jpm_path_str, entry, cem_dir, parts_cache)
                VariantPart.objects.create(variant=variant, part=part, order=i)

            self.stdout.write(
                self.style.SUCCESS(
                    f'Created CarVariant: {model_name}{variant_index} '
                    f'(trigger="{trigger_name}", parts={len(jpm_entries)})'
                )
            )
            variant_index += 1

        self.stdout.write(self.style.SUCCESS('Import complete.'))


# ── helpers ──────────────────────────────────────────────────────────────────

def _parse_properties(path: Path) -> dict:
    """
    Parse a CEM .properties file into {model_index: trigger_name}.
    Example: models.2=3  name.2=DuceH  →  {3: 'DuceH'}
    """
    if not path.exists():
        return {}
    result = {}
    index_to_model = {}
    index_to_name = {}
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if line.startswith('#') or not line:
            continue
        key, _, value = line.partition('=')
        key = key.strip()
        value = value.strip()
        if key.startswith('models.'):
            idx = int(key.split('.', 1)[1])
            index_to_model[idx] = int(value)
        elif key.startswith('name.'):
            idx = int(key.split('.', 1)[1])
            index_to_name[idx] = value
    for idx in index_to_model:
        model_num = index_to_model[idx]
        name = index_to_name.get(idx, '')
        result[model_num] = name
    return result


def _split_models(models: list) -> tuple[list, list]:
    """
    Split a JEM models array into:
      - jpm_entries: entries that have a "model" key (part attachments)
      - rest: everything else (standard bones)
    """
    jpm_entries = [m for m in models if 'model' in m]
    rest = [m for m in models if 'model' not in m]
    return jpm_entries, rest


def _remove_stale_inline_parts(jem_data: dict):
    """Drop old top-level inlined part geometry; variants should attach JPM refs."""
    stale_ids = {'DuceKitWheels', 'miata_popups'}
    jem_data['models'] = [
        model for model in jem_data.get('models', [])
        if not (model.get('id') in stale_ids and 'model' not in model)
    ]


def _get_or_create_part(
    jpm_path_str: str,
    entry: dict,
    cem_dir: Path,
    cache: dict,
) -> ModelPart:
    """Load or create a ModelPart from a jpm path string."""
    attachment_meta = {k: v for k, v in entry.items() if k != 'model'}
    if jpm_path_str in cache:
        part = cache[jpm_path_str]
        if attachment_meta and not part.attachment_meta:
            part.attachment_meta = attachment_meta
            part.save(update_fields=['attachment_meta'])
        return part

    # Derive filesystem path from the minecraft: namespace path
    # "minecraft:optifine/cem/miata/parts/miata_duce_wheels.jpm"
    rel = jpm_path_str.split('optifine/cem/', 1)[-1]
    full_path = cem_dir / rel

    part_data = {}
    if full_path.exists():
        part_data = json.loads(full_path.read_text(encoding='utf-8'))
        _normalize_known_part_data(jpm_path_str, part_data)

    # Derive a friendly name from the filename
    name = Path(rel).stem  # e.g. "miata_duce_wheels"

    part, created = ModelPart.objects.get_or_create(
        jpm_path=jpm_path_str,
        defaults={
            'name': name,
            'part_data': part_data,
            'attachment_meta': attachment_meta,
        },
    )
    if not created and attachment_meta and not part.attachment_meta:
        part.attachment_meta = attachment_meta
        part.save(update_fields=['attachment_meta'])
    cache[jpm_path_str] = part
    return part


def _jpm_ref_from_path(path: Path, cem_dir: Path) -> str:
    """Convert a JPM filesystem path into an OptiFine namespace reference."""
    rel = path.relative_to(cem_dir).as_posix()
    return f'minecraft:optifine/cem/{rel}'


def _normalize_known_part_data(jpm_path_str: str, part_data: dict):
    """Keep known Garage64 JPMs at their confirmed in-game placement."""
    if jpm_path_str != 'minecraft:optifine/cem/miata/parts/miata_duce_wheels.jpm':
        return
    for model in part_data.get('submodels', []):
        if model.get('id') == 'DuceKitWheels':
            model['translate'] = [0, 0, 11]
