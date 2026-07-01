import { expect, test, type Page } from "@playwright/test";

/**
 * The PCA exhibit (unsupervised cluster opener). The claims under test: the story opens
 * on the raw correlated cloud, See it commits a prediction before the 1-D collapse,
 * Run it toggles between lossy and exact reconstruction, and Break it shows units
 * skewing the principal direction until standardization repairs it.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("pca exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/pca");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on the raw correlated cloud", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Principal Component Analysis" })).toBeVisible();
    await expect(panel(page).getByText(/Raw cloud — correlated features/i)).toBeVisible();
  });

  test("Run it toggles from 1-D compression to exact reconstruction", async ({ page }) => {
    await openTab(page, "Run it");
    await expect(panel(page).getByRole("button", { name: "Keep PC1 only" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await panel(page).getByRole("button", { name: "Keep PC1 + PC2" }).click();
    await expect(
      panel(page).getByRole("button", { name: "Keep PC1 + PC2" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(panel(page).getByText(/exactly on top of the originals/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the collapse reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 3 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page)
      .getByRole("button", {
        name: /thickness perpendicular to PC1 disappears/i,
      })
      .click();
    await expect(panel(page).getByText(/You're right/i)).toBeVisible();
  });

  test("Break it repairs the skewed raw-units component by standardizing first", async ({
    page,
  }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Symptom · it broke/i)).toBeVisible();
    await panel(page).getByRole("button", { name: "Standardised first" }).click();
    await expect(panel(page).getByText(/Repaired ✓/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the compact PCA companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Answer against the compressed cloud/i)).toBeVisible();
    await expect(panel(page).getByText(/What exactly is PC1 choosing/i)).toBeVisible();
  });
});
