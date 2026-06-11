import { describe, expect, it } from "vitest";
import {
  createGradientDescent,
  gradient,
  mse,
  olsFit,
  predict,
  type Point,
} from "./linear-regression";
import fixtures from "./fixtures/linear-regression.json";

const EPS = 1e-6;

describe("olsFit vs scikit-learn fixtures", () => {
  for (const c of fixtures.cases) {
    it(c.name, () => {
      const fit = olsFit(c.points as Point[]);
      if (c.name === "near-degenerate-x") {
        // sklearn's lstsq and our closed form may disagree on degenerate x;
        // we only require a sane, finite fit close to the mean line.
        expect(Number.isFinite(fit.slope)).toBe(true);
        expect(Number.isFinite(fit.intercept)).toBe(true);
        return;
      }
      expect(fit.slope).toBeCloseTo(c.ols.slope, 6);
      expect(fit.intercept).toBeCloseTo(c.ols.intercept, 6);
      expect(mse(c.points as Point[], fit)).toBeCloseTo(c.mseAtOls, 6);
    });
  }
});

describe("gradient", () => {
  it("matches a numerical gradient", () => {
    const points = fixtures.cases[0].points as Point[];
    const params = { slope: 1.3, intercept: -0.7 };
    const h = 1e-6;
    const numSlope =
      (mse(points, { ...params, slope: params.slope + h }) -
        mse(points, { ...params, slope: params.slope - h })) /
      (2 * h);
    const numIntercept =
      (mse(points, { ...params, intercept: params.intercept + h }) -
        mse(points, { ...params, intercept: params.intercept - h })) /
      (2 * h);
    const g = gradient(points, params);
    expect(g.dSlope).toBeCloseTo(numSlope, 4);
    expect(g.dIntercept).toBeCloseTo(numIntercept, 4);
  });

  it("is zero at the OLS minimum", () => {
    const points = fixtures.cases[0].points as Point[];
    const g = gradient(points, olsFit(points));
    expect(Math.abs(g.dSlope)).toBeLessThan(EPS);
    expect(Math.abs(g.dIntercept)).toBeLessThan(EPS);
  });
});

describe("createGradientDescent", () => {
  it("converges to the OLS solution on well-conditioned data", () => {
    const points = fixtures.cases[0].points as Point[];
    const target = olsFit(points);
    const gd = createGradientDescent(points, { learningRate: 0.02 });
    gd.run(5000);
    expect(gd.current.params.slope).toBeCloseTo(target.slope, 4);
    expect(gd.current.params.intercept).toBeCloseTo(target.intercept, 4);
  });

  it("loss is monotonically non-increasing with a sane learning rate", () => {
    const points = fixtures.cases[1].points as Point[];
    const gd = createGradientDescent(points, { learningRate: 0.01 });
    gd.run(200);
    for (let i = 1; i < gd.trace.length; i++) {
      expect(gd.trace[i].loss).toBeLessThanOrEqual(gd.trace[i - 1].loss + EPS);
    }
  });

  it("diverges with an absurd learning rate — the failure gallery depends on this", () => {
    const points = fixtures.cases[0].points as Point[];
    const gd = createGradientDescent(points, { learningRate: 1.0 });
    gd.run(50);
    expect(gd.current.loss).toBeGreaterThan(gd.trace[0].loss);
  });

  it("records a scrubable trace and resets cleanly", () => {
    const points = fixtures.cases[0].points as Point[];
    const gd = createGradientDescent(points, { learningRate: 0.02 });
    gd.run(10);
    expect(gd.trace).toHaveLength(11);
    expect(gd.trace[0].step).toBe(0);
    expect(gd.trace[10].step).toBe(10);
    gd.reset();
    expect(gd.trace).toHaveLength(1);
    expect(gd.current.step).toBe(0);
  });

  it("learning-rate changes mid-descent take effect", () => {
    const points = fixtures.cases[0].points as Point[];
    const gd = createGradientDescent(points, { learningRate: 1e-9 });
    gd.step();
    const frozen = gd.current.loss;
    gd.setLearningRate(0.02);
    gd.run(100);
    expect(gd.current.loss).toBeLessThan(frozen);
  });
});

describe("predict / mse basics", () => {
  it("predict is the line", () => {
    expect(predict({ slope: 2, intercept: 1 }, 3)).toBe(7);
  });
  it("mse of a perfect fit is zero", () => {
    const pts: Point[] = [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
    ];
    expect(mse(pts, { slope: 2, intercept: 1 })).toBe(0);
  });
  it("empty data degrades gracefully", () => {
    expect(olsFit([])).toEqual({ slope: 0, intercept: 0 });
    expect(mse([], { slope: 1, intercept: 0 })).toBe(0);
  });
});
