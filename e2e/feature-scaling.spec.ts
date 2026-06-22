import { expect, test, type Page } from "@playwright/test";

/**
 * The feature-scaling exhibit (regression cluster, four-act spine — See it + Run
 * it at interactive). The claim under test: standardising the input rounds the loss
 * bowl (the toggle changes the surface and the readouts), and the See-it prediction
 * is committed before the reveal.
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
    await expect(panel(page).getByText(/the bowl is stretched/i)).toBeVisible();
    await panel(page).getByRole("button", { name: "Standardised", exact: true }).click();
    await expect(panel(page).getByText(/Round bowl/i).first()).toBeVisible();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /It rounds out/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });
});
