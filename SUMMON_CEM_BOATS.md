# Summoning Garage64 CEM Boats

This guide matches the current `Garage64_LATEST` pack in this repo.

The active CEM files are:

```text
Garage64_LATEST/assets/minecraft/optifine/cem/boat.jem
Garage64_LATEST/assets/minecraft/optifine/cem/boat2.jem
Garage64_LATEST/assets/minecraft/optifine/cem/boat3.jem
Garage64_LATEST/assets/minecraft/optifine/cem/boat.properties
```

## Requirements

- Minecraft Java Edition with OptiFine, or a compatible CEM implementation.
- The `Garage64_LATEST` resource pack enabled.
- OptiFine settings enabled:
  - Custom Entity Models
  - Random Entities, because OptiFine uses Random Entities-style rules for CEM alternate model selection
  - Custom Items, only if you also care about named boat item icons

Reload packs after changes with:

```text
F3+T
```

## How This Pack Selects Models

OptiFine CEM supports numbered alternate model files. In this pack:

```text
boat.jem  = default boat model
boat2.jem = model index 2
boat3.jem = model index 3
```

The selector is:

```properties
models.1=2
name.1=Duce

models.2=3
name.2=DuceH
```

So:

- An oak boat named `Duce` uses `boat2.jem`.
- An oak boat named `DuceH` uses `boat3.jem`.
- Any other boat uses `boat.jem`.

## Summon Commands

### Default Miata / Oak Boat

```mcfunction
/summon minecraft:boat ~ ~ ~ {Type:"oak"}
```

### Duce

```mcfunction
/summon minecraft:boat ~ ~ ~ {Type:"oak",CustomName:'{"text":"Duce"}'}
```

### DuceH

```mcfunction
/summon minecraft:boat ~ ~ ~ {Type:"oak",CustomName:'{"text":"DuceH"}'}
```

## Give Named Boat Items

If you want an item that places as a named boat, use a named oak boat item.

For Minecraft 1.20.5+ item component syntax:

```mcfunction
/give @p minecraft:oak_boat[minecraft:custom_name='{"text":"Duce","italic":false}'] 1
/give @p minecraft:oak_boat[minecraft:custom_name='{"text":"DuceH","italic":false}'] 1
```

For older NBT item syntax:

```mcfunction
/give @p minecraft:oak_boat{display:{Name:'{"text":"Duce","italic":false}'}} 1
/give @p minecraft:oak_boat{display:{Name:'{"text":"DuceH","italic":false}'}} 1
```

If placing a named item does not preserve the boat entity name in your Minecraft
version, use the direct `/summon` commands instead.

## Verify In Game

Look at the nearest boat's entity data:

```mcfunction
/data get entity @e[type=minecraft:boat,sort=nearest,limit=1]
```

The important values are:

```text
Type: "oak"
CustomName: '{"text":"Duce"}'
```

or:

```text
Type: "oak"
CustomName: '{"text":"DuceH"}'
```

## Notes About Other Files

The pack also contains CIT and Random Entities files under:

```text
assets/minecraft/optifine/cit/
assets/minecraft/optifine/random/
```

Those are separate systems:

- CEM model selection for the placed boat comes from `optifine/cem/boat.properties`.
- CIT affects item icons in inventory.
- Random Entities texture rules affect entity textures, not the main CEM model selector documented above.

For this specific pack, the reliable commands are the `Duce` and `DuceH`
`/summon minecraft:boat` commands above.

## Troubleshooting

- If the boat is vanilla-shaped, enable Custom Entity Models and reload with `F3+T`.
- If the default model appears instead of `Duce` or `DuceH`, check the exact `CustomName`.
- If the named item icon changes but the placed boat does not, summon the entity directly.
- If nothing changes, confirm the pack contains `assets/minecraft/optifine/cem/boat.properties`.

## References

- OptiFine CEM model files and numbered alternate models:
  <https://optifine.readthedocs.io/cem_models.html>
- OptiFine boat entity/part names:
  <https://optifine.readthedocs.io/cem_entity_names.html>
- Random Entities rule syntax, including `name.N` and NBT matching:
  <https://optifine.readthedocs.io/random_entities.html>
- CIT item matching, including the 1.20.5+ components change:
  <https://optifine.readthedocs.io/cit.html>
