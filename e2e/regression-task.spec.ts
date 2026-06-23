import { expect, test, type Page } from "@playwright/test";

/**
 * The regression-task exhibit (foundations, four-act spine — See it + Run it). The claim
 * under test: a regression task predicts a continuous value scored by distance (the "be
 * the model" reveal), and splitting the target at a line makes it classification — scored
 * right-or-wrong (the committed See-it prediction).
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("regression-task exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/regression-task");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the anatomy framing", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Regression" })).toBeVisible();
    await expect(panel(page).getByText(/features in, a continuous answer out/i)).toBeVisible();
  });

  test("Run it: predict a value, reveal the truth, read the distance", async ({ page }) => {
    await openTab(page, "Run it");
    const svg = panel(page).locator("svg").first();
    const box = (await svg.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.4); // set a prediction
    await panel(page).getByRole("button", { name: /Reveal the score/i }).click();
    await expect(panel(page).getByText(/you were off by/i)).toBeVisible();
  });

  test("See it enforces a committed prediction on the classification contrast", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 3 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Right or wrong/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });
});
