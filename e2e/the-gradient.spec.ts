import { expect, test, type Page } from "@playwright/test";

/**
 * The-gradient exhibit (foundations, four-act spine — See it + Run it). The claim under
 * test: the gradient arrow points uphill and flips to −∇f in descent mode, and the
 * See-it prediction — that it sits perpendicular to the contour — is committed before
 * the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("the-gradient exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/the-gradient");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the ascent graphic", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "The Gradient" })).toBeVisible();
    await expect(panel(page).getByText(/Ascent — the gradient points uphill/i)).toBeVisible();
  });

  test("Run it: dragging is live and descent flips the arrow", async ({ page }) => {
    await openTab(page, "Run it");
    await expect(panel(page).getByRole("img", { name: /points uphill/i })).toBeVisible();
    await panel(page).getByRole("button", { name: /descent/i }).click();
    await expect(panel(page).getByRole("img", { name: /points downhill/i })).toBeVisible();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 3 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Perpendicular to it/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });
});
