import { describe, expect, it } from "vitest";
import fixtures from "@/lib/models/fixtures/linear-regression.json";
import { olsFit, type Point } from "@/lib/models/linear-regression";
import { lossSurfaceGrid } from "./loss-surface";

/**
 * The surface must be honest (docs/06 red line 2): its lowest sampled cell
 * sits at the OLS minimum, values are normalized, and the window always
 * contains both the descent's start (0, 0) region and the valley floor.
 */

const points = fixtures.cases.find((c) => c.name === "clean-linear")!
  .points as Point[];

describe("lossSurfaceGrid", () => {
  const grid = lossSurfaceGrid(points);

  it("normalizes to [0, 1]", () => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of grid.values) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    expect(lo).toBe(0);
    expect(hi).toBe(1);
  });

  it("puts its lowest cell at the OLS valley floor", () => {
    let argmin = 0;
    for (let i = 1; i < grid.values.length; i++) {
      if (grid.values[i] < grid.values[argmin]) argmin = i;
    }
    const r = Math.floor(argmin / grid.cols);
    const c = argmin % grid.cols;
    const slope =
      grid.slopeRange[0] +
      ((grid.slopeRange[1] - grid.slopeRange[0]) * (c + 0.5)) / grid.cols;
    const intercept =
      grid.interceptRange[0] +
      ((grid.interceptRange[1] - grid.interceptRange[0]) * (r + 0.5)) /
        grid.rows;

    const target = olsFit(points);
    const cellW = (grid.slopeRange[1] - grid.slopeRange[0]) / grid.cols;
    const cellH = (grid.interceptRange[1] - grid.interceptRange[0]) / grid.rows;
    expect(Math.abs(slope - target.slope)).toBeLessThanOrEqual(cellW);
    expect(Math.abs(intercept - target.intercept)).toBeLessThanOrEqual(cellH);
  });

  it("frames both the start of the walk and the minimum", () => {
    const { slopeRange, interceptRange, minimum } = grid;
    expect(slopeRange[0]).toBeLessThan(0); // descent starts at (0, 0)
    expect(interceptRange[0]).toBeLessThan(0);
    expect(minimum.slope).toBeGreaterThan(slopeRange[0]);
    expect(minimum.slope).toBeLessThan(slopeRange[1]);
    expect(minimum.intercept).toBeGreaterThan(interceptRange[0]);
    expect(minimum.intercept).toBeLessThan(interceptRange[1]);
  });
});
