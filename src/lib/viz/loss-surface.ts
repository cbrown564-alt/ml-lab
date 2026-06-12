import { mse, olsFit, type Point } from "@/lib/models/linear-regression";

/**
 * The loss surface as data (docs/06, B3/B6): MSE sampled over a
 * (slope, intercept) window around the OLS minimum — the territory the
 * descent walks. Values are log10-normalized to [0, 1] because the
 * interesting structure spans decades; the view layer only paints.
 */

export type LossSurfaceGrid = {
  /** Sampled slope/intercept windows, centered on the OLS valley floor. */
  slopeRange: [number, number];
  interceptRange: [number, number];
  cols: number;
  rows: number;
  /** Row-major, rows go from interceptRange[0] upward; values in [0, 1]. */
  values: Float64Array;
  /** The valley floor — where the descent is headed. */
  minimum: { slope: number; intercept: number };
};

export const SLOPE_HALF_WINDOW = 4;
export const INTERCEPT_HALF_WINDOW = 20;

export function lossSurfaceGrid(
  points: Point[],
  cols = 110,
  rows = 80,
): LossSurfaceGrid {
  const minimum = olsFit(points);
  const slopeRange: [number, number] = [
    minimum.slope - SLOPE_HALF_WINDOW,
    minimum.slope + SLOPE_HALF_WINDOW,
  ];
  const interceptRange: [number, number] = [
    minimum.intercept - INTERCEPT_HALF_WINDOW,
    minimum.intercept + INTERCEPT_HALF_WINDOW,
  ];

  const values = new Float64Array(cols * rows);
  let lo = Infinity;
  let hi = -Infinity;
  for (let r = 0; r < rows; r++) {
    const intercept =
      interceptRange[0] +
      ((interceptRange[1] - interceptRange[0]) * (r + 0.5)) / rows;
    for (let c = 0; c < cols; c++) {
      const slope =
        slopeRange[0] + ((slopeRange[1] - slopeRange[0]) * (c + 0.5)) / cols;
      // log10(loss + 1): keeps decades readable and the floor finite.
      const v = Math.log10(mse(points, { slope, intercept }) + 1);
      values[r * cols + c] = v;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  const span = hi - lo || 1;
  for (let i = 0; i < values.length; i++) values[i] = (values[i] - lo) / span;

  return { slopeRange, interceptRange, cols, rows, values, minimum };
}
