import type { CemModel, Jem } from './types'

/**
 * Collect every unique texture path referenced anywhere in a JEM object.
 * Returns raw path strings, which may include the "minecraft:" namespace.
 */
export function collectTexturePaths(jem: Jem | null | undefined): string[] {
  const paths = new Set<string>()
  if (jem?.texture) paths.add(jem.texture)

  function walk(models?: CemModel[]) {
    for (const model of models || []) {
      if (model.texture) paths.add(model.texture)
      walk(model.submodels)
    }
  }

  walk(jem?.models)
  return [...paths]
}

/**
 * Normalize a raw texture path to the form expected by the Django asset API.
 */
export function normTexPath(raw: string): string {
  return raw.replace(/^minecraft:/, '')
}
