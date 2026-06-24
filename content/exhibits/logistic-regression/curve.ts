import type { LabeledPoint } from "@/lib/models/logistic";

/**
 * A curved-boundary dataset: class 0 fills a U-shaped valley below a parabola, class 1
 * sits above it. A straight line can get the middle right but is confidently wrong on
 * the parabola's rising arms, so the raw linear classifier lands around 78% with a
 * vivid (but wrong) field. Add the single feature x₁² and the boundary bends into the
 * parabola — because the parabola x₂ = a·x₁² + c is *linear* in (x₁², x₂) — separating
 * them cleanly. Generated deterministically so the Break-it lab is reproducible.
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

function gauss(rng: () => number): number {
  const u = Math.max(1e-9, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const PARABOLA = (x1: number) => 0.55 * x1 * x1 - 1.5;
const round3 = (v: number) => Math.round(v * 1000) / 1000;

export const curvePoints: LabeledPoint[] = (() => {
  const rng = mulberry32(5);
  const pts: LabeledPoint[] = [];
  for (let i = 0; i < 26; i++) {
    // class 1 — above the parabola
    const x1a = round3((rng() * 2 - 1) * 2.4);
    pts.push({ x1: x1a, x2: round3(PARABOLA(x1a) + 0.5 + Math.abs(gauss(rng)) * 0.95), y: 1 });
    // class 0 — in the valley below the parabola
    const x1b = round3((rng() * 2 - 1) * 2.4);
    pts.push({ x1: x1b, x2: round3(PARABOLA(x1b) - 0.5 - Math.abs(gauss(rng)) * 0.95), y: 0 });
  }
  return pts;
})();

/** Feature maps: a leading-1 bias column, then the raw coordinates, plus — in the
 * expanded map — the x₁² term that lets the straight boundary bend into a parabola. */
export const rawRow = (p: LabeledPoint): number[] => [1, p.x1, p.x2];
export const expandedRow = (p: LabeledPoint): number[] => [1, p.x1, p.x2, p.x1 * p.x1];
