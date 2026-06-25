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
    await openTab(page, "Run it");
    await page.getByRole("button", { name: /tyranny of the outlier/i }).click();
    await expect(page.getByText(/Two rogue points have wandered in/)).toBeVisible();
    await expect(plot(page).locator("circle")).toHaveCount(30); // with-outliers fixture
    await expect(page).toHaveScreenshot("exhibit-outlier-scenario.png");
  });

  test("Break it is a live failure loop, backed by the field guide", async ({ page }) => {
    await openTab(page, "Break it");
    // The interactive lab leads: a trigger to wreck the fit, a repair, a status.
    await expect(panel(page).getByText(/break it on purpose/i)).toBeVisible();
    await expect(panel(page).getByRole("button", { name: /snap it back/i })).toBeVisible();
    await expect(panel(page).getByText("Honest fit", { exact: true })).toBeVisible();
    // The field guide catalogues the failure modes beneath the loop.
    await expect(
      panel(page).getByRole("heading", { name: /every way it breaks/i }),
    ).toBeVisible();
    await expect(panel(page).getByText("Outliers", { exact: true })).toBeVisible();
    await expect(panel(page).getByText("Collinearity", { exact: true })).toBeVisible();
    // Each field-guide card poses the diagnostic step.
    await expect(panel(page).getByText("Diagnose", { exact: true })).toHaveCount(2);
  });

  test("wrecking the fit by hand fires the diagnosis; repair recovers it", async ({ page }) => {
    await openTab(page, "Break it");
    const breakPlot = panel(page).getByRole("group", { name: /least-squares line/ });
    const pt = breakPlot.locator("circle").nth(3);
    await pt.scrollIntoViewIfNeeded();
    const box = (await pt.boundingBox())!;
    // Drag the point far off the trend — a big enough miss to wreck the fit.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y - 240, { steps: 12 });
    await page.mouse.up();

    await expect(panel(page).getByText("Fit wrecked", { exact: true })).toBeVisible();
    await expect(panel(page).getByText(/it broke/i)).toBeVisible();

    // Repair: snap the cloud back, and the loop reports recovery.
    await panel(page).getByRole("button", { name: /snap it back/i }).click();
    await expect(panel(page).getByText("Recovered", { exact: true })).toBeVisible();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    // Beat 2 (the residuals) carries the predict-then-verify commit (template-level).
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /four times as much/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Explain it pins a live companion model to answer against", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Answer against the live model/i)).toBeVisible();
    const companion = panel(page).getByRole("group", { name: /live least-squares model/i });
    await expect(companion).toBeVisible();
    // Dragging a companion point moves the live readout — it's a real instrument.
    const before = await companion.getAttribute("aria-label");
    const pt = companion.locator("circle").nth(3);
    const box = (await pt.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y - 120, { steps: 8 });
    await page.mouse.up();
    expect(await companion.getAttribute("aria-label")).not.toBe(before);
  });

  test("reset restores the original data", async ({ page }) => {
    await openTab(page, "Run it");
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
    await openTab(page, "Run it");
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
    await openTab(page, "Run it");
    await page.getByRole("button", { name: /^code$/i }).click();
    await expect(page.getByLabel("Python code mirroring the experiment")).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
    await openTab(page, "Run it");
    // The persisted mode means the Experiment reopens straight into Code.
    await expect(page.getByLabel("Python code mirroring the experiment")).toBeVisible();
  });

  test("the journey continuation offers the next stop", async ({ page }) => {
    await expect(page.getByText(/Journey · Foundations · stop 4 of 14/)).toBeVisible();
  });

  test("evicting the outliers completes the lab task", async ({ page }) => {
    await openTab(page, "Explain it");
    const task = panel(page).locator("li", { hasText: "Make the tyranny stop" });
    await expect(task.getByText(/Waiting on the experiment/)).toBeVisible();

    // The manipulation lives in the Experiment tab; the task bus connects them.
    await openTab(page, "Run it");
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

    await openTab(page, "Explain it");
    await expect(task.getByText(/Complete — the experiment registered it/)).toBeVisible();
    await expect(task.getByText(/snapped back to the crowd/)).toBeVisible();
  });

  test("the predict item reveals the verify step after answering", async ({ page }) => {
    await openTab(page, "Explain it");
    const item = panel(page).locator("li", { hasText: "wanders twice as far" });
    await expect(item.getByText(/Now verify it/)).not.toBeVisible();
    await item.getByRole("button", { name: /four times as big/ }).click();
    await expect(item.getByText(/Right\./)).toBeVisible();
    await expect(item.getByText(/Now verify it/)).toBeVisible();
  });

  test("the error view switches between hidden, lines, and squares", async ({ page }) => {
    await openTab(page, "Run it");
    // Scope to the bench plot: Run it also holds the maths (a SquaredPenalty
    // widget renders its own square), so the error-view marks must come from the
    // fitted-line plot, not the whole act.
    const dashed = plot(page).locator("line[stroke-dasharray]");
    const squares = plot(page).locator("rect[stroke]");
    // The bench opens on residual lines (its default error view).
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
    await openTab(page, "Run it");
    await page.getByRole("button", { name: /tyranny of the outlier/i }).click();
    // The error view switches itself to squares: the outlier's giant square
    // dwarfing every other penalty is the lesson. (They appear after the
    // 450ms morph beat — first() retries until then.)
    await expect(panel(page).locator("svg rect[stroke]").first()).toBeVisible();
    await expect(page.getByText("area = the penalty it pays here")).toBeVisible();
  });
});
