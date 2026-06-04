import json

import pytest

from pack.models import CarVariant, EntityBody, ModelPart, VariantPart
from pack.services.exporter import compiled_jem, export_all


@pytest.mark.django_db
def test_export_all_writes_variant_parts_and_properties(tmp_path):
    body = EntityBody.objects.create(
        name='miata_base',
        jem_file_name='boat',
        entity_type='boat',
        body_data={
            'texture': 'textures/entity/boat/oak.png',
            'textureSize': [128, 128],
            'models': [
                {'id': 'front', 'part': 'front', 'invertAxis': 'xy', 'translate': [0, -2, 0]},
                {'id': 'bottom', 'part': 'bottom', 'invertAxis': 'xy'},
            ],
        },
    )
    CarVariant.objects.create(file_name='boat', trigger_name='', body=body, order=0)
    variant = CarVariant.objects.create(file_name='boat2', trigger_name='Duce', body=body, order=1)
    wheels = ModelPart.objects.create(
        name='miata_duce_wheels',
        jpm_path='minecraft:optifine/cem/miata/parts/miata_duce_wheels.jpm',
        attachment_meta={
            'id': 'DuceKitWheels',
            'part': 'body',
            'translate': [99, 99, 99],
            'rotate': [0, 0, 0],
        },
        part_data={
            'id': 'miata_duce_wheels',
            'invertAxis': 'xy',
            'translate': [0, 0, 0],
            'submodels': [
                {'id': 'DuceKitWheels', 'invertAxis': 'xy', 'translate': [0, 0, 0]},
            ],
            'textureSize': [32, 32],
        },
    )
    VariantPart.objects.create(variant=variant, part=wheels, order=0)

    result = export_all(tmp_path)

    assert result.ok
    cem_dir = tmp_path / 'assets' / 'minecraft' / 'optifine' / 'cem'
    jem = json.loads((cem_dir / 'boat2.jem').read_text(encoding='utf-8'))
    jpm = json.loads(
        (cem_dir / 'miata' / 'parts' / 'miata_duce_wheels.jpm').read_text(encoding='utf-8')
    )
    props = (cem_dir / 'boat.properties').read_text(encoding='utf-8')

    attachment = jem['models'][1]
    assert attachment['model'] == 'minecraft:optifine/cem/miata/parts/miata_duce_wheels.jpm'
    assert attachment['part'] == 'front'
    assert attachment['attach'] is True
    assert attachment['translate'] == [0, -2, -5.5]
    assert attachment['rotate'] == [0, -180, 0]
    assert attachment['mirrorTexture'] == 'u'
    assert jpm['submodels'][0]['translate'] == [0, 0, 11]
    assert 'models.1=2' in props
    assert 'name.1=Duce' in props


@pytest.mark.django_db
def test_compiled_jem_inlines_parts_for_viewer():
    body = EntityBody.objects.create(
        name='miata_base',
        jem_file_name='boat',
        entity_type='boat',
        body_data={'models': [{'id': 'front', 'part': 'front'}, {'id': 'bottom'}]},
    )
    variant = CarVariant.objects.create(file_name='boat2', trigger_name='Duce', body=body, order=1)
    wheels = ModelPart.objects.create(
        name='miata_duce_wheels',
        jpm_path='minecraft:optifine/cem/miata/parts/miata_duce_wheels.jpm',
        attachment_meta={'id': 'DuceKitWheels', 'part': 'body'},
        part_data={
            'id': 'miata_duce_wheels',
            'submodels': [{'id': 'DuceKitWheels', 'translate': [0, 0, 0]}],
        },
    )
    VariantPart.objects.create(variant=variant, part=wheels, order=0)

    jem = compiled_jem(variant)

    attachment = jem['models'][1]
    assert 'model' not in attachment
    assert attachment['part'] == 'front'
    assert attachment['translate'] == [0, -2, -5.5]
    assert attachment['submodels'][0]['submodels'][0]['translate'] == [0, 0, 11]
