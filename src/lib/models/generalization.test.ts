import { describe, expect, it } from "vitest";
import type { Point } from "@/lib/models/linear-regression";
import { kFoldCV, scoreSplit, splitPoints, shuffledIndices } from "@/lib/models/generalization";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * Train/test generalisation: a split partitions cleanly, training error flatters the
 * model, a single test split is a lottery (high variance across resamples), and
 * cross-validation averages that lottery into a far more stable estimate.
 */
const POOL: Point[] = [...(fixtures.train as Point[]), ...(fixtures.test as Point[])];

describe("train/test generalisation", () => {
  it("a split partitions the points cleanly", () => {
    const s = splitPoints(POOL, 0.3, 1);
    expect(s.train.length + s.test.length).toBe(POOL.length);
    expect(s.testIdx.size).toBe(Math.round(POOL.length * 0.3));
    expect(s.train.length).toBe(POOL.length - s.testIdx.size);
  });

  it("a shuffle is a permutation (no points lost or duplicated)", () => {
    const order = shuffledIndices(POOL.length, 7);
    expect(new Set(order).size).toBe(POOL.length);
    expect([...order].sort((a, b) => a - b)).toEqual(POOL.map((_, i) => i));
  });

  it("training error flatters: it's below the honest test error", () => {
    // averaged over several splits so it's not a fluke of one partition
    let train = 0;
    let test = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const s = scoreSplit(splitPoints(POOL, 0.3, seed), 8);
      train += s.trainErr;
      test += s.testErr;
    }
    expect(train / 8).toBeLessThan(test / 8);
  });

  it("cross-validation is far more stable than a single split", () => {
    const sd = (xs: number[]) => {
      const m = xs.reduce((s, v) => s + v, 0) / xs.length;
      return Math.sqrt(xs.reduce((s, v) => s + (v - m) ** 2, 0) / xs.length);
    };
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
    const singleSplit = seeds.map((s) => scoreSplit(splitPoints(POOL, 0.2, s), 6).testErr);
    const cvMean = seeds.map((s) => kFoldCV(POOL, 6, 5, s).meanErr);
    // the 5-fold CV estimate barely moves as the seed changes; one split swings wildly
    expect(sd(cvMean)).toBeLessThan(sd(singleSplit));
  });

  it("k-fold CV returns one error per fold", () => {
    const r = kFoldCV(POOL, 5, 5, 3);
    expect(r.foldErr).toHaveLength(5);
    expect(r.meanErr).toBeGreaterThan(0);
  });
});
