import { expect, test, type Page } from "@playwright/test";

/**
 * The classification-task exhibit (classification cluster, four-act spine — See it +
 * Run it). The claim under test: the decision threshold trades precision against
 * recall (the regime flips between eager and cautious), and the See-it prediction —
 * that raising the threshold lowers recall — is committed before the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("classification-task exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/classification-task");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the decision conveyor", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Classification" })).toBeVisible();
    await expect(panel(page).getByRole("img", { name: /decision conveyor/i })).toBeVisible();
  });

  test("dragging the threshold flips between eager and cautious", async ({ page }) => {
    await openTab(page, "Run it");
    const slider = panel(page).getByRole("slider").first();
    await slider.fill("0.05");
    await expect(panel(page).getByText(/eager — catch every positive/i)).toBeVisible();
    await slider.fill("0.92");
    await expect(panel(page).getByText(/cautious — few, sure positives/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 1 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Recall falls/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: the imbalance trap, then lowering the threshold catches positives", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByRole("status")).toHaveText("95% accurate, useless");
    await panel(page).getByRole("slider").first().fill("0.3");
    await expect(panel(page).getByRole("status")).toHaveText("Catching positives");
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Answer against the matrix/i)).toBeVisible();
    await expect(panel(page).getByText(/why is that accuracy meaningless/i)).toBeVisible();
  });
});
