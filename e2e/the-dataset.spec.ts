import { expect, test, type Page } from "@playwright/test";

/**
 * The the-dataset exhibit (foundations, four-act spine — See it + Run it). The claim under
 * test: the dataset is a matrix (rows = examples, columns = features + target) shown as a
 * linked table and scatter, and the See-it prediction — that the model learns only from
 * the table — is committed before the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("the-dataset exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/the-dataset");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on a single row", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "The Dataset" })).toBeVisible();
    await expect(panel(page).getByText(/One row — one example/i)).toBeVisible();
  });

  test("Run it links the table and the scatter", async ({ page }) => {
    await openTab(page, "Run it");
    await expect(panel(page).locator("tbody tr")).toHaveCount(12);
    await expect(panel(page).getByRole("columnheader", { name: /price/i })).toBeVisible();
    // hovering a row highlights its point in the scatter
    await panel(page).locator("tbody tr").nth(2).hover();
    await expect(panel(page).locator('svg circle[fill="var(--accent)"]')).toHaveCount(1);
  });

  test("See it enforces a committed prediction on the matrix beat", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 3 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Only the rows and columns/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: one bad row flattens the trend; removing it snaps back", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/flattens the whole trend/i)).toBeVisible();
    await panel(page).getByRole("checkbox").uncheck();
    await expect(panel(page).getByText(/snaps back/i)).toBeVisible();
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/One bad row/i)).toBeVisible();
    await expect(panel(page).getByText(/what do the rows and columns represent/i)).toBeVisible();
  });
});
