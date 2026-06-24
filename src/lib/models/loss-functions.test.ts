import { describe, expect, it } from "vitest";
import { olsFit, type Point } from "@/lib/models/linear-regression";
import {
  huberFit,
  maeFit,
  meanAbsError,
  meanHuber,
} from "@/lib/models/loss-functions";
import fixtures from "@/lib/models/fixtures/loss-functions.json";

/**
 * The loss-functions model layer is verified two ways (docs/06, C4): the TS IRLS
 * fits match an independent optimiser (scipy.optimize minimising the *exact* L1 /
 * Huber objectives — see scripts/generate_loss_fixtures.py), and the behaviour the
 * exhibit claims holds — squared error chases outliers, robust losses don't.
 */

type Fit = { slope: number; intercept: number; losses: { mse: number; mae: number; huber: number } };
type Case = { name: string; points: Point[]; ols: Fit; mae: Fit; huber: Fit };
const cases = fixtures.cases as unknown as Case[];

describe("loss-functions model layer (vs scipy.optimize reference)", () => {
  for (const c of cases) {
    describe(c.name, () => {
      it("OLS matches the squared-error reference", () => {
        const f = olsFit(c.points);
        expect(f.slope).toBeCloseTo(c.ols.slope, 4);
        expect(f.intercept).toBeCloseTo(c.ols.intercept, 4);
      });

      it("MAE (IRLS) matches the L1 reference", () => {
        const f = maeFit(c.points);
        expect(f.slope).toBeCloseTo(c.mae.slope, 1);
        expect(f.intercept).toBeCloseTo(c.mae.intercept, 1);
        // The achieved loss matches the reference optimum (unique even where the
        // L1 line itself is not).
        expect(meanAbsError(c.points, f)).toBeCloseTo(c.mae.losses.mae, 2);
      });

      it("Huber (IRLS) matches the Huber reference", () => {
        const f = huberFit(c.points);
        expect(f.slope).toBeCloseTo(c.huber.slope, 1);
        expect(f.intercept).toBeCloseTo(c.huber.intercept, 1);
        expect(meanHuber(c.points, f)).toBeCloseTo(c.huber.losses.huber, 2);
      });
    });
  }

  it("squared error chases the outliers; robust losses hold the bulk", () => {
    const c = cases.find((x) => x.name === "with-outliers")!;
    const ols = olsFit(c.points);
    const mae = maeFit(c.points);
    const huber = huberFit(c.points);
    // The true slope is 2.0: OLS is dragged well past it by the high-leverage
    // outliers, while L1 and Huber stay close to the bulk trend.
    expect(ols.slope).toBeGreaterThan(3);
    expect(Math.abs(mae.slope - 2)).toBeLessThan(0.5);
    expect(Math.abs(huber.slope - 2)).toBeLessThan(0.6);
  });

  it("on clean data the three judges agree", () => {
    const c = cases.find((x) => x.name === "clean")!;
    const ols = olsFit(c.points);
    const mae = maeFit(c.points);
    const huber = huberFit(c.points);
    expect(Math.abs(ols.slope - mae.slope)).toBeLessThan(0.15);
    expect(Math.abs(ols.slope - huber.slope)).toBeLessThan(0.1);
  });
});
