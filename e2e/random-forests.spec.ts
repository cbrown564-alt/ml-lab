import { expect, test, type Page } from "@playwright/test";

/**
 * The random-forests exhibit (trees cluster, node 2). The claims: the Story opens on one
 * jagged tree; growing the crowd in Run it smooths the vote and steadies it; the See-it
 * prediction (more trees can't overfit like depth) is committed before the reveal; and
 * Break it triggers the two jobs averaging can't do (fix bias, see past the data).
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("random-forests exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/random-forests");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on a single jagged tree", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Random Forests" })).toBeVisible();
    await expect(panel(page).getByRole("img", { name: /averaged vote of 1 decision tree/i })).toBeVisible();
  });

  test("Run it: growing the crowd settles the vote", async ({ page }) => {
    await openTab(page, "Run it");
    await panel(page).getByRole("slider", { name: "Trees in the forest" }).fill("60");
    await expect(panel(page).getByText(/the vote has settled/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the more-is-safe reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 3 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /more trees only steady the average/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: a forest of stumps underfits, and more trees can't fix it", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
    await panel(page).getByRole("slider", { name: "Depth per tree" }).fill("1");
    await expect(panel(page).getByText(/Symptom · it broke/i)).toBeVisible();
  });

  test("Break it: the forest is blind beyond the data", async ({ page }) => {
    await openTab(page, "Break it");
    await panel(page).getByRole("button", { name: "Beyond the data" }).click();
    await panel(page).getByRole("checkbox", { name: /Zoom out beyond the data/i }).check();
    await expect(panel(page).getByText(/Symptom · it broke/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the three-size instrument", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/The same forest, three sizes/i)).toBeVisible();
    await expect(panel(page).getByText(/will start to overfit/i)).toBeVisible();
  });
});
