import type { Point } from "@/lib/models/linear-regression";

/**
 * Train/test experiment data: one pool of 60 points from a smooth target (sin) plus
 * noise, generated deterministically. 60 is large enough that the holdout can range
 * from a tiny handful to half the data, so the small-split lottery — a few test points
 * give a wildly noisy score, many give a stable one — is dramatic and the test-error
 * spread shrinks cleanly as the holdout grows. The model is fixed: a lightly-ridged
 * degree-5 polynomial, flexible enough that the train/test gap is real but stable even
 * on a smaller training set — so the only thing the learner changes is the split.
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
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}
const round3 = (v: number) => Math.round(v * 1000) / 1000;

export const pooledPoints: Point[] = (() => {
  const rng = mulberry32(3);
  return Array.from({ length: 60 }, () => {
    const x = round3(rng());
    return { x, y: round3(Math.sin(1.5 * Math.PI * x) + gauss(rng) * 0.2) };
  });
})();

export const TT_DEGREE = 5;
export const TT_LAMBDA = 0.01;

export const trainTestScenario = {
  id: "the-split",
  title: "Score it on what it hasn't seen",
  prompt:
    "Here is one pool of points. The model is fit on the gold training points and scored on the hollow held-out ones — an honest validation score. Press Reshuffle to draw a new random split and watch the validation error jump around while the training error barely moves: a single split is a lottery. Then read the cross-validation score, which averages over every fold to pin the number down.",
};
