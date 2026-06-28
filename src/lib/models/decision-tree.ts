/**
 * A CART classification tree — the model that bends without being told how to. Where
 * logistic regression draws one straight boundary, a tree asks a sequence of plain
 * yes/no questions about single features ("is x₁ ≤ 0.4?"), each one cutting the plane
 * with an axis-aligned line, and recurses on the two halves. The result is a staircase
 * of rectangular regions that can chase any curve — and, left to grow, can box in every
 * noisy point. Greedy, Gini-impurity splits; verified against scikit-learn's CART.
 */

export type TreePoint = { x1: number; x2: number; y: 0 | 1 };

/** A fitted tree node: either a leaf with a class probability, or an axis-aligned
 * split (go left when feature ≤ threshold, the scikit-learn convention). */
export type TreeNode =
  | {
      kind: "leaf";
      /** P(class 1) — the fraction of class-1 training points that landed here. */
      prob1: number;
      n: number;
      /** [n class-0, n class-1] training points in this leaf. */
      counts: [number, number];
      gini: number;
    }
  | {
      kind: "split";
      /** 0 → x₁, 1 → x₂. */
      feature: 0 | 1;
      threshold: number;
      n: number;
      gini: number;
      left: TreeNode;
      right: TreeNode;
    };

export type TreeOptions = {
  /** Cap on the number of question levels. The complexity knob. */
  maxDepth?: number;
  /** A split must leave at least this many points in each child (CART default 1). */
  minSamplesLeaf?: number;
  /** A node needs at least this many points to be split at all (CART default 2). */
  minSamplesSplit?: number;
  /** How many features a split may consider at each node (default: all). Set to 1 with
   * an `rng` to grow the decorrelated trees a *random* forest is built from. */
  maxFeatures?: number;
  /** Seeded RNG used only when maxFeatures restricts the per-node feature subset. */
  rng?: () => number;
};

const featAt = (p: TreePoint, f: 0 | 1): number => (f === 0 ? p.x1 : p.x2);

/** Gini impurity 1 − Σ pₖ² — zero when a node is pure, ½ at a 50/50 mix. */
export function gini(points: TreePoint[]): number {
  const n = points.length;
  if (n === 0) return 0;
  let ones = 0;
  for (const p of points) ones += p.y;
  const p1 = ones / n;
  const p0 = 1 - p1;
  return 1 - (p0 * p0 + p1 * p1);
}

function leaf(points: TreePoint[]): TreeNode {
  const n = points.length;
  let ones = 0;
  for (const p of points) ones += p.y;
  return {
    kind: "leaf",
    n,
    counts: [n - ones, ones],
    prob1: n === 0 ? 0 : ones / n,
    gini: gini(points),
  };
}

type Candidate = { feature: 0 | 1; threshold: number; impurity: number };

/** The best Gini-reducing axis-aligned split, or null if none improves on the node.
 * Mirrors scikit-learn's "best" splitter: thresholds at the midpoint between
 * consecutive distinct sorted values, weighted child impurity minimised. */
function bestSplit(
  points: TreePoint[],
  minLeaf: number,
  features: readonly (0 | 1)[] = [0, 1],
): Candidate | null {
  const n = points.length;
  const parent = gini(points);
  const total = sumOnes(points);
  let best: Candidate | null = null;

  for (const feature of features) {
    const sorted = [...points].sort((a, b) => featAt(a, feature) - featAt(b, feature));
    let onesL = 0; // class-1 count to the left of the running threshold, one pass
    for (let i = 1; i < n; i++) {
      onesL += sorted[i - 1].y;
      const vPrev = featAt(sorted[i - 1], feature);
      const vHere = featAt(sorted[i], feature);
      if (vHere === vPrev) continue; // no threshold between equal values
      const nL = i;
      const nR = n - i;
      if (nL < minLeaf || nR < minLeaf) continue;
      const giniL = impurity(nL, onesL);
      const giniR = impurity(nR, total - onesL);
      const weighted = (nL * giniL + nR * giniR) / n;
      // Strictly improve, and take the first (lowest-threshold, feature-0-first) best.
      if (weighted < parent - 1e-12 && (best === null || weighted < best.impurity - 1e-12)) {
        best = { feature, threshold: (vPrev + vHere) / 2, impurity: weighted };
      }
    }
  }
  return best;
}

const impurity = (n: number, ones: number): number => {
  const p1 = ones / n;
  return 1 - (p1 * p1 + (1 - p1) * (1 - p1));
};

function sumOnes(points: TreePoint[]): number {
  let s = 0;
  for (const p of points) s += p.y;
  return s;
}

/** Pick which features a split may consider at one node. With maxFeatures ≥ all (or no
 * rng) this is both features — the deterministic CART. With maxFeatures = 1 and a seeded
 * rng it's a random single feature, which is what turns bagging into a *random* forest. */
function pickFeatures(maxFeatures: number, rng?: () => number): readonly (0 | 1)[] {
  if (!rng || maxFeatures >= 2) return [0, 1];
  if (maxFeatures <= 1) return [(rng() < 0.5 ? 0 : 1) as 0 | 1];
  return [0, 1];
}

/** Grow a CART tree greedily, splitting on the largest Gini reduction at each node. */
export function buildTree(points: TreePoint[], opts: TreeOptions = {}): TreeNode {
  const maxDepth = opts.maxDepth ?? Infinity;
  const minLeaf = opts.minSamplesLeaf ?? 1;
  const minSplit = opts.minSamplesSplit ?? 2;
  const maxFeatures = opts.maxFeatures ?? 2;
  const rng = opts.rng;

  const grow = (pts: TreePoint[], depth: number): TreeNode => {
    if (depth >= maxDepth || pts.length < minSplit || gini(pts) === 0) return leaf(pts);
    const split = bestSplit(pts, minLeaf, pickFeatures(maxFeatures, rng));
    if (!split) return leaf(pts);
    const left: TreePoint[] = [];
    const right: TreePoint[] = [];
    for (const p of pts) {
      if (featAt(p, split.feature) <= split.threshold) left.push(p);
      else right.push(p);
    }
    return {
      kind: "split",
      feature: split.feature,
      threshold: split.threshold,
      n: pts.length,
      gini: gini(pts),
      left: grow(left, depth + 1),
      right: grow(right, depth + 1),
    };
  };

  return grow(points, 0);
}

/** Walk a point down to its leaf and read off P(class 1). */
export function predictProbaTree(tree: TreeNode, x1: number, x2: number): number {
  let node = tree;
  while (node.kind === "split") {
    const v = node.feature === 0 ? x1 : x2;
    node = v <= node.threshold ? node.left : node.right;
  }
  return node.prob1;
}

export const predictTree = (tree: TreeNode, x1: number, x2: number): 0 | 1 =>
  predictProbaTree(tree, x1, x2) >= 0.5 ? 1 : 0;

export const treeAccuracy = (points: TreePoint[], tree: TreeNode): number =>
  points.length === 0
    ? 0
    : points.reduce((n, p) => n + (predictTree(tree, p.x1, p.x2) === p.y ? 1 : 0), 0) /
      points.length;

export function countLeaves(tree: TreeNode): number {
  return tree.kind === "leaf" ? 1 : countLeaves(tree.left) + countLeaves(tree.right);
}

export function treeDepth(tree: TreeNode): number {
  return tree.kind === "leaf" ? 0 : 1 + Math.max(treeDepth(tree.left), treeDepth(tree.right));
}

/** The axis-aligned rectangle each leaf owns, in feature space — the staircase the
 * tree carves, ready to draw as boxes over the plane. Splits clip the running bounds. */
export type LeafRegion = {
  x1: [number, number];
  x2: [number, number];
  prob1: number;
  n: number;
};

/** The root question, for highlighting how it moves as the data is resampled. */
export const rootSplit = (tree: TreeNode): { feature: 0 | 1; threshold: number } | null =>
  tree.kind === "split" ? { feature: tree.feature, threshold: tree.threshold } : null;

/** A small seeded PRNG (mulberry32) — reproducible bootstraps and feature bags. */
export function seededRng(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A seeded bootstrap resample — draw n points with replacement. This is the data
 * perturbation a single tree is dangerously sensitive to (resample, refit, watch the
 * cuts jump), and it is exactly the building block of bagging: a random forest is many
 * trees, each grown on one of these resamples, then averaged.
 */
export function bootstrapSample(points: TreePoint[], seed: number): TreePoint[] {
  const rng = seededRng(seed);
  const out: TreePoint[] = [];
  for (let i = 0; i < points.length; i++) out.push(points[Math.floor(rng() * points.length)]);
  return out;
}

export function leafRegions(
  tree: TreeNode,
  bounds: { x1: [number, number]; x2: [number, number] },
): LeafRegion[] {
  if (tree.kind === "leaf") {
    return [{ x1: bounds.x1, x2: bounds.x2, prob1: tree.prob1, n: tree.n }];
  }
  const { feature, threshold } = tree;
  const leftBounds = {
    x1: feature === 0 ? ([bounds.x1[0], threshold] as [number, number]) : bounds.x1,
    x2: feature === 1 ? ([bounds.x2[0], threshold] as [number, number]) : bounds.x2,
  };
  const rightBounds = {
    x1: feature === 0 ? ([threshold, bounds.x1[1]] as [number, number]) : bounds.x1,
    x2: feature === 1 ? ([threshold, bounds.x2[1]] as [number, number]) : bounds.x2,
  };
  return [...leafRegions(tree.left, leftBounds), ...leafRegions(tree.right, rightBounds)];
}
