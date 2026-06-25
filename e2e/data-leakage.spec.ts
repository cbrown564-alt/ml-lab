import { expect, test, type Page } from "@playwright/test";

/**
 * The data-leakage exhibit (regression cluster, four-act spine — See it + Run it).
 * The claim under test: selecting features on all the data manufactures a confident
 * CV score on pure noise, and moving the selection inside each fold collapses it to
 * the truth (~0); the See-it prediction is committed before the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("data-leakage exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/data-leakage");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the leaky pipeline", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Data Leakage" })).toBeVisible();
    await expect(panel(page).getByText(/selection peeked at test folds/i)).toBeVisible();
  });

  test("selecting inside each fold collapses the manufactured score", async ({ page }) => {
    await openTab(page, "Run it");
    await expect(panel(page).getByText(/looks like real skill/i)).toBeVisible();
    await panel(page).getByRole("button", { name: "Select inside each fold", exact: true }).click();
    await expect(panel(page).getByText(/the truth: ~0, no signal/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /collapses to about zero/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: selecting on all data manufactures skill, then the fix collapses it", async ({ page }) => {
    await openTab(page, "Break it");
    await panel(page).getByRole("button", { name: "Select on all data", exact: true }).click();
    await expect(panel(page).getByRole("status")).toHaveText("Wall breached");
    await panel(page).getByRole("button", { name: "Select inside each fold", exact: true }).click();
    await expect(panel(page).getByRole("status")).toHaveText("Pipe cleaned");
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Answer against the score/i)).toBeVisible();
    await expect(panel(page).getByText(/gave R² ≈ 0.41 on pure noise/i)).toBeVisible();
  });
});
