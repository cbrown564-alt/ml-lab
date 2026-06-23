import type { Scored } from "@/lib/models/classification-metrics";

/**
 * A deliberately imbalanced scored set for the Break-it lab: 57 negatives, 3
 * positives (5% positive — fraud, rare disease, the usual). The negatives' scores sit
 * low; the three positives score moderately, above most negatives but below ½. So at
 * the default ½ threshold the model calls everything negative — 95% accuracy, zero
 * recall — and only lowering the threshold catches the rare positives. Deterministic.
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

export const imbalancedScored: Scored[] = (() => {
  const rng = mulberry32(11);
  const neg: Scored[] = Array.from({ length: 57 }, () => ({
    // concentrated low, a few creeping toward the middle
    prob: Math.round(rng() ** 1.8 * 0.42 * 1000) / 1000,
    y: 0 as const,
  }));
  const pos: Scored[] = [0.33, 0.42, 0.48].map((prob) => ({ prob, y: 1 as const }));
  return [...neg, ...pos].sort((a, b) => a.prob - b.prob);
})();
