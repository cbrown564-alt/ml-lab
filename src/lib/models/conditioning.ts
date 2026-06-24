import { type Point } from "@/lib/models/linear-regression";

/**
 * The maths behind feature scaling. Gradient descent's difficulty is set by the
 * *conditioning* of the loss surface — the ratio of its steepest to shallowest
 * curvature. For least squares the curvature is the Hessian of the (slope,
 * intercept) loss, H = (2/n)·[[Σx², Σx], [Σx, n]]. Uncentred, large-scale x makes
 * Σx² ≫ n and Σx ≠ 0, so the bowl is steep one way, shallow the other, and tilted
 * — descent zig-zags down the narrow valley and the stable step size is tiny.
 * Standardising x (mean 0, variance 1) makes H = 2·I: a round bowl, condition
 * number 1, and a step size an order of magnitude larger. Same data, same model —
 * a kinder surface to walk.
 */

export type HessianEigs = { lambdaMax: number; lambdaMin: number };

/** Eigenvalues of the OLS (slope, intercept) Hessian — the curvatures along the
 * bowl's principal axes. */
export function olsHessianEigs(points: Point[]): HessianEigs {
  const n = points.length;
  if (n === 0) return { lambdaMax: 0, lambdaMin: 0 };
  let sx2 = 0;
  let sx = 0;
  for (const p of points) {
    sx2 += p.x * p.x;
    sx += p.x;
  }
  const a = (2 / n) * sx2;
  const b = (2 / n) * sx;
  const d = 2;
  const mid = (a + d) / 2;
  const spread = Math.sqrt(((a - d) / 2) ** 2 + b * b);
  return { lambdaMax: mid + spread, lambdaMin: Math.max(mid - spread, 1e-12) };
}

/** How stretched the bowl is — λmax/λmin. 1 is a perfect round bowl; large is a
 * long, thin, hard-to-walk valley. */
export const conditionNumber = (points: Point[]): number => {
  const { lambdaMax, lambdaMin } = olsHessianEigs(points);
  return lambdaMax / lambdaMin;
};

/** The largest stable learning rate for this surface (just under the 2/λmax
 * cliff). A round bowl tolerates a big confident step; a stretched one forces a
 * tiny one — which is exactly why scaling lets descent arrive sooner. */
export const stableLearningRate = (points: Point[]): number =>
  1.8 / (olsHessianEigs(points).lambdaMax || 1);

/** Standardise x to mean 0, variance 1 (y unchanged): the move that rounds the
 * bowl. */
export function standardizeX(points: Point[]): Point[] {
  const n = points.length;
  if (n === 0) return [];
  const mean = points.reduce((s, p) => s + p.x, 0) / n;
  const std = Math.sqrt(points.reduce((s, p) => s + (p.x - mean) ** 2, 0) / n) || 1;
  return points.map((p) => ({ x: (p.x - mean) / std, y: p.y }));
}
