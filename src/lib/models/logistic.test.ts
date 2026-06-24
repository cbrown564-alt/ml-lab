import { describe, expect, it } from "vitest";
import {
  accuracy,
  accuracyVec,
  boundaryX2,
  createLogisticDescent,
  fitLogistic,
  fitLogisticVec,
  logLoss,
  sigmoid,
  type LabeledPoint,
  type LogisticParams,
} from "@/lib/models/logistic";
import { curvePoints, expandedRow, rawRow } from "@content/exhibits/logistic-regression/curve";
import fixtures from "@/lib/models/fixtures/logistic.json";

/**
 * Logistic regression, verified against scipy's maximum-likelihood fit: the TS
 * gradient descent must reach the same log-loss, accuracy, and boundary direction,
 * and the loss must fall monotonically as it trains.
 */
const points = fixtures.points as LabeledPoint[];
const ref = fixtures.weights;
const refParams: LogisticParams = { b: ref.b, w1: ref.w1, w2: ref.w2 };

describe("logistic regression", () => {
  it("sigmoid is centred and monotone", () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 12);
    expect(sigmoid(10)).toBeGreaterThan(0.99);
    expect(sigmoid(-10)).toBeLessThan(0.01);
  });

  it("reproduces scipy's log-loss and accuracy at the reference weights", () => {
    expect(logLoss(points, refParams)).toBeCloseTo(fixtures.logLoss, 3);
    expect(accuracy(points, refParams)).toBeCloseTo(fixtures.accuracy, 6);
  });

  it("gradient descent converges to scipy's fit", () => {
    const fit = fitLogistic(points, { steps: 6000, lr: 0.5, l2: fixtures.generator.l2 });
    // Log-loss and accuracy match the MLE; the boundary points the same way (the
    // weight *direction* w1/w2 is what the boundary depends on).
    expect(logLoss(points, fit)).toBeCloseTo(fixtures.logLoss, 2);
    expect(accuracy(points, fit)).toBeCloseTo(fixtures.accuracy, 6);
    expect(fit.w1 / fit.w2).toBeCloseTo(refParams.w1 / refParams.w2, 1);
  });

  it("loss falls monotonically while training", () => {
    const run = createLogisticDescent(points, { lr: 0.4 });
    run.run(200);
    const losses = run.trace.map((s) => s.loss);
    let drops = 0;
    for (let i = 1; i < losses.length; i++) if (losses[i] <= losses[i - 1] + 1e-9) drops++;
    expect(drops).toBe(losses.length - 1); // every step is non-increasing
    expect(losses[losses.length - 1]).toBeLessThan(losses[0]);
  });

  it("the boundary is the p = ½ line", () => {
    // a point on the boundary scores ~0 → probability ~½
    const x1 = 0.3;
    const x2 = boundaryX2(refParams, x1);
    expect(sigmoid(refParams.b + refParams.w1 * x1 + refParams.w2 * x2)).toBeCloseTo(0.5, 9);
  });
});

describe("logistic regression — the straight line fails a curved boundary, x² fixes it", () => {
  const y = curvePoints.map((p) => p.y);

  it("a straight line is confidently wrong on the parabola's arms", () => {
    const rows = curvePoints.map(rawRow);
    const w = fitLogisticVec(rows, y, { steps: 4000, lr: 0.3 });
    const acc = accuracyVec(rows, y, w);
    expect(acc).toBeGreaterThan(0.6); // it finds *some* signal (not chance)…
    expect(acc).toBeLessThan(0.88); // …but can't follow the curve
  });

  it("adding the x₁² feature bends the boundary into the parabola", () => {
    const rows = curvePoints.map(expandedRow);
    const w = fitLogisticVec(rows, y, { steps: 4000, lr: 0.3 });
    expect(accuracyVec(rows, y, w)).toBeGreaterThan(0.9); // the curve the line couldn't draw
  });
});
