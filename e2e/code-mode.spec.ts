import { expect, test } from "@playwright/test";

/**
 * Code-mode bridge (docs/00 #001, docs/01 experience principle 3): the
 * Python in the panel runs the same math on the same data as the plot, so
 * the printed fit must agree with the visual readout — that agreement IS
 * the bridge, and this test holds it shut.
 */

test.describe("code mode", () => {
  test("the template mirrors the live dataset", async ({ page }) => {
    await page.goto("/exhibits/linear-regression");
    await page.getByRole("button", { name: "code", exact: true }).click();

    const code = page.getByLabel("Python code mirroring the experiment");
    await expect(code).toBeVisible();
    const source = await code.inputValue();
    expect(source).toContain("def ols_fit(points):");
    // 30 injected tuples — the clean-linear fixture, exactly what the plot shows.
    expect(source.match(/\(\s*-?\d+\.\d{4}, -?\d+\.\d{4}\),/g)).toHaveLength(30);
  });

  test("running the Python reproduces the visual fit", async ({ page }) => {
    // First run downloads the Pyodide runtime from CDN.
    test.slow();
    await page.goto("/exhibits/linear-regression");

    const equation = await page.getByText(/ŷ = /).textContent();
    const [slope, intercept] = equation!.match(/-?\d+\.\d{2}/g)!;

    await page.getByRole("button", { name: "code", exact: true }).click();
    await page.getByRole("button", { name: "Run", exact: true }).click();

    const output = page.locator("pre");
    await expect(output).toContainText("y-hat", { timeout: 120_000 });
    await expect(output).toContainText(`y-hat = ${slope} * x + ${intercept}`);
    await expect(output).toContainText("MSE = ");
  });
});
