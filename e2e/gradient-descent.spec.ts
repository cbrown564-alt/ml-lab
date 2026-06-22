import { expect, test, type Page } from "@playwright/test";

/**
 * Browser verification of the gradient-descent exhibit. Time-control is the
 * whole exhibit (B3), so every transport affordance gets a smoke test: step,
 * play/pause, scrub, learning-rate knob, and the divergence auto-stop.
 *
 * The rich transport lives in the Experiment tab; the default Story tab is the
 * guided face. Assertions read the Plot's `aria-label` (which carries step /
 * slope / intercept / loss, live) rather than the visual readout strip, so the
 * tests survive readout restyling.
 */

const openExperiment = async (page: Page) => {
  await page.getByRole("tab", { name: "Experiment" }).click();
  await expect(page.getByRole("button", { name: "Step", exact: true })).toBeVisible();
};

/** The visible tabpanel — scopes away from hidden, still-mounted tabs (the
 *  Story view keeps its own scrub slider mounted, so label lookups collide). */
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

/** The descent scatter, whose accessible name carries the live step + loss. */
const scatter = (page: Page) =>
  page.getByRole("img", { name: /gradient descent is at step/ });

const lossFromName = (name: string | null) => {
  const m = name?.match(/loss ([\d.eE+-]+)/);
  // parseFloat stops at the sentence-ending period the char class would grab.
  return m ? parseFloat(m[1]) : NaN;
};

test.describe("gradient-descent exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/gradient-descent");
    // The mastery badge only renders after hydration: interacting before
    // React has attached handlers silently no-ops. The testid matters —
    // bare text would also match narration word spans.
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens at step 0 with the line, target, and curve", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Gradient Descent" })).toBeVisible();
    await expect(page.getByRole("img", { name: /gradient descent is at step 0/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /Training curve/ })).toBeVisible();
    // Viewport, not fullPage: the spine's sticky graphic smears in stitched
    // fullPage captures.
    await expect(page).toHaveScreenshot("gd-initial.png");
  });

  test("Step advances the descent and lowers the loss", async ({ page }) => {
    await openExperiment(page);
    const before = lossFromName(await scatter(page).getAttribute("aria-label"));

    await page.getByRole("button", { name: "Step", exact: true }).click();
    await expect(page.getByRole("img", { name: /at step 1:/ })).toBeVisible();
    const after = lossFromName(await scatter(page).getAttribute("aria-label"));
    expect(after).toBeLessThan(before);

    await page.getByRole("button", { name: "Step ×10" }).click();
    await expect(page.getByRole("img", { name: /at step 11:/ })).toBeVisible();
  });

  test("Play runs the descent and Pause stops it", async ({ page }) => {
    await openExperiment(page);
    await page.getByRole("button", { name: "Play" }).click();
    await expect(page.getByRole("img", { name: /at step [1-9]/ })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Pause" }).click();
    const frozen = await scatter(page).getAttribute("aria-label");
    await page.waitForTimeout(400);
    expect(await scatter(page).getAttribute("aria-label")).toBe(frozen);
  });

  test("scrubbing rewinds the view to earlier steps", async ({ page }) => {
    await openExperiment(page);
    await page.getByRole("button", { name: "Step ×10" }).click();
    await expect(page.getByRole("img", { name: /at step 10:/ })).toBeVisible();

    await panel(page).getByLabel("Scrub through descent steps").fill("0");
    // Back at step 0: the as-yet-unlearned flat line.
    await expect(
      page.getByRole("img", { name: /at step 0: slope 0\.00, intercept 0\.00/ }),
    ).toBeVisible();
  });

  test("the learning-rate knob is live", async ({ page }) => {
    await openExperiment(page);
    // The slider moves through exponents; -3 on the track is 1e-3.
    await page.getByLabel("Learning rate").fill("-3");
    await expect(page.getByText("0.0010")).toBeVisible();
  });

  test("'Over the edge' diverges, auto-pauses, and says so", async ({ page }) => {
    await openExperiment(page);
    await page.getByRole("button", { name: /over the edge/i }).click();
    await page.getByRole("button", { name: "Play" }).click();
    await expect(page.getByText(/This is divergence/)).toBeVisible({ timeout: 15000 });
    // Auto-paused at the cliff edge: transport is disabled until restart.
    await expect(page.getByRole("button", { name: "Play" })).toBeDisabled();
    await page.getByRole("button", { name: "Restart descent" }).click();
    await expect(page.getByRole("img", { name: /at step 0:/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" })).toBeEnabled();
  });

  test("the loss surface view draws the walked path", async ({ page }) => {
    await openExperiment(page);
    // Walk first, then switch to the surface: the path should already be on the
    // map (the walk survives the view swap — object constancy).
    await page.getByRole("button", { name: "Step ×10" }).click();
    await expect(page.getByRole("img", { name: /at step 10:/ })).toBeVisible();

    await page.getByRole("button", { name: "The surface", exact: true }).click();
    const surface = page.getByRole("img", { name: /Map of the loss surface/ });
    await expect(surface).toBeVisible();
    await expect(surface).toHaveAccessibleName(/10 steps/);
    await expect(page.getByText("the valley floor (OLS)")).toBeVisible();
    // The trail is drawn twice: a surface-coloured halo under the param-hue path.
    expect(await surface.locator("polyline").count()).toBe(2);

    // Scrubbing moves the dot — the surface is live, not a snapshot.
    await panel(page).getByLabel("Scrub through descent steps").fill("0");
    await expect(surface).toHaveAccessibleName(/current position is slope 0\.00/);
  });

  test("scenario switch resets the run with the scenario's learning rate", async ({ page }) => {
    await openExperiment(page);
    await page.getByRole("button", { name: "Step ×10" }).click();
    await expect(page.getByRole("img", { name: /at step 10:/ })).toBeVisible();
    await page.getByRole("button", { name: /too timid/i }).click();
    await expect(page.getByRole("img", { name: /at step 0:/ })).toBeVisible();
    await expect(page.getByText("1e-6")).toBeVisible();
  });
});
