import { expect, test, type Page } from "@playwright/test";

/**
 * The loss-functions exhibit (regression cluster #1, full four-act spine). The
 * central claim under test: switching the judge refits the line; the See-it
 * prediction is committed before the reveal; the Break-it loop stages the outlier
 * failure and its repair; Explain it pairs the check with a live companion.
 */

const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("loss-functions exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/loss-functions");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the three-judge graphic", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Loss Functions" })).toBeVisible();
    await expect(panel(page).getByText(/One cloud, three judges/i)).toBeVisible();
    await expect(panel(page).getByText(/How each judge scores a miss/i).first()).toBeVisible();
  });

  test("switching the judge in Run it refits the line", async ({ page }) => {
    await openTab(page, "Run it");
    const plot = panel(page).getByRole("group", { name: /fitted three ways/i });
    const before = await plot.getAttribute("aria-label");
    // squared error tilts off chasing the outliers; absolute holds the bulk.
    await panel(page).getByRole("button", { name: "Absolute", exact: true }).click();
    expect(await plot.getAttribute("aria-label")).not.toBe(before);
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page)
      .getByRole("button", { name: /its penalty for a far miss is enormous/i })
      .click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it stages the outlier failure loop and its repair", async ({ page }) => {
    await openTab(page, "Break it");
    await panel(page).getByRole("button", { name: /Drop in three rogue points/i }).click();
    await expect(panel(page).getByText("Pulled off true", { exact: true })).toBeVisible();
    await panel(page).getByRole("button", { name: "Huber", exact: true }).click();
    await expect(panel(page).getByText("Holds the trend", { exact: true })).toBeVisible();
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Answer against the judges/i)).toBeVisible();
    await expect(panel(page).getByText(/Why does squared error react so strongly/i)).toBeVisible();
  });
});
