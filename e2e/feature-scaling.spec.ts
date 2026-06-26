import { expect, test, type Page } from "@playwright/test";

/**
 * The feature-scaling exhibit (regression cluster, full four-act spine). The claim
 * under test: standardising rounds the loss bowl; the See-it prediction is committed
 * before the reveal; the Break-it loop shows a bigger step diverging on raw units and
 * the same step converging once standardised.
 */

const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("feature-scaling exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/feature-scaling");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the stretched-valley surface", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Feature Scaling" })).toBeVisible();
    await expect(panel(page).getByText(/Raw units — a stretched valley/i)).toBeVisible();
  });

  test("toggling to standardised rounds the bowl", async ({ page }) => {
    await openTab(page, "Run it");
    // StatGrid note text is always present in raw state
    await expect(panel(page).getByText(/bowl stretch — 1 is round/i)).toBeVisible();
    await panel(page).getByRole("button", { name: "Standardised", exact: true }).click();
    await expect(panel(page).getByRole("button", { name: "Standardised", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /It rounds out/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: a bigger step diverges on raw, then standardising rescues it", async ({ page }) => {
    await openTab(page, "Break it");
    const slider = panel(page).getByRole("slider").first();
    await slider.fill("-0.5"); // η ≈ 0.32, above the raw bowl's stability ceiling
    await panel(page).getByRole("button", { name: /Set this rate & run/i }).click();
    await expect(panel(page).getByText("Diverged", { exact: true })).toBeVisible({ timeout: 10000 });
    await panel(page).getByRole("button", { name: "standardised", exact: true }).click();
    await panel(page).getByRole("button", { name: /Set this rate & run/i }).click();
    await expect(panel(page).getByText("Reached the floor", { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Answer against the bowl/i)).toBeVisible();
    await expect(panel(page).getByText(/what about the surface forces this/i)).toBeVisible();
  });
});
