import { expect, test, type Page } from "@playwright/test";

/**
 * The loss-functions exhibit (regression cluster #1, four-act spine, interactive
 * status — See it + Run it). The central claim under test: switching the judge
 * refits the line, and the See-it prediction is committed before the reveal.
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
});
