import { expect, test } from "@playwright/test";

/**
 * Browser verification of the gradient-descent exhibit. Time-control is the
 * whole exhibit (B3), so every transport affordance gets a smoke test:
 * step, play/pause, scrub, learning-rate knob, and the divergence auto-stop.
 */

test.describe("gradient-descent exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/gradient-descent");
  });

  test("renders the experiment at step 0 with target line and curve", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Gradient Descent" })).toBeVisible();
    await expect(page.getByText("step 0")).toBeVisible();
    await expect(page.getByRole("img", { name: /gradient descent is at step 0/ })).toBeVisible();
    await expect(page.getByRole("img", { name: /Training curve/ })).toBeVisible();
    await expect(page).toHaveScreenshot("gd-initial.png", { fullPage: true });
  });

  test("Step advances the descent and lowers the loss", async ({ page }) => {
    const lossBefore = await page.getByText(/loss = /).textContent();
    await page.getByRole("button", { name: "Step", exact: true }).click();
    await expect(page.getByText("step 1")).toBeVisible();
    await expect(page.getByText(/loss = /)).not.toHaveText(lossBefore!);

    await page.getByRole("button", { name: "Step ×10" }).click();
    await expect(page.getByText("step 11")).toBeVisible();
  });

  test("Play runs the descent and Pause stops it", async ({ page }) => {
    await page.getByRole("button", { name: "Play" }).click();
    await expect(page.getByText(/^step [1-9]\d*/)).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: "Pause" }).click();
    const frozen = await page.getByText(/^step /).textContent();
    await page.waitForTimeout(400);
    await expect(page.getByText(/^step /)).toHaveText(frozen!);
  });

  test("scrubbing rewinds the view to earlier steps", async ({ page }) => {
    await page.getByRole("button", { name: "Step ×10" }).click();
    await expect(page.getByText("step 10")).toBeVisible();

    await page.getByLabel("Scrub through descent steps").fill("0");
    // Back at step 0: the as-yet-unlearned line, with the run length shown.
    await expect(page.getByText("step 0 / 10")).toBeVisible();
    await expect(page.getByText(/ŷ = 0\.00·x \+ 0\.00/)).toBeVisible();
  });

  test("the learning-rate knob is live", async ({ page }) => {
    // The slider moves through exponents; -3 on the track is 1e-3.
    await page.getByLabel("Learning rate").fill("-3");
    await expect(page.getByText("0.0010")).toBeVisible();
  });

  test("'Over the edge' diverges, auto-pauses, and says so", async ({ page }) => {
    await page.getByRole("button", { name: /over the edge/i }).click();
    await page.getByRole("button", { name: "Play" }).click();
    await expect(page.getByText(/This is divergence/)).toBeVisible({ timeout: 15000 });
    // Auto-paused at the cliff edge: transport is disabled until restart.
    await expect(page.getByRole("button", { name: "Play" })).toBeDisabled();
    await page.getByRole("button", { name: "Restart descent" }).click();
    await expect(page.getByText("step 0")).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" })).toBeEnabled();
  });

  test("scenario switch resets the run with the scenario's learning rate", async ({ page }) => {
    await page.getByRole("button", { name: "Step ×10" }).click();
    await expect(page.getByText("step 10")).toBeVisible();
    await page.getByRole("button", { name: /too timid/i }).click();
    await expect(page.getByText("step 0")).toBeVisible();
    await expect(page.getByText("1e-6")).toBeVisible();
  });
});
