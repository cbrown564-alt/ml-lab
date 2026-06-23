import type { LabeledPoint } from "@/lib/models/logistic";

/**
 * The XOR dataset — the canonical not-linearly-separable problem, generated
 * deterministically so the Break-it lab is reproducible. Class 1 sits in two opposite
 * corners (top-right, bottom-left), class 0 in the other two. No straight line
 * separates them — but adding the single feature x₁·x₂ does, because its sign is
 * exactly the XOR. The raw map gives a linear classifier a straight line; the expanded
 * map gives it a curve.
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

function gauss(rng: () => number, mean: number, sd: number): number {
  const u = Math.max(1e-9, rng());
  const v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const xorPoints: LabeledPoint[] = (() => {
  const rng = mulberry32(7);
  const centres: { cx: number; cy: number; y: 0 | 1 }[] = [
    { cx: 1.3, cy: 1.3, y: 1 },
    { cx: -1.3, cy: -1.3, y: 1 },
    { cx: 1.3, cy: -1.3, y: 0 },
    { cx: -1.3, cy: 1.3, y: 0 },
  ];
  const pts: LabeledPoint[] = [];
  for (const c of centres) {
    for (let i = 0; i < 9; i++) {
      pts.push({
        x1: Math.round(gauss(rng, c.cx, 0.5) * 1000) / 1000,
        x2: Math.round(gauss(rng, c.cy, 0.5) * 1000) / 1000,
        y: c.y,
      });
    }
  }
  return pts;
})();

/** Feature maps: a leading-1 bias column, then the raw coordinates, plus — in the
 * expanded map — the interaction term x₁·x₂ that cracks XOR. */
export const rawRow = (p: LabeledPoint): number[] => [1, p.x1, p.x2];
export const expandedRow = (p: LabeledPoint): number[] => [1, p.x1, p.x2, p.x1 * p.x2];
