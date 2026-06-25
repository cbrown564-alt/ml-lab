import type { DescentStep } from "@/lib/models/linear-regression";
import type { LossSurfaceGrid } from "@/lib/viz/loss-surface";

/** Axis-deformation morph between two loss surfaces (feature scaling pilot). */
export function lerpRange(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export function lerpGrids(from: LossSurfaceGrid, to: LossSurfaceGrid, t: number): LossSurfaceGrid {
  const { cols, rows } = from;
  const values = new Float64Array(cols * rows);
  for (let i = 0; i < values.length; i++) {
    values[i] = from.values[i] + (to.values[i] - from.values[i]) * t;
  }
  return {
    slopeRange: lerpRange(from.slopeRange, to.slopeRange, t),
    interceptRange: lerpRange(from.interceptRange, to.interceptRange, t),
    cols,
    rows,
    values,
    minimum: {
      slope: from.minimum.slope + (to.minimum.slope - from.minimum.slope) * t,
      intercept: from.minimum.intercept + (to.minimum.intercept - from.minimum.intercept) * t,
    },
  };
}

/** Counterfactual replay: morph the descent path as the surface rounds out. */
export function morphDescentTrace(
  from: ReadonlyArray<DescentStep>,
  to: ReadonlyArray<DescentStep>,
  t: number,
): DescentStep[] {
  if (from.length === 0) return [...to];
  if (to.length === 0) return [...from];
  const fromLast = from.length - 1;
  const toLast = to.length - 1;
  const fromC = Math.round(t * fromLast);
  const toC = Math.round(t * toLast);
  const steps = Math.max(fromC, toC) + 1;
  const out: DescentStep[] = [];
  for (let i = 0; i < steps; i++) {
    const u = steps <= 1 ? 1 : i / (steps - 1);
    const fi = Math.min(fromLast, Math.round(u * fromC));
    const ti = Math.min(toLast, Math.round(u * toC));
    const fp = from[fi].params;
    const tp = to[ti].params;
    const fg = from[fi].gradient;
    const tg = to[ti].gradient;
    out.push({
      step: i,
      params: {
        slope: fp.slope + (tp.slope - fp.slope) * t,
        intercept: fp.intercept + (tp.intercept - fp.intercept) * t,
      },
      loss: from[fi].loss + (to[ti].loss - from[fi].loss) * t,
      gradient: {
        dSlope: fg.dSlope + (tg.dSlope - fg.dSlope) * t,
        dIntercept: fg.dIntercept + (tg.dIntercept - fg.dIntercept) * t,
      },
    });
  }
  return out;
}
