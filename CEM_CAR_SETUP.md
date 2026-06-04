# Garage64 CEM Car Setup

This document explains how the current `Garage64_LATEST` pack is organized so
new cars can be set up with attached parts correctly.

## File Layout

The core CEM files live here:

```text
Garage64_LATEST/assets/minecraft/optifine/cem/
```

Current car model files:

```text
boat.jem              # active default/base car model
boat2.jem             # active named variant selected by boat.properties
boat3.jem             # active named variant selected by boat.properties
boat.properties       # active in-game variant selector rules
oak_boat*.jem         # legacy/source copies mirrored by the app exporter
main_template.jem     # clean boat/car template
```

Reusable attached parts live under the car folder:

```text
optifine/cem/miata/parts/
├── miata_duce_wheels.jpm
├── miata_duce_wheels.png
├── miata_popups.jpm
├── miata_popups.png
└── miata_stock_wheels.jpm
```

## How Variants Are Selected

`boat.properties` chooses which numbered `.jem` file to render based on
the placed boat entity's custom name:

```properties
models.1=2
name.1=Duce

models.2=3
name.2=DuceH
```

That means:

```text
boat.jem  = default model
boat2.jem = used when the boat is named Duce
boat3.jem = used when the boat is named DuceH
```

Summon examples:

```mcfunction
/summon minecraft:boat ~ ~ ~ {Type:"oak"}
/summon minecraft:boat ~ ~ ~ {Type:"oak",CustomName:'{"text":"Duce"}'}
/summon minecraft:boat ~ ~ ~ {Type:"oak",CustomName:'{"text":"DuceH"}'}
```

## Anatomy Of An Attached Part

Attached parts are referenced from a variant `.jem` by adding a top-level model
entry with a valid boat part target, usually `front`, and `attach: true`.

Example from the current pack:

```json
{
  "id": "DuceKitWheels",
  "part": "front",
  "attach": true,
  "invertAxis": "xy",
  "translate": [0, 2, 5.5],
  "rotate": [0, 180, 0],
  "texture": "minecraft:optifine/cem/miata/parts/miata_duce_wheels.png",
  "textureSize": [32, 32],
  "model": "minecraft:optifine/cem/miata/parts/miata_duce_wheels.jpm"
}
```

Important fields:

- `id`: Friendly identifier for the attachment entry.
- `part`: The vanilla CEM boat part to attach to. Use `front` for whole-car
  attachments unless you have a reason to target another boat part.
- `attach: true`: Adds the part without replacing the target boat part.
- `translate` and `rotate`: Position the JPM relative to the target part.
  For Miata JPMs authored in car space, use `[0, 2, 5.5]` and
  `[0, 180, 0]` to cancel the parent `front` transform.
- `texture`: Optional texture override for this part.
- `textureSize`: Texture atlas size used by the JPM.
- `model`: Path to the `.jpm` part file.

Valid vanilla boat part names:

```text
bottom
back
front
right
left
paddle_left
paddle_right
```

## JPM Part Files

A `.jpm` file contains reusable part geometry. For example,
`miata_duce_wheels.jpm` has:

```json
{
  "id": "miata_duce_wheels",
  "invertAxis": "xy",
  "translate": [0, 0, 0],
  "submodels": [
    {
      "id": "DuceKitWheels",
      "submodels": []
    }
  ],
  "textureSize": [32, 32]
}
```

When adding a new part:

1. Put the geometry in `optifine/cem/<car>/parts/<part_name>.jpm`.
2. Put its texture beside it if the part needs a custom texture.
3. Reference the JPM from the variant `.jem` with a top-level attachment entry.
4. Keep the JPM path namespaced from the Minecraft asset root:

```text
minecraft:optifine/cem/miata/parts/miata_duce_wheels.jpm
```

## Adding A New Car Variant

Use this workflow when adding a new named car setup.

1. Copy the clean base file:

```text
boat.jem -> boat4.jem
```

2. Add any attached part entries to the top-level `models` array in
   `boat4.jem`.

3. Add a selector rule to `boat.properties`:

```properties
models.3=4
name.3=MyCarName
```

4. Summon it by matching the custom name exactly:

```mcfunction
/summon minecraft:boat ~ ~ ~ {Type:"oak",CustomName:'{"text":"MyCarName"}'}
```

Rules should use continuous numbering:

```properties
models.1=2
name.1=Duce

models.2=3
name.2=DuceH

models.3=4
name.3=MyCarName
```

## Adding A New Part To An Existing Variant

1. Create the JPM:

```text
optifine/cem/miata/parts/my_part.jpm
```

2. Add the texture if needed:

```text
optifine/cem/miata/parts/my_part.png
```

3. Add a top-level attachment entry to the target variant `.jem`:

```json
{
  "id": "MyPart",
  "part": "front",
  "attach": true,
  "invertAxis": "xy",
  "translate": [0, 2, 5.5],
  "rotate": [0, 180, 0],
  "texture": "minecraft:optifine/cem/miata/parts/my_part.png",
  "textureSize": [32, 32],
  "model": "minecraft:optifine/cem/miata/parts/my_part.jpm"
}
```

4. Reload the pack in game with `F3+T`.

## Item Icons Versus Placed Cars

Files under this folder affect inventory item icons:

```text
optifine/cit/cars/
```

Example:

```properties
type=item
matchItems=oak_boat
texture=mc50701.png
nbt.display.Name=iregex:(mc50701)
```

CIT does not attach parts to the placed car. It only changes how the boat item
looks in inventory. The placed entity model is controlled by the CEM files and
`boat.properties`.

## Common Failure Points

- The `.properties` rule name must match the boat's `CustomName`.
- The `models.N` value points at the numbered `.jem`: `models.3=4` loads
  `boat4.jem`.
- Attached part entries need `attach: true`.
- Attached part entries need a valid boat `part`, usually `front`.
- Namespaced JPM paths should resolve under `assets/minecraft/`.
- Keep JPM textures next to the JPM when using
  `minecraft:optifine/cem/<car>/parts/<part>.png`.
- Use `F3+T` after every pack edit.

## Quick Validation Checklist

Before testing in Minecraft:

- `boat.properties` has a rule for the variant name.
- The referenced numbered `.jem` file exists.
- Every attached `.jpm` path exists.
- Every part texture path exists.
- The target summon command uses `Type:"oak"` and the exact `CustomName`.
