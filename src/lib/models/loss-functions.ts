import { olsFit, type LinearParams, type Point } from "@/lib/models/linear-regression";

/**
 * Loss functions for linear fitting (the loss-functions exhibit). The exhibit's
 * one claim: the *judge* — the loss — decides the verdict. Squared error (OLS)
 * punishes a miss by its square, so a few far points dominate and the line chases
 * them; absolute error (L1) and Huber grow gently in the tail, so they hold the
 * bulk trend. Same data, three judges, three lines.
 *
 * OLS has a closed form (lib/models/linear-regression). L1 and Huber don't, so we
 * fit them by **IRLS** (iteratively reweighted least squares): refit weighted OLS,
 * reweighting each point by how its loss grows, until it settles. Verified against
 * an independent optimiser (scipy.optimize on the exact objectives) in the tests.
 */

/** Huber's crossover: misses within δ are squared (treated as noise), beyond it
 * linear (treated as outliers). Shared with the fixture generator. */
export const HUBER_DELTA = 2.0;

const EPS = 1e-9;

/** Per-point penalty each loss assigns a residual r — the curves the exhibit draws. */
export const squaredPenalty = (r: number): number => r * r;
export const absPenalty = (r: number): number => Math.abs(r);
export const huberPenalty = (r: number, delta = HUBER_DELTA): number => {
  const a = Math.abs(r);
  return a <= delta ? 0.5 * r * r : delta * (a - 0.5 * delta);
};

const residuals = (points: Point[], fit: LinearParams): number[] =>
  points.map((p) => p.y - (fit.slope * p.x + fit.intercept));

const mean = (xs: number[]): number =>
  xs.length === 0 ? 0 : xs.reduce((s, v) => s + v, 0) / xs.length;

/** Mean loss under each judge, at a given fit. */
export const meanAbsError = (points: Point[], fit: LinearParams): number =>
  mean(residuals(points, fit).map(absPenalty));
export const meanHuber = (points: Point[], fit: LinearParams, delta = HUBER_DELTA): number =>
  mean(residuals(points, fit).map((r) => huberPenalty(r, delta)));

/** Weighted least squares — the closed-form fit the IRLS loop refits each round. */
export function weightedOlsFit(points: Point[], weights: number[]): LinearParams {
  let sw = 0,
    swx = 0,
    swy = 0;
  for (let i = 0; i < points.length; i++) {
    sw += weights[i];
    swx += weights[i] * points[i].x;
    swy += weights[i] * points[i].y;
  }
  if (sw === 0) return { slope: 0, intercept: 0 };
  const mx = swx / sw;
  const my = swy / sw;
  let num = 0,
    den = 0;
  for (let i = 0; i < points.length; i++) {
    num += weights[i] * (points[i].x - mx) * (points[i].y - my);
    den += weights[i] * (points[i].x - mx) * (points[i].x - mx);
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

/** IRLS: refit weighted OLS, reweighting by how each point's loss grows, until it
 * settles. Starts from the OLS fit (the squared-error answer) and walks to the
 * robust one. */
function irls(
  points: Point[],
  weight: (r: number) => number,
  iters = 200,
): LinearParams {
  let fit = olsFit(points);
  for (let i = 0; i < iters; i++) {
    const w = residuals(points, fit).map((r) => weight(r));
    const next = weightedOlsFit(points, w);
    if (Math.abs(next.slope - fit.slope) < 1e-10 && Math.abs(next.intercept - fit.intercept) < 1e-10) {
      return next;
    }
    fit = next;
  }
  return fit;
}

/** Least-absolute-deviations fit (minimises mean |r|): the IRLS weight is 1/|r|,
 * so far points pull *less*, not more — the opposite of squared error. */
export const maeFit = (points: Point[]): LinearParams =>
  irls(points, (r) => 1 / Math.max(Math.abs(r), EPS));

/** Huber fit: squared-error weight (1) for inliers, down-weighted (δ/|r|) for the
 * outliers beyond δ — squared in the middle, robust in the tail. */
export const huberFit = (points: Point[], delta = HUBER_DELTA): LinearParams =>
  irls(points, (r) => (Math.abs(r) <= delta ? 1 : delta / Math.max(Math.abs(r), EPS)));

/** The three judges, keyed for the experiment spec + viz. */
export type LossKind = "squared" | "absolute" | "huber";

export const fitUnder = (kind: LossKind, points: Point[]): LinearParams =>
  kind === "squared" ? olsFit(points) : kind === "absolute" ? maeFit(points) : huberFit(points);

export const penaltyOf = (kind: LossKind, r: number): number =>
  kind === "squared" ? squaredPenalty(r) : kind === "absolute" ? absPenalty(r) : huberPenalty(r);
