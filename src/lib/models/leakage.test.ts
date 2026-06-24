import { describe, expect, it } from "vitest";
import { crossValR2, type Matrix } from "@/lib/models/leakage";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * Data leakage (the feature-selection trap): on pure-noise data, selecting features
 * with all the data before cross-validating manufactures skill that isn't there;
 * selecting inside each fold tells the truth. The TS CV must reproduce numpy exactly,
 * and the leaky score must look like real skill while the honest one collapses to ~0.
 */
const X = fixtures.X as Matrix;
const y = fixtures.y as number[];
const { kSelect, folds } = fixtures.generator;

describe("data leakage (feature-selection trap)", () => {
  it("the leaky CV reproduces the numpy reference fold-for-fold", () => {
    const r = crossValR2(X, y, kSelect, folds, true);
    expect(r.meanR2).toBeCloseTo(fixtures.leakyMeanR2, 6);
    r.foldR2.forEach((v, i) => expect(v).toBeCloseTo(fixtures.leakyFoldR2[i], 6));
  });

  it("the honest CV reproduces the numpy reference fold-for-fold", () => {
    const r = crossValR2(X, y, kSelect, folds, false);
    expect(r.meanR2).toBeCloseTo(fixtures.honestMeanR2, 6);
    r.foldR2.forEach((v, i) => expect(v).toBeCloseTo(fixtures.honestFoldR2[i], 6));
  });

  it("the leak manufactures skill where there is none", () => {
    const leaky = crossValR2(X, y, kSelect, folds, true).meanR2;
    const honest = crossValR2(X, y, kSelect, folds, false).meanR2;
    // Data is pure noise: the honest score is essentially zero (or worse), but the
    // leaky pipeline reports confident, entirely spurious skill.
    expect(honest).toBeLessThan(0.05);
    expect(leaky).toBeGreaterThan(0.3);
    expect(leaky - honest).toBeGreaterThan(0.4);
  });
});
