import { describe, expect, it } from "vitest";
import type { Point } from "@/lib/models/linear-regression";
import { polyMSE, predictPoly, ridgeFit } from "@/lib/models/polynomial";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The polynomial + ridge model (bias-variance, regularisation), verified two ways:
 * the TS Gaussian-elimination solve matches numpy on the same normal equations, and
 * the behaviour the exhibits claim holds — complexity drops training error while
 * test error turns up (overfitting), and ridge trades a little training error for
 * better generalisation.
 */
const train = fixtures.train as Point[];
const test = fixtures.test as Point[];

describe("polynomial + ridge model", () => {
  for (const c of fixtures.checks) {
    it(`degree ${c.degree}, λ=${c.lambda} matches the numpy reference`, () => {
      const w = ridgeFit(train, c.degree, c.lambda);
      // Predictions are the honest, conditioning-robust check (the weights of an
      // ill-conditioned Vandermonde can wobble while the curve agrees).
      for (const p of train) {
        expect(predictPoly(w, p.x)).toBeCloseTo(predictPoly(c.weights, p.x), 4);
      }
    });
  }

  it("more complexity drives training error down toward zero", () => {
    const e1 = polyMSE(train, ridgeFit(train, 1, 0));
    const e3 = polyMSE(train, ridgeFit(train, 3, 0));
    const e12 = polyMSE(train, ridgeFit(train, 12, 0));
    expect(e3).toBeLessThan(e1);
    expect(e12).toBeLessThan(e3);
    expect(e12).toBeLessThan(0.02); // a degree-12 curve nearly interpolates 16 points
  });

  it("test error is U-shaped: the flexible fit overfits", () => {
    const testErr = (d: number) => polyMSE(test, ridgeFit(train, d, 0));
    // A middling degree generalises better than a too-flexible one.
    expect(testErr(3)).toBeLessThan(testErr(12));
  });

  it("ridge trades training error for generalisation", () => {
    const d = 12;
    const overfit = ridgeFit(train, d, 0);
    const ridged = ridgeFit(train, d, 0.5);
    // Ridge raises training error but lowers test error vs the unpenalised overfit.
    expect(polyMSE(train, ridged)).toBeGreaterThan(polyMSE(train, overfit));
    expect(polyMSE(test, ridged)).toBeLessThan(polyMSE(test, overfit));
  });
});
