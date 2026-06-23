import { expect, test, type Page } from "@playwright/test";

/**
 * The logistic-regression exhibit (classification cluster, four-act spine — See it +
 * Run it at interactive). The claim under test: training swings the decision boundary
 * into place (accuracy climbs to the scipy-verified 93%), and the See-it prediction —
 * that no straight line can separate the overlap — is committed before the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("logistic-regression exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/logistic-regression");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the decision boundary", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Logistic Regression" })).toBeVisible();
    await expect(panel(page).getByRole("img", { name: /logistic decision boundary/i })).toBeVisible();
  });

  test("training in Run it drives the boundary to the scipy-verified fit", async ({ page }) => {
    await openTab(page, "Run it");
    // scrub the training to convergence; accuracy reaches 93% (56/60)
    await panel(page).getByRole("slider").first().fill("220");
    await expect(panel(page).getByText("93%")).toBeVisible();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /no straight line can separate/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });
});
