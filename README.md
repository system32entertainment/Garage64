# Garage64

> **Status: prototype.** Expect rough edges, breakage, and incomplete features. See [`maintainability-plan`](https://github.com/system32entertainment) (internal) for the path to v0.1.

A web tool for building Minecraft OptiFine CEM (Custom Entity Models) resource packs. Compose custom cars from a base body and swappable parts, edit textures and UVs, preview in real-time 3D, and export ready-to-use `.jem`, `.jpm`, and `.properties` files.

## Features

- **Garage** — browse and create car variants, pick a body and parts, preview in 3D.
- **Studio** — compose variants, edit UV maps, paint textures, and tweak geometry in a Blockbench-style modeler.
- **Parts library** — manage swappable parts (wheels, body kits, etc.) grouped into mutually-exclusive slots.
- **Export** — one-click generation of `.jem`, `.jpm`, and `.properties` files into a ready-to-zip resource pack.

## Stack

- **Frontend** — React 18, TypeScript, React Router v6, Three.js, Vite
- **Backend** — Django 4.2, Django REST Framework, Pillow
- **Database** — SQLite (development)

## Data model

```
EntityBody → CarVariant → VariantPart → ModelPart
                                        ↳ PartSlot
```

- `EntityBody` — a base `.jem` (shared body geometry).
- `ModelPart` — a swappable `.jpm` part with attachment metadata.
- `PartSlot` — groups mutually-exclusive parts (e.g. `wheels`, `headlights`).
- `CarVariant` — a body + ordered list of parts; one per `.jem` output file.
- `VariantPart` — through table mapping parts to variants in order.

## Running locally

```bash
./dev.sh   # starts Django on :8000 and Vite on :5173
```

Backend setup:

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend setup:

```bash
cd frontend
npm install
npm run dev
```

## Export output

Exported packs land under:

```
Garage64_LATEST/assets/minecraft/optifine/cem/<model>/
├── <model>.jem          # body geometry with parts inlined
├── parts/<part>.jpm     # individual part geometry
├── variants/<variant>.png  # per-variant texture
└── <model>.properties   # OptiFine trigger → variant mapping
```

## Project structure

```
backend/         Django project (pack app, exporter, asset proxy)
frontend/        React + Vite app (Garage, Studio, Parts, Export pages)
```

## Status & roadmap

Garage64 is in active development as a System32 Entertainment product. The current focus is shipping a stable v0.1 as a local creator tool. Planned work includes:

- Refactoring Modeler and Studio into smaller components.
- Typed JEM/JPM domain layer.
- Test coverage for the exporter and CEM transforms.
- Fixing the UV-save discrepancy between Studio and Garage views.

## License

[AGPL-3.0](./LICENSE). If you host a modified Garage64 as a service, you must publish your changes under the same license.

## About

Garage64 is built by [System32 Entertainment](https://github.com/system32entertainment).
