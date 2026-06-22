import { describe, expect, it } from "vitest";
import type { Point } from "@/lib/models/linear-regression";
import {
  conditionNumber,
  olsHessianEigs,
  stableLearningRate,
  standardizeX,
} from "@/lib/models/conditioning";
import fixtures from "@/lib/models/fixtures/linear-regression.json";

/**
 * The conditioning maths behind feature scaling: standardising x rounds the loss
 * bowl (condition number → 1) and lets descent take a far larger stable step —
 * the whole reason scaling speeds training up.
 */
const raw = fixtures.cases.find((c) => c.name === "gd-zigzag")!.points as Point[];

describe("conditioning (feature scaling)", () => {
  it("standardiseX gives mean 0, variance 1", () => {
    const z = standardizeX(raw);
    const mean = z.reduce((s, p) => s + p.x, 0) / z.length;
    const varr = z.reduce((s, p) => s + p.x * p.x, 0) / z.length;
    expect(mean).toBeCloseTo(0, 10);
    expect(varr).toBeCloseTo(1, 10);
    // y is untouched
    expect(z.map((p) => p.y)).toEqual(raw.map((p) => p.y));
  });

  it("the raw bowl is ill-conditioned; standardising rounds it to ~1", () => {
    const kRaw = conditionNumber(raw);
    const kStd = conditionNumber(standardizeX(raw));
    expect(kRaw).toBeGreaterThan(20); // long thin valley (gd-zigzag is uncentred)
    expect(kStd).toBeCloseTo(1, 1); // a round bowl
    expect(kStd).toBeLessThan(kRaw / 10);
  });

  it("standardising buys a much larger stable step", () => {
    const lrRaw = stableLearningRate(raw);
    const lrStd = stableLearningRate(standardizeX(raw));
    expect(lrStd).toBeGreaterThan(lrRaw * 8);
    // both are below their own 2/λmax cliff
    expect(lrRaw).toBeLessThan(2 / olsHessianEigs(raw).lambdaMax + 1e-9);
  });
});
