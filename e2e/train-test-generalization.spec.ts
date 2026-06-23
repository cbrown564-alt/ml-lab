import { expect, test, type Page } from "@playwright/test";

/**
 * The train-test-generalization exhibit (foundations, four-act spine — See it + Run
 * it). The claim under test: reshuffling the split draws a new random partition (a
 * lottery), and the See-it prediction — that the test error jumps — is committed
 * before the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("train-test-generalization exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/train-test-generalization");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the split graphic", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Train, Test & Generalization" })).toBeVisible();
    await expect(panel(page).getByText(/One split — one number/i)).toBeVisible();
  });

  test("Run it reshuffles the split and tracks the spread", async ({ page }) => {
    await openTab(page, "Run it");
    await expect(panel(page).getByText(/5-fold CV error/i)).toBeVisible();
    const reshuffle = panel(page).getByRole("button", { name: /Reshuffle the split/i });
    await reshuffle.click();
    await reshuffle.click();
    // three splits drawn now (the initial + two reshuffles) — the spread strip is live
    await expect(panel(page).getByText(/3 splits drawn/i)).toBeVisible();
    await expect(panel(page).getByRole("img", { name: /Test error from .* random splits/i })).toBeVisible();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /It jumps around/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });
});
