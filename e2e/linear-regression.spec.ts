import { expect, test } from "@playwright/test";

/**
 * Browser verification of the linear-regression exhibit (docs/06, C4):
 * key states are screenshot-tested, and every interactive affordance gets a
 * smoke test — a draggable that doesn't drag is a red-line failure (A3/B1).
 */

test.describe("linear-regression exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/linear-regression");
    // Hydration sentinel: the badge renders client-side only, so once it's
    // here, handlers are attached and interactions are real.
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("renders the experiment with data, fit line, and readouts", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Linear Regression" })).toBeVisible();
    const svg = page.getByRole("group", { name: /least-squares line/ });
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
    await expect(page.getByText(/Two rogue points have wandered in/)).toBeVisible();
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

  test("the dataset painter adds and removes points", async ({ page }) => {
    await page.getByRole("button", { name: /paint your own data/i }).click();
    const svg = page.getByRole("group", { name: /least-squares line/ });
    await expect(svg.locator("circle")).toHaveCount(0);

    await svg.scrollIntoViewIfNeeded();
    const box = (await svg.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.5);
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.3);
    await expect(svg.locator("circle")).toHaveCount(2);
    await expect(page.getByText(/MSE = /)).toBeVisible();

    await svg.locator("circle").first().dblclick();
    await expect(svg.locator("circle")).toHaveCount(1);
  });

  test("a data point can be moved and removed with the keyboard", async ({ page }) => {
    const readout = page.getByText(/MSE = /);
    const before = await readout.textContent();

    const point = page.locator("svg circle").first();
    await point.scrollIntoViewIfNeeded();
    await point.focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowUp");
    await expect(readout).not.toHaveText(before!);

    const count = await page.locator("svg circle").count();
    await page.keyboard.press("Delete");
    await expect(page.locator("svg circle")).toHaveCount(count - 1);
  });

  test("the mode preference persists across a reload", async ({ page }) => {
    await page.getByRole("button", { name: /^code$/i }).click();
    await expect(
      page.getByLabel("Python code mirroring the experiment"),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByLabel("Python code mirroring the experiment"),
    ).toBeVisible();
  });

  test("the journey continuation offers the next stop", async ({ page }) => {
    await expect(page.getByText(/Journey · Foundations · stop 4 of 11/)).toBeVisible();
  });

  test("evicting the outliers completes the lab task", async ({ page }) => {
    const task = page.locator("li", { hasText: "Make the tyranny stop" });
    await expect(task.getByText(/Waiting on the experiment/)).toBeVisible();

    await page.getByRole("button", { name: /tyranny of the outlier/i }).click();
    const svg = page.getByRole("group", { name: /least-squares line/ });
    await svg.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600); // let the scenario morph settle

    // The two rogues are the vertical extremes of the cloud: top and bottom.
    const evictExtreme = async (pick: "min" | "max") => {
      const circles = svg.locator("circle");
      const count = await circles.count();
      let target = 0;
      let extreme = pick === "min" ? Infinity : -Infinity;
      for (let i = 0; i < count; i++) {
        const box = (await circles.nth(i).boundingBox())!;
        const cy = box.y + box.height / 2;
        if (pick === "min" ? cy < extreme : cy > extreme) {
          extreme = cy;
          target = i;
        }
      }
      await circles.nth(target).dblclick();
    };

    await evictExtreme("min");
    await evictExtreme("max");

    await expect(task.getByText(/Done — the experiment felt it/)).toBeVisible();
    await expect(task.getByText(/snapped back to the crowd/)).toBeVisible();
  });

  test("the predict item reveals the verify step after answering", async ({ page }) => {
    const item = page.locator("li", { hasText: "Predict, then verify" });
    await expect(item.getByText(/Now verify it/)).not.toBeVisible();
    await item.getByRole("button", { name: /four times as big/ }).click();
    await expect(item.getByText(/Right\./)).toBeVisible();
    await expect(item.getByText(/Now verify it/)).toBeVisible();
  });

  test("the error view switches between lines, squares, and hidden", async ({ page }) => {
    const dashed = page.locator("svg line[stroke-dasharray]");
    const squares = page.locator("svg rect[stroke]");
    expect(await dashed.count()).toBeGreaterThan(0);
    await expect(squares).toHaveCount(0);

    await page.getByRole("button", { name: "Squares" }).click();
    expect(await squares.count()).toBeGreaterThan(0);
    await expect(dashed).toHaveCount(0);

    await page.getByRole("button", { name: "Hide" }).click();
    await expect(squares).toHaveCount(0);
    await expect(dashed).toHaveCount(0);
  });

  test("the outlier scenario stages the squared-error punchline", async ({ page }) => {
    await page.getByRole("button", { name: /tyranny of the outlier/i }).click();
    // The error view switches itself to squares: the outlier's giant square
    // dwarfing every other penalty is the lesson. (They appear after the
    // 450ms morph beat — first() retries until then.)
    await expect(page.locator("svg rect[stroke]").first()).toBeVisible();
    await expect(page.getByText("area = the penalty it pays here")).toBeVisible();
  });
});
