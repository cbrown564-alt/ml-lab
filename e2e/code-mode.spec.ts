import { expect, test } from "@playwright/test";

/**
 * Code-mode bridge (docs/00 #001, docs/01 experience principle 3): the
 * Python in the panel runs the same math on the same data as the plot, so
 * the printed fit must agree with the visual readout — that agreement IS
 * the bridge, and this test holds it shut.
 */

test.describe("code mode", () => {
  // The Visual/Code toggle lives in the Run it act (the open bench).
  const openCode = async (page: import("@playwright/test").Page) => {
    await page.getByRole("tab", { name: "Run it" }).click();
    await page.getByRole("button", { name: "code", exact: true }).click();
  };

  test("the template mirrors the live dataset", async ({ page }) => {
    await page.goto("/exhibits/linear-regression");
    await openCode(page);

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
    await page.getByRole("tab", { name: "Run it" }).click();

    // The visual fit, read from the plot's accessible name (2 decimals).
    const plot = page
      .getByRole("tabpanel", { includeHidden: false })
      .getByRole("group", { name: /least-squares line/ });
    const name = await plot.getAttribute("aria-label");
    const [, slope, intercept] = name!.match(
      /[Ss]lope (-?\d+\.\d{2}), intercept (-?\d+\.\d{2})/,
    )!;

    await page.getByRole("button", { name: "code", exact: true }).click();
    await page.getByRole("button", { name: "Run", exact: true }).click();

    const output = page.locator("pre");
    await expect(output).toContainText("y-hat", { timeout: 120_000 });
    await expect(output).toContainText(`y-hat = ${slope} * x + ${intercept}`);
    await expect(output).toContainText("MSE = ");
  });
});
