import type { Point } from "./linear-regression";

/**
 * Code-mode template for linear regression (docs/02-architecture.md): the
 * Python a learner sees is the same math the exhibit runs — olsFit and mse
 * transliterated, with the live dataset injected as a literal. Plain
 * Python only (no numpy), so the runtime loads in seconds.
 */
export function linearRegressionPython(points: Point[]): string {
  const literal =
    points.length === 0
      ? "points = []"
      : `points = [\n${points.map((p) => `    (${p.x.toFixed(4)}, ${p.y.toFixed(4)}),`).join("\n")}\n]`;

  return `# The data on the plot, exactly. Drag or paint points in visual
# mode and come back: this literal follows the experiment.
${literal}

assert points, "No data - switch to visual mode and paint some points first."

# Ordinary least squares - the same math the exhibit runs, which our
# test suite verifies against scikit-learn to 1e-6.
def ols_fit(points):
    n = len(points)
    mean_x = sum(x for x, _ in points) / n
    mean_y = sum(y for _, y in points) / n
    sxx = sum((x - mean_x) ** 2 for x, _ in points)
    sxy = sum((x - mean_x) * (y - mean_y) for x, y in points)
    if sxx == 0:
        return 0.0, mean_y  # degenerate x: the least-wrong horizontal line
    slope = sxy / sxx
    return slope, mean_y - slope * mean_x

slope, intercept = ols_fit(points)
mse = sum((y - (slope * x + intercept)) ** 2 for x, y in points) / len(points)

print(f"y-hat = {slope:.2f} * x + {intercept:.2f}")
print(f"MSE = {mse:.2f}")
`;
}
