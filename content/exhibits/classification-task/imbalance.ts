import type { Scored } from "@/lib/models/classification-metrics";

/**
 * A deliberately imbalanced scored set for the Break-it lab: 57 negatives, 3
 * positives (5% positive — fraud, rare disease, the usual). At the default ½ threshold
 * the model calls everything negative — 95% accuracy, zero recall. Crucially, a *band
 * of borderline negatives* sits among the positives' scores, so lowering the threshold
 * far enough to catch the rare positives necessarily sweeps up false positives and
 * drops accuracy below the 95% the do-nothing model got — the trade is real, not free.
 * Deterministic.
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

const round3 = (v: number) => Math.round(v * 1000) / 1000;

export const imbalancedScored: Scored[] = (() => {
  const rng = mulberry32(11);
  // 48 clearly-negative, scores concentrated low
  const negLow: Scored[] = Array.from({ length: 48 }, () => ({
    prob: round3(rng() ** 2 * 0.3),
    y: 0 as const,
  }));
  // 9 borderline negatives packed just below ½, in [0.41, 0.49] — these turn into
  // false positives the moment you lower the threshold to reach the positives, so
  // catching the 3 positives necessarily drops accuracy below the 95% baseline
  const negHigh: Scored[] = Array.from({ length: 9 }, () => ({
    prob: round3(0.41 + rng() * 0.08),
    y: 0 as const,
  }));
  // 3 positives interleaved with the borderline band, all below ½
  const pos: Scored[] = [0.34, 0.43, 0.48].map((prob) => ({ prob, y: 1 as const }));
  return [...negLow, ...negHigh, ...pos].sort((a, b) => a.prob - b.prob);
})();
