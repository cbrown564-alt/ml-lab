import { polyMSE, ridgeFit, type Poly } from "@/lib/models/polynomial";
import type { Point } from "@/lib/models/linear-regression";

/**
 * Train/test generalisation — the methodology behind every honest model score. You
 * can't judge a model on the data it trained on; you hold some out. The training error
 * flatters (the model has seen those points); the test error is the honest one. But a
 * single split is a lottery — resample it and the test score jumps — which is why
 * cross-validation averages over many splits for a stable estimate. Reuses the
 * polynomial+ridge model from the regression cluster.
 */

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A seeded permutation of [0, n). */
export function shuffledIndices(n: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export type Split = { train: Point[]; test: Point[]; testIdx: Set<number> };

/** Partition the points into train/test by a seeded shuffle. `testFrac` of them are
 * held out. */
export function splitPoints(points: Point[], testFrac: number, seed: number): Split {
  const order = shuffledIndices(points.length, seed);
  const nTest = Math.max(1, Math.round(points.length * testFrac));
  const testIdx = new Set(order.slice(0, nTest));
  const train: Point[] = [];
  const test: Point[] = [];
  points.forEach((p, i) => (testIdx.has(i) ? test : train).push(p));
  return { train, test, testIdx };
}

export type SplitScore = { fit: Poly; trainErr: number; testErr: number };

/** Fit on the split's training points, score both train and held-out test error. */
export function scoreSplit(split: Split, degree: number): SplitScore {
  const fit = ridgeFit(split.train, degree, 0);
  return { fit, trainErr: polyMSE(split.train, fit), testErr: polyMSE(split.test, fit) };
}

export type CvResult = { foldErr: number[]; meanErr: number; sd: number };

/** k-fold cross-validation error: shuffle once, split into k folds, and for each fold
 * fit on the rest and score the held-out fold. Returns the per-fold errors, their mean
 * (the CV estimate), and their spread. */
export function kFoldCV(points: Point[], degree: number, k: number, seed: number): CvResult {
  const order = shuffledIndices(points.length, seed);
  const n = points.length;
  const foldErr: number[] = [];
  for (let f = 0; f < k; f++) {
    const lo = Math.round((f * n) / k);
    const hi = Math.round(((f + 1) * n) / k);
    const testPos = new Set(order.slice(lo, hi));
    const train: Point[] = [];
    const test: Point[] = [];
    order.forEach((origIdx, pos) => (testPos.has(pos) ? test : train).push(points[origIdx]));
    const fit = ridgeFit(train, degree, 0);
    foldErr.push(polyMSE(test, fit));
  }
  const meanErr = foldErr.reduce((s, v) => s + v, 0) / k;
  const sd = Math.sqrt(foldErr.reduce((s, v) => s + (v - meanErr) ** 2, 0) / k);
  return { foldErr, meanErr, sd };
}
