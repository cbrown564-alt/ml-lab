import { expect, test } from "@playwright/test";

/**
 * Browser verification of the linear-regression exhibit (docs/06, C4):
 * key states are screenshot-tested, and every interactive affordance gets a
 * smoke test — a draggable that doesn't drag is a red-line failure (A3/B1).
 */

test.describe("linear-regression exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/linear-regression");
  });

  test("renders the experiment with data, fit line, and readouts", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Linear Regression" })).toBeVisible();
    const svg = page.getByRole("img", { name: /least-squares line/ });
    await expect(svg).toBeVisible();
    await expect(svg.locator("circle")).toHaveCount(30); // clean-linear fixture
    await expect(page.getByText(/MSE = /)).toBeVisible();
    await expect(page).toHaveScreenshot("exhibit-initial.png", { fullPage: true });
  });

  test("dragging a point refits the line live", async ({ page }) => {
    const readout = page.getByText(/MSE = /);
    const before = await readout.textContent();

    const point = page.locator("svg circle").first();
    // mouse coords are viewport-relative; the point must be on screen
    await point.scrollIntoViewIfNeeded();
    const box = (await point.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 - 120, {
      steps: 8,
    });
    await page.mouse.up();

    const after = await readout.textContent();
    expect(after).not.toBe(before);
  });

  test("the outlier failure scenario loads its dataset and prompt", async ({ page }) => {
    await page.getByRole("button", { name: /tyranny of the outlier/i }).click();
    await expect(page.getByText(/rogue points/)).toBeVisible();
    await expect(page.locator("svg circle")).toHaveCount(30); // with-outliers fixture
    await expect(page).toHaveScreenshot("exhibit-outlier-scenario.png", { fullPage: true });
  });

  test("reset restores the original data", async ({ page }) => {
    const readout = page.getByText(/MSE = /);
    const before = await readout.textContent();

    const point = page.locator("svg circle").first();
    await point.scrollIntoViewIfNeeded();
    const box = (await point.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 100, box.y - 100, { steps: 5 });
    await page.mouse.up();
    await expect(readout).not.toHaveText(before!);

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(readout).toHaveText(before!);
  });

  test("residuals toggle shows and hides error lines", async ({ page }) => {
    const dashed = page.locator("svg line[stroke-dasharray]");
    expect(await dashed.count()).toBeGreaterThan(0);
    await page.getByLabel("Show residuals").uncheck();
    await expect(dashed).toHaveCount(0);
  });
});
