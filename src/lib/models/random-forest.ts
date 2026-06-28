/**
 * A random forest — the cure for the single tree's high variance, and the answer to the
 * instability the decision-tree node ended on. Grow many trees, each on its own bootstrap
 * resample of the data AND restricted to a random subset of features at every split, then
 * average their probability votes. Each tree is jagged and overfit on its own; because
 * the bootstrap + feature randomness make their mistakes *different*, the average cancels
 * the noise and keeps the signal — a boundary far smoother and steadier than any one tree.
 * Verified against scikit-learn's RandomForestClassifier (behaviourally — both are random,
 * so the contract is matching test accuracy and the variance-reduction trend, not the
 * exact ensemble).
 */

import {
  bootstrapSample,
  buildTree,
  predictProbaTree,
  seededRng,
  type TreeNode,
  type TreePoint,
} from "@/lib/models/decision-tree";

export type Forest = TreeNode[];

export type ForestOptions = {
  /** How many trees to average. More trees → lower variance, diminishing returns. */
  nTrees: number;
  /** Depth cap per tree (default: grown out — averaging, not pruning, controls variance). */
  maxDepth?: number;
  /** Features considered per split (default 1 of 2 — the "random" in random forest). */
  maxFeatures?: number;
  /** Seed for the whole ensemble's bootstraps + feature bags. */
  seed?: number;
};

/** Grow the ensemble: each tree on its own seeded bootstrap, with per-split feature bags. */
export function buildForest(points: TreePoint[], opts: ForestOptions): Forest {
  const { nTrees, maxDepth, maxFeatures = 1, seed = 1 } = opts;
  const trees: Forest = [];
  for (let i = 0; i < nTrees; i++) {
    const s = (seed * 100003 + i * 9176) | 0;
    const sample = bootstrapSample(points, s);
    trees.push(buildTree(sample, { maxDepth, maxFeatures, rng: seededRng(s ^ 0x9e3779b9) }));
  }
  return trees;
}

/** The forest's vote: the mean of its trees' class-1 probabilities. */
export function forestProba(forest: Forest, x1: number, x2: number): number {
  if (forest.length === 0) return 0;
  let s = 0;
  for (const t of forest) s += predictProbaTree(t, x1, x2);
  return s / forest.length;
}

export const forestPredict = (forest: Forest, x1: number, x2: number): 0 | 1 =>
  forestProba(forest, x1, x2) >= 0.5 ? 1 : 0;

export const forestAccuracy = (points: TreePoint[], forest: Forest): number =>
  points.length === 0
    ? 0
    : points.reduce((n, p) => n + (forestPredict(forest, p.x1, p.x2) === p.y ? 1 : 0), 0) /
      points.length;

/**
 * How rough the decision boundary is — the share of a grid whose vote disagrees with a
 * neighbour. A single deep tree's staircase scores high (lots of little flips); the
 * forest's averaged field is smoother, so it scores lower. The number behind "the forest
 * smooths the boundary."
 */
export function boundaryRoughness(
  proba: (x1: number, x2: number) => number,
  domain: [number, number],
  res = 40,
): number {
  const [d0, d1] = domain;
  const at = (i: number) => d0 + ((d1 - d0) * (i + 0.5)) / res;
  const label = (i: number, j: number) => (proba(at(i), at(j)) >= 0.5 ? 1 : 0);
  let edges = 0;
  let flips = 0;
  for (let j = 0; j < res; j++) {
    for (let i = 0; i < res; i++) {
      const c = label(i, j);
      if (i + 1 < res) {
        edges++;
        if (label(i + 1, j) !== c) flips++;
      }
      if (j + 1 < res) {
        edges++;
        if (label(i, j + 1) !== c) flips++;
      }
    }
  }
  return edges === 0 ? 0 : flips / edges;
}
