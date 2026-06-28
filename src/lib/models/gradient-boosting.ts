/**
 * Gradient boosting — the other way to build a forest, and the opposite of bagging. Where
 * a random forest grows independent trees in parallel and averages them to cut variance,
 * boosting grows shallow trees in sequence, each one fit to the mistakes the ensemble has
 * made so far, to cut bias. For binary classification it is gradient descent on the
 * log-loss in function space: at each round, compute the negative gradient (the residual
 * y − p), fit a small regression tree to it, and take a shrunken step (the learning rate)
 * in that direction. Powerful — a few stumps already beat a single deep tree — and, unlike
 * a forest, able to overfit: too many rounds or too large a step and it memorises.
 * Verified against scikit-learn's GradientBoostingClassifier.
 */

import type { TreePoint } from "@/lib/models/decision-tree";

const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z));
const feat = (p: TreePoint, f: 0 | 1): number => (f === 0 ? p.x1 : p.x2);

// ---- a least-squares regression tree, fit to continuous residuals -----------

type RegLeaf = { kind: "leaf"; value: number; idx: number[] };
type RegSplit = { kind: "split"; feature: 0 | 1; threshold: number; left: RegNode; right: RegNode };
export type RegNode = RegLeaf | RegSplit;

const sse = (idx: number[], t: number[]): number => {
  let s = 0;
  let sq = 0;
  for (const i of idx) {
    s += t[i];
    sq += t[i] * t[i];
  }
  return idx.length === 0 ? 0 : sq - (s * s) / idx.length;
};

const meanOf = (idx: number[], t: number[]): number => {
  if (idx.length === 0) return 0;
  let s = 0;
  for (const i of idx) s += t[i];
  return s / idx.length;
};

/** Grow a regression tree that splits on squared-error reduction (the CART regression
 * criterion). Leaves hold their training indices so boosting can replace the mean with a
 * Newton step. */
export function buildRegressionTree(
  X: TreePoint[],
  target: number[],
  idx: number[],
  depth: number,
  maxDepth: number,
  minLeaf = 1,
): RegNode {
  const n = idx.length;
  if (depth >= maxDepth || n < 2 * minLeaf) return { kind: "leaf", value: meanOf(idx, target), idx };

  const parent = sse(idx, target);
  let best: { feature: 0 | 1; threshold: number; childSse: number } | null = null;

  for (const feature of [0, 1] as const) {
    const sorted = [...idx].sort((a, b) => feat(X[a], feature) - feat(X[b], feature));
    let total = 0;
    let totalSq = 0;
    for (const i of idx) {
      total += target[i];
      totalSq += target[i] * target[i];
    }
    let sumL = 0;
    let sumSqL = 0;
    for (let s = 1; s < n; s++) {
      const prev = sorted[s - 1];
      sumL += target[prev];
      sumSqL += target[prev] * target[prev];
      const vPrev = feat(X[prev], feature);
      const vHere = feat(X[sorted[s]], feature);
      if (vHere === vPrev) continue;
      const nL = s;
      const nR = n - s;
      if (nL < minLeaf || nR < minLeaf) continue;
      const sseL = sumSqL - (sumL * sumL) / nL;
      const sseR = totalSq - sumSqL - ((total - sumL) * (total - sumL)) / nR;
      const childSse = sseL + sseR;
      if (childSse < parent - 1e-12 && (best === null || childSse < best.childSse - 1e-12)) {
        best = { feature, threshold: (vPrev + vHere) / 2, childSse };
      }
    }
  }

  if (!best) return { kind: "leaf", value: meanOf(idx, target), idx };
  const leftIdx: number[] = [];
  const rightIdx: number[] = [];
  for (const i of idx) (feat(X[i], best.feature) <= best.threshold ? leftIdx : rightIdx).push(i);
  return {
    kind: "split",
    feature: best.feature,
    threshold: best.threshold,
    left: buildRegressionTree(X, target, leftIdx, depth + 1, maxDepth, minLeaf),
    right: buildRegressionTree(X, target, rightIdx, depth + 1, maxDepth, minLeaf),
  };
}

export function predictReg(node: RegNode, x1: number, x2: number): number {
  let n = node;
  while (n.kind === "split") n = (n.feature === 0 ? x1 : x2) <= n.threshold ? n.left : n.right;
  return n.value;
}

function leavesOf(node: RegNode, out: RegLeaf[] = []): RegLeaf[] {
  if (node.kind === "leaf") out.push(node);
  else {
    leavesOf(node.left, out);
    leavesOf(node.right, out);
  }
  return out;
}

// ---- the boosted classifier -------------------------------------------------

export type Booster = { F0: number; trees: RegNode[]; lr: number };

export type BoostOptions = {
  /** Number of boosting rounds (trees added in sequence). The overfitting knob. */
  nRounds: number;
  /** Depth of each weak learner — boosting uses shallow trees (sklearn default 3). */
  maxDepth?: number;
  /** Shrinkage: how big a step to take per tree. Smaller is safer but slower. */
  lr?: number;
};

/**
 * Fit a gradient-boosting classifier on the log-loss. Each round fits a regression tree to
 * the residual y − p (the negative gradient), refines the leaf values with a Newton step
 * (sklearn's TreeBoost for log-loss), and adds a shrunken copy to the running score.
 */
export function fitBooster(points: TreePoint[], opts: BoostOptions): Booster {
  const { nRounds, maxDepth = 3, lr = 0.3 } = opts;
  const y = points.map((p) => p.y);
  const n = points.length;
  const pbar = Math.min(1 - 1e-6, Math.max(1e-6, y.reduce((a, b) => a + b, 0) / n));
  const F0 = Math.log(pbar / (1 - pbar)); // log-odds of the base rate
  const F = new Array<number>(n).fill(F0);
  const allIdx = points.map((_, i) => i);
  const trees: RegNode[] = [];

  for (let m = 0; m < nRounds; m++) {
    const p = F.map(sigmoid);
    const residual = y.map((yi, i) => yi - p[i]); // negative gradient of log-loss
    const tree = buildRegressionTree(points, residual, allIdx, 0, maxDepth);
    // Newton leaf update: γ = Σ residual / Σ p(1−p) over the leaf's points.
    for (const leaf of leavesOf(tree)) {
      let num = 0;
      let den = 0;
      for (const i of leaf.idx) {
        num += residual[i];
        den += p[i] * (1 - p[i]);
      }
      leaf.value = num / (den + 1e-12);
    }
    for (let i = 0; i < n; i++) F[i] += lr * predictReg(tree, points[i].x1, points[i].x2);
    trees.push(tree);
  }
  return { F0, trees, lr };
}

/** The boosted score F(x) = F₀ + lr · Σ treeₘ(x) — using the first `rounds` trees (default all). */
export function boosterScore(b: Booster, x1: number, x2: number, rounds?: number): number {
  const k = rounds ?? b.trees.length;
  let s = b.F0;
  for (let m = 0; m < k; m++) s += b.lr * predictReg(b.trees[m], x1, x2);
  return s;
}

export const boosterProba = (b: Booster, x1: number, x2: number, rounds?: number): number =>
  sigmoid(boosterScore(b, x1, x2, rounds));

export const boosterPredict = (b: Booster, x1: number, x2: number, rounds?: number): 0 | 1 =>
  boosterProba(b, x1, x2, rounds) >= 0.5 ? 1 : 0;

export const boosterAccuracy = (points: TreePoint[], b: Booster, rounds?: number): number =>
  points.length === 0
    ? 0
    : points.reduce((nc, p) => nc + (boosterPredict(b, p.x1, p.x2, rounds) === p.y ? 1 : 0), 0) /
      points.length;

/** Mean log-loss over the points, using the first `rounds` trees — the curve boosting drives down. */
export function boosterLogLoss(points: TreePoint[], b: Booster, rounds?: number): number {
  if (points.length === 0) return 0;
  let s = 0;
  for (const pt of points) {
    const q = Math.min(1 - 1e-12, Math.max(1e-12, boosterProba(b, pt.x1, pt.x2, rounds)));
    s += -(pt.y * Math.log(q) + (1 - pt.y) * Math.log(1 - q));
  }
  return s / points.length;
}
