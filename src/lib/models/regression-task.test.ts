import { describe, expect, it } from "vitest";
import { classificationAccuracy, exactMatchAccuracy, mae, toClass } from "@/lib/models/regression-task";

/**
 * The metric-mismatch claim that grounds the exhibit: a near-perfect regression model
 * scores ~0 on exact-match accuracy (continuous predictions never land exactly) yet has
 * a small distance — so accuracy is the wrong metric for a regression task, while it is
 * the right metric for the binarised classification version.
 */
describe("regression task scoring", () => {
  const truths = [42, 55.5, 61, 73.2, 88, 49.7, 66.4, 90.1];
  // a strong "model": each prediction within a couple of points of the truth
  const good = truths.map((t, i) => t + (i % 2 === 0 ? 1.6 : -1.9));

  it("a good regression model has low distance but ~0 exact-match accuracy", () => {
    expect(mae(good, truths)).toBeLessThan(2.5); // close, by distance
    expect(exactMatchAccuracy(good, truths)).toBe(0); // but never exactly right
  });

  it("accuracy IS the right metric once the target is binarised", () => {
    const line = 60;
    // off by a point or two rarely crosses the threshold, so the classes mostly agree
    expect(classificationAccuracy(good, truths, line)).toBeGreaterThan(0.8);
  });

  it("distance separates a good model from a bad one where exact-match can't", () => {
    const bad = truths.map((t) => t + 25);
    expect(mae(bad, truths)).toBeGreaterThan(mae(good, truths) + 15);
    expect(exactMatchAccuracy(good, truths)).toBe(exactMatchAccuracy(bad, truths)); // both 0 — useless
  });

  it("toClass splits at the threshold", () => {
    expect(toClass(72, 60)).toBe("pass");
    expect(toClass(58, 60)).toBe("fail");
  });
});
