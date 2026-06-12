import { describe, expect, it } from "vitest";
import { linearRegressionPython } from "./linear-regression-py";
import fixtures from "./fixtures/linear-regression.json";
import type { Point } from "./linear-regression";

describe("linearRegressionPython template", () => {
  const points = fixtures.cases[0].points as Point[];
  const src = linearRegressionPython(points);

  it("injects every live data point as a literal", () => {
    expect(src.match(/\(\s*-?\d+\.\d{4},\s*-?\d+\.\d{4}\),/g)).toHaveLength(
      points.length,
    );
  });

  it("transliterates the verified model, not some other math", () => {
    expect(src).toContain("def ols_fit(points):");
    expect(src).toContain("sxy / sxx");
    expect(src).toContain('print(f"MSE = {mse:.2f}")');
  });

  it("an empty dataset fails with guidance, not a traceback", () => {
    expect(linearRegressionPython([])).toContain(
      'assert points, "No data',
    );
  });
});
