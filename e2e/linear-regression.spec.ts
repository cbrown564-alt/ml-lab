import { expect, test, type Page } from "@playwright/test";

/**
 * Browser verification of the linear-regression exhibit (docs/06, C4): key
 * states are screenshot-tested and every interactive affordance gets a smoke
 * test — a draggable that doesn't drag is a red-line failure (A3/B1).
 *
 * The exhibit is a set of tabs (Story is the default face; the rich sandbox is
 * the Experiment tab; assessments live in Check). Visited tabs stay mounted but
 * hidden, so interaction locators are scoped to the *visible* tabpanel, and the
 * live numbers are read from the plot's `aria-label` rather than the readout
 * strip — the contract that survives a readout restyle.
 */

const openTab = async (page: Page, name: string) => {
  await page.getByRole("tab", { name }).click();
};

/** The visible tabpanel — scopes locators away from hidden, still-mounted tabs. */
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

/** The fitted-line plot, whose accessible name carries slope / intercept / MSE. */
const plot = (page: Page) => panel(page).getByRole("group", { name: /least-squares line/ });

test.describe("linear-regression exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/linear-regression");
    // Hydration sentinel: the badge renders client-side only, so once it's
    // here, handlers are attached and interactions are real.
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens with data, the fitted line, and a live readout", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Linear Regression" })).toBeVisible();
    await expect(plot(page)).toBeVisible();
    await expect(plot(page).locator("circle")).toHaveCount(30); // clean-linear fixture
    await expect(plot(page)).toHaveAccessibleName(/mean squared error/);
    // Viewport, not fullPage: the spine's sticky graphic smears in stitched
    // fullPage captures. The opening view (masthead + first beat + lab) is the
    // stable thing to guard.
    await expect(page).toHaveScreenshot("exhibit-initial.png");
  });

  test("dragging a point refits the line live", async ({ page }) => {
    const before = await plot(page).getAttribute("aria-label");

    const point = plot(page).locator("circle").first();
    await point.scrollIntoViewIfNeeded();
    const box = (await point.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 - 120, {
      steps: 8,
    });
    await page.mouse.up();

    expect(await plot(page).getAttribute("aria-label")).not.toBe(before);
  });

  test("the outlier failure scenario loads its dataset and prompt", async ({ page }) => {
    await openTab(page, "Experiment");
    await page.getByRole("button", { name: /tyranny of the outlier/i }).click();
    await expect(page.getByText(/Two rogue points have wandered in/)).toBeVisible();
    await expect(plot(page).locator("circle")).toHaveCount(30); // with-outliers fixture
    await expect(page).toHaveScreenshot("exhibit-outlier-scenario.png");
  });

  test("reset restores the original data", async ({ page }) => {
    await openTab(page, "Experiment");
    const before = await plot(page).getAttribute("aria-label");

    const point = plot(page).locator("circle").first();
    await point.scrollIntoViewIfNeeded();
    const box = (await point.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 100, box.y - 100, { steps: 5 });
    await page.mouse.up();
    expect(await plot(page).getAttribute("aria-label")).not.toBe(before);

    await page.getByRole("button", { name: "Reset" }).click();
    await expect(plot(page)).toHaveAccessibleName(before!);
  });

  test("the dataset painter adds and removes points", async ({ page }) => {
    await openTab(page, "Experiment");
    await page.getByRole("button", { name: /paint your own data/i }).click();
    const svg = plot(page);
    await expect(svg.locator("circle")).toHaveCount(0);

    await svg.scrollIntoViewIfNeeded();
    const box = (await svg.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.5);
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.3);
    await expect(svg.locator("circle")).toHaveCount(2);

    await svg.locator("circle").first().dblclick();
    await expect(svg.locator("circle")).toHaveCount(1);
  });

  test("a data point can be moved and removed with the keyboard", async ({ page }) => {
    const before = await plot(page).getAttribute("aria-label");

    const point = plot(page).locator("circle").first();
    await point.scrollIntoViewIfNeeded();
    await point.focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowUp");
    expect(await plot(page).getAttribute("aria-label")).not.toBe(before);

    const count = await plot(page).locator("circle").count();
    await page.keyboard.press("Delete");
    await expect(plot(page).locator("circle")).toHaveCount(count - 1);
  });

  test("the mode preference persists across a reload", async ({ page }) => {
    await openTab(page, "Experiment");
    await page.getByRole("button", { name: /^code$/i }).click();
    await expect(page.getByLabel("Python code mirroring the experiment")).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
    await openTab(page, "Experiment");
    // The persisted mode means the Experiment reopens straight into Code.
    await expect(page.getByLabel("Python code mirroring the experiment")).toBeVisible();
  });

  test("the journey continuation offers the next stop", async ({ page }) => {
    await expect(page.getByText(/Journey · Foundations · stop 4 of 11/)).toBeVisible();
  });

  test("evicting the outliers completes the lab task", async ({ page }) => {
    await openTab(page, "Check");
    const task = panel(page).locator("li", { hasText: "Make the tyranny stop" });
    await expect(task.getByText(/Waiting on the experiment/)).toBeVisible();

    // The manipulation lives in the Experiment tab; the task bus connects them.
    await openTab(page, "Experiment");
    await page.getByRole("button", { name: /tyranny of the outlier/i }).click();
    const svg = plot(page);
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

    await openTab(page, "Check");
    await expect(task.getByText(/Done — the experiment felt it/)).toBeVisible();
    await expect(task.getByText(/snapped back to the crowd/)).toBeVisible();
  });

  test("the predict item reveals the verify step after answering", async ({ page }) => {
    await openTab(page, "Check");
    const item = panel(page).locator("li", { hasText: "Predict, then verify" });
    await expect(item.getByText(/Now verify it/)).not.toBeVisible();
    await item.getByRole("button", { name: /four times as big/ }).click();
    await expect(item.getByText(/Right\./)).toBeVisible();
    await expect(item.getByText(/Now verify it/)).toBeVisible();
  });

  test("the error view switches between hidden, lines, and squares", async ({ page }) => {
    await openTab(page, "Experiment");
    const dashed = panel(page).locator("svg line[stroke-dasharray]");
    const squares = panel(page).locator("svg rect[stroke]");
    // The Experiment opens on residual lines (its default error view).
    await expect(dashed).not.toHaveCount(0);
    await expect(squares).toHaveCount(0);

    await page.getByRole("button", { name: "Squares" }).click();
    await expect(squares).not.toHaveCount(0);
    await expect(dashed).toHaveCount(0);

    await page.getByRole("button", { name: "Hide" }).click();
    await expect(squares).toHaveCount(0);
    await expect(dashed).toHaveCount(0);

    await page.getByRole("button", { name: "Lines" }).click();
    await expect(dashed).not.toHaveCount(0);
    await expect(squares).toHaveCount(0);
  });

  test("the outlier scenario stages the squared-error punchline", async ({ page }) => {
    await openTab(page, "Experiment");
    await page.getByRole("button", { name: /tyranny of the outlier/i }).click();
    // The error view switches itself to squares: the outlier's giant square
    // dwarfing every other penalty is the lesson. (They appear after the
    // 450ms morph beat — first() retries until then.)
    await expect(panel(page).locator("svg rect[stroke]").first()).toBeVisible();
    await expect(page.getByText("area = the penalty it pays here")).toBeVisible();
  });
});
