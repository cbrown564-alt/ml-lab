import type { Sample } from "@/lib/models/neural-net";

/**
 * XOR, the canonical "a straight line can't do this" dataset: four clusters where the
 * class flips with each quadrant (class 1 where x1 and x2 share a sign, class 0 where
 * they differ). No single line separates it — but a hidden layer can. The whole exhibit
 * turns on watching the boundary bend into the X that XOR needs.
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

export const xorData: Sample[] = (() => {
  const rng = mulberry32(11);
  const centers = [
    [1.4, 1.4],
    [-1.4, -1.4],
    [1.4, -1.4],
    [-1.4, 1.4],
  ];
  const out: Sample[] = [];
  for (const [cx, cy] of centers) {
    const y: 0 | 1 = cx * cy > 0 ? 1 : 0;
    for (let i = 0; i < 24; i++) {
      out.push({ x1: round2(cx + (rng() - 0.5) * 1.4), x2: round2(cy + (rng() - 0.5) * 1.4), y });
    }
  }
  return out;
})();

export const NN_LR = 0.4;
export const HIDDEN_CHOICES = [1, 2, 4, 8] as const;
export const DEFAULT_HIDDEN = 4;

/**
 * The Break-it data: two classes split by a gentle curve, with ~12% label noise in the
 * TRAIN set and a clean held-out TEST set drawn from the same rule. A small network learns
 * the curve and shrugs off the noise (train and test agree); a big one memorises every
 * noisy point — perfect on train, worse on test. The true boundary: class 1 above the
 * parabola x2 = 0.35·x1² − 0.4.
 */
const trueClass = (x1: number, x2: number): 0 | 1 => (x2 > 0.35 * x1 * x1 - 0.4 ? 1 : 0);

function makeSet(n: number, seed: number, noise: number): Sample[] {
  const rng = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const x1 = round2((rng() - 0.5) * 5.2);
    const x2 = round2((rng() - 0.5) * 5.2);
    let y = trueClass(x1, x2);
    if (rng() < noise) y = (1 - y) as 0 | 1; // a flipped label
    return { x1, x2, y };
  });
}

export const breakTrain: Sample[] = makeSet(70, 21, 0.12);
export const breakTest: Sample[] = makeSet(60, 99, 0);
export const BREAK_HIDDEN_CHOICES = [2, 4, 12, 32] as const;

export const neuralNetScenario = {
  id: "watch-it-learn",
  title: "Watch it learn the shape",
  prompt:
    "These four clusters are XOR — the class flips every quadrant, and no straight line can separate them. Press Train and watch a small network bend its decision boundary into the X this needs. Change the number of hidden units to see how much shape the network can afford: one unit can only draw a line; a few give it the curves.",
};
