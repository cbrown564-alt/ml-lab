import { describe, expect, it } from "vitest";
import fixtures from "@/lib/models/fixtures/polynomial.json";
import type { Point } from "@/lib/models/linear-regression";
import {
  audibleError,
  audioParamsFor,
  buildOverfittingSweep,
  heldOutMinimum,
} from "./overfitting-audio";

const train = fixtures.train as Point[];
const heldOut = fixtures.test as Point[];

describe("overfitting audio state", () => {
  it("finds the deterministic held-out turning point", () => {
    const sweep = buildOverfittingSweep(train, heldOut);
    expect(heldOutMinimum(sweep).degree).toBe(3);
    expect(sweep).toHaveLength(12);
  });

  it("preserves the overfitting mechanism after the turning point", () => {
    const sweep = buildOverfittingSweep(train, heldOut);
    const degree7 = sweep[6];
    const degree9 = sweep[8];
    expect(degree9.trainError).toBeLessThan(degree7.trainError);
    expect(degree9.heldOutError).toBeGreaterThan(degree7.heldOutError);
  });

  it("maps relative error monotonically into a bounded audible range", () => {
    const values = [0.03, 0.06, 0.3, 3].map((value) => audibleError(value, 0.03));
    expect(values[0]).toBe(0);
    expect(values[3]).toBe(1);
    expect(values).toEqual([...values].sort((a, b) => a - b));
  });

  it("returns finite, bounded parameters for every degree", () => {
    const sweep = buildOverfittingSweep(train, heldOut);
    for (const row of sweep) {
      const params = audioParamsFor(row, sweep);
      for (const voice of [params.training, params.heldOut]) {
        expect(Number.isFinite(voice.frequency)).toBe(true);
        expect(voice.filterHz).toBeGreaterThanOrEqual(1000);
        expect(voice.filterHz).toBeLessThanOrEqual(1900);
        expect(voice.modulationDepth).toBeGreaterThanOrEqual(0.002);
        expect(voice.modulationDepth).toBeLessThanOrEqual(0.02);
      }
    }
  });
});
