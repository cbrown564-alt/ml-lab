import { expect, test, type Page } from "@playwright/test";

/**
 * The bias-variance exhibit (regression cluster, four-act spine — See it + Run it).
 * The claim under test: cranking the polynomial degree drives the model from
 * underfitting to overfitting (training error → 0, test error climbs), and the
 * See-it prediction is committed before the U appears.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("bias-variance exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/bias-variance");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens underfitting", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Bias & Variance" })).toBeVisible();
    await expect(panel(page).getByText(/underfitting/i).first()).toBeVisible();
  });

  test("cranking the degree overfits — the regime flips", async ({ page }) => {
    await openTab(page, "Run it");
    const slider = panel(page).getByRole("slider").first();
    await slider.focus();
    for (let i = 0; i < 14; i++) await page.keyboard.press("End"); // degree → 12
    await expect(panel(page).getByText(/overfitting/i).first()).toBeVisible();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /bottoms out, then climbs/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it drives the overfit and dials it back", async ({ page }) => {
    await openTab(page, "Break it");
    const slider = panel(page).getByRole("slider").first();
    await slider.focus();
    for (let i = 0; i < 14; i++) await page.keyboard.press("End"); // degree → 12
    await expect(panel(page).getByRole("status")).toHaveText("Overfitting");
    for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowLeft"); // back toward the sweet spot
    await expect(panel(page).getByRole("status")).toHaveText("Generalising");
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Answer against the U/i)).toBeVisible();
    await expect(panel(page).getByText(/training error falls steadily toward zero/i)).toBeVisible();
  });
});
