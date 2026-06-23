import type { LabeledPoint } from "@/lib/models/logistic";

/**
 * A two-class dataset whose true boundary is a tilted line — it depends on BOTH features
 * together (class 1 where x1 + 1.3·x2 clears a threshold). A hand-written rule that
 * watches a single feature (a vertical cut on x1) can only do so well; learning from the
 * labelled examples discovers how to weigh both features and does far better. That gap is
 * the whole point: the machine finds a rule you wouldn't have hand-tuned.
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
const round2 = (v: number) => Math.round(v * 100) / 100;

export const whatIsMlData: LabeledPoint[] = (() => {
  const rng = mulberry32(13);
  return Array.from({ length: 64 }, () => {
    const x1 = round2((rng() - 0.5) * 5.2);
    const x2 = round2((rng() - 0.5) * 5.2);
    const margin = x1 + 1.3 * x2 + (rng() - 0.5) * 1.6; // true rule + noise
    return { x1, x2, y: (margin > 0.4 ? 1 : 0) as 0 | 1 };
  });
})();

/** A hand-written rule that watches a single feature: predict class 1 when x1 > t. */
export const ruleAccuracy = (points: LabeledPoint[], t: number): number =>
  points.filter((p) => (p.x1 > t ? 1 : 0) === p.y).length / points.length;

/** The best a single-feature threshold rule can do, by scanning t. */
export function bestRuleAccuracy(points: LabeledPoint[]): { t: number; acc: number } {
  let best = { t: 0, acc: 0 };
  for (let t = -3; t <= 3; t += 0.1) {
    const acc = ruleAccuracy(points, t);
    if (acc > best.acc) best = { t: round2(t), acc };
  }
  return best;
}

export const whatIsMlScenario = {
  id: "rule-vs-learn",
  title: "Write the rule, or learn it",
  prompt:
    "Two kinds of point, and a rule to tell them apart. First be the programmer: drag the threshold to hand-write a rule — class 1 to the right of the line. You'll get part way. Then press Learn from the examples and watch the machine fit a rule that weighs both features at once — the boundary tilts, and it beats your best hand-tuned cut.",
};
