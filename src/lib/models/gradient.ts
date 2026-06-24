/**
 * The gradient, on a 2-D landscape. The gradient ∇f = (∂f/∂x, ∂f/∂y) is the vector
 * that points in the direction of steepest *ascent*; its length is the slope in that
 * direction; and it is always perpendicular to the level curve (contour) through the
 * point. Gradient descent walks the other way, −∇f. We use a fixed analytic landscape
 * (a sum of Gaussian hills) so the gradient is exact, not estimated — and verifiable.
 */

export type Vec2 = { x: number; y: number };

/** A Gaussian hill of height `h` centred at (cx, cy) with spread `s`. */
type Hill = { h: number; cx: number; cy: number; s: number };

const HILLS: Hill[] = [
  { h: 1.5, cx: 1.5, cy: 1.2, s: 1.6 }, // the taller, global summit
  { h: 1.1, cx: -1.6, cy: -1.3, s: 1.4 }, // a lower, separate summit — the local-max trap
];

const g = (hill: Hill, x: number, y: number) =>
  hill.h * Math.exp(-(((x - hill.cx) ** 2 + (y - hill.cy) ** 2) / (2 * hill.s)));

/** Height of the landscape at (x, y). */
export function surface(x: number, y: number): number {
  return HILLS.reduce((s, hill) => s + g(hill, x, y), 0);
}

/** The gradient ∇f at (x, y) — analytic. ∂/∂x of a Gaussian hill is g·(−(x−cx)/s). */
export function gradient(x: number, y: number): Vec2 {
  let gx = 0;
  let gy = 0;
  for (const hill of HILLS) {
    const gv = g(hill, x, y);
    gx += gv * (-(x - hill.cx) / hill.s);
    gy += gv * (-(y - hill.cy) / hill.s);
  }
  return { x: gx, y: gy };
}

export const magnitude = (v: Vec2): number => Math.hypot(v.x, v.y);

/** The unit direction of a vector (zero stays zero). */
export function unit(v: Vec2): Vec2 {
  const m = magnitude(v);
  return m < 1e-12 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
}

/** The two hill summits, exposed so a run can be classified as "the global peak" or
 * "a lower local peak". (The summit shifts slightly from the Gaussian centre because
 * the other hill's tail tilts it, but it stays within this neighbourhood.) */
export const PEAKS = HILLS.map((h) => ({ cx: h.cx, cy: h.cy, height: h.h }));

/**
 * Greedy gradient ascent from a start point: step along +∇f until the gradient
 * vanishes (a summit) or the step budget runs out. Returns the path walked and where
 * it settled — the whole point being that it climbs whichever hill it started under,
 * not the tallest one.
 */
export function ascend(start: Vec2, eta = 0.4, maxSteps = 300): { path: Vec2[]; settled: Vec2 } {
  let p = start;
  const path: Vec2[] = [p];
  for (let i = 0; i < maxSteps; i++) {
    const g = gradient(p.x, p.y);
    if (magnitude(g) < 5e-4) break;
    p = { x: p.x + eta * g.x, y: p.y + eta * g.y };
    path.push(p);
  }
  return { path, settled: p };
}
