#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACK_ROOT="$ROOT/Garage64_LATEST"
CEM_DIR="$PACK_ROOT/assets/minecraft/optifine/cem"

if [ -z "${CEM_MODEL_NAME:-}" ]; then
  if [ -f "$CEM_DIR/boat.jem" ]; then
    CEM_MODEL_NAME="boat"
  else
    CEM_MODEL_NAME="oak_boat"
  fi
fi

BASE_JEM="$CEM_DIR/$CEM_MODEL_NAME.jem"
PROPS_FILE="$CEM_DIR/$CEM_MODEL_NAME.properties"

cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for setup."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is required for setup."
  exit 1
fi

if [ ! -f "$BASE_JEM" ]; then
  echo "Could not find pack data at:"
  echo "  $BASE_JEM"
  echo ""
  echo "Place the Garage64_LATEST resource pack at the repo root before running setup."
  exit 1
fi

if [ ! -f "$PROPS_FILE" ]; then
  echo "Could not find CEM selector at:"
  echo "  $PROPS_FILE"
  echo ""
  echo "Set CEM_MODEL_NAME if the base model is not boat:"
  echo "  CEM_MODEL_NAME=boat ./setup.sh"
  exit 1
fi

echo "Normalizing Garage64 CEM pack files..."
python3 - <<'PY'
import json
from pathlib import Path

root = Path('Garage64_LATEST')
cem = root / 'assets' / 'minecraft' / 'optifine' / 'cem'
wheel_model = 'minecraft:optifine/cem/miata/parts/miata_duce_wheels.jpm'
wheel_texture = 'minecraft:optifine/cem/miata/parts/miata_duce_wheels.png'
popup_model = 'minecraft:optifine/cem/miata/parts/miata_popups.jpm'
popup_texture = 'minecraft:optifine/cem/miata/parts/miata_popups.png'

aliases = [
    ('boat.jem', 'oak_boat.jem'),
    ('boat2.jem', 'oak_boat2.jem'),
    ('boat3.jem', 'oak_boat3.jem'),
]

valid_boat_parts = {'bottom', 'back', 'front', 'right', 'left', 'paddle_left', 'paddle_right'}
stale_inline_part_ids = {'DuceKitWheels', 'miata_popups'}

def remove_stale_inline_parts(data):
    data['models'] = [
        model for model in data.get('models', [])
        if not (model.get('id') in stale_inline_part_ids and 'model' not in model)
    ]

for primary_name, mirror_name in aliases:
    src = cem / primary_name
    if not src.exists():
        src = cem / mirror_name
    if not src.exists():
        continue
    data = json.loads(src.read_text(encoding='utf-8-sig'))
    remove_stale_inline_parts(data)
    for model in data.get('models', []):
        part = model.get('part')
        if part and part not in valid_boat_parts:
            model['part'] = 'front'
            model['attach'] = True
        if model.get('model') == wheel_model:
            model.update({
                'id': 'DuceKitWheels',
                'part': 'front',
                'attach': True,
                'invertAxis': 'xy',
                'mirrorTexture': 'u',
                'translate': [0, -2, -5.5],
                'rotate': [0, -180, 0],
                'texture': wheel_texture,
                'textureSize': [32, 32],
            })
        elif model.get('model') == popup_model:
            model.update({
                'id': 'miata_popups',
                'part': 'front',
                'attach': True,
                'invertAxis': 'xy',
                'mirrorTexture': 'u',
                'translate': [0, -2, -5.5],
                'rotate': [0, -180, 0],
                'texture': popup_texture,
                'textureSize': [16, 16],
            })
    text = json.dumps(data, indent='\t', ensure_ascii=False) + '\n'
    (cem / primary_name).write_text(text, encoding='utf-8')
    (cem / mirror_name).write_text(text, encoding='utf-8')

props = cem / 'boat.properties'
if not props.exists():
    props = cem / 'oak_boat.properties'
if props.exists():
    text = props.read_text(encoding='utf-8-sig')
    (cem / 'boat.properties').write_text(text, encoding='utf-8')
    (cem / 'oak_boat.properties').write_text(text, encoding='utf-8')

wheel_path = cem / 'miata' / 'parts' / 'miata_duce_wheels.jpm'
if wheel_path.exists():
    data = json.loads(wheel_path.read_text(encoding='utf-8-sig'))
    for model in data.get('submodels', []):
        if model.get('id') == 'DuceKitWheels':
            model['translate'] = [0, 0, 11]
    wheel_path.write_text(json.dumps(data, indent='\t', ensure_ascii=False) + '\n', encoding='utf-8')
PY

echo "Building Docker images..."
docker compose build

echo "Starting backend container..."
docker compose up -d backend

echo "Applying database migrations..."
docker compose exec -T backend python manage.py migrate --noinput

echo "Loading Garage64_LATEST data into the Docker database..."
docker compose exec -T backend python manage.py import_pack --model-name "$CEM_MODEL_NAME"

echo ""
echo "Setup complete."
echo "Start the site with:"
echo "  docker compose up"
echo ""
echo "Then open:"
echo "  http://localhost:3264/garage64/"
