import type { CemModel } from '../../../domain/cem/types'

/**
 * Navigates the model tree to return a specific node.
 */
export function getNode(models: CemModel[] | undefined | null, modelPath: number[] | undefined | null): CemModel | null {
  if (!models || !modelPath?.length) return null;
  let n = models[modelPath[0]];
  for (let i = 1; i < modelPath.length; i++) n = n?.submodels?.[modelPath[i]] ?? null;
  return n;
}

/**
 * Returns an immutable update of the models tree.
 */
export function updateNode(
  models: CemModel[],
  modelPath: number[],
  updater: (model: CemModel) => CemModel,
): CemModel[] {
  const clone = JSON.parse(JSON.stringify(models)) as CemModel[];
  if (modelPath.length === 1) {
    clone[modelPath[0]] = updater(clone[modelPath[0]]);
    return clone;
  }
  let n = clone[modelPath[0]];
  for (let i = 1; i < modelPath.length - 1; i++) n = n.submodels[modelPath[i]];
  n.submodels[modelPath[modelPath.length - 1]] = updater(n.submodels[modelPath[modelPath.length - 1]]);
  return clone;
}

/**
 * Removes a node and returns [newModels, removedNode] for drag-and-drop or nesting.
 */
export function extractModel(models: CemModel[], path: number[]): [CemModel[], CemModel] {
  const m = JSON.parse(JSON.stringify(models)) as CemModel[];
  const idx = path[path.length - 1];
  if (path.length === 1) {
    const [n] = m.splice(idx, 1);
    return [m, n];
  }
  let parent = m[path[0]];
  for (let i = 1; i < path.length - 1; i++) parent = parent.submodels[path[i]];
  const [n] = parent.submodels.splice(idx, 1);
  return [m, n];
}

/**
 * Inserts a node into a target parent.
 */
export function nestModel(models: CemModel[], targetPath: number[], node: CemModel): CemModel[] {
  const m = JSON.parse(JSON.stringify(models)) as CemModel[];
  if (targetPath.length === 0) {
    m.push(node);
    return m;
  }
  let t = m[targetPath[0]];
  for (let i = 1; i < targetPath.length; i++) t = t.submodels[targetPath[i]];
  if (!t.submodels) t.submodels = [];
  t.submodels.push(node);
  return m;
}
