import { expect, test, type Page } from "@playwright/test";

const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("embeddings exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/embeddings");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on king with nearest neighbours highlighted", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Embeddings" })).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Embedding map for king in learned coordinates/i }).first(),
    ).toBeVisible();
  });

  test("Run it: anchor and layout sliders update the neighbour list", async ({ page }) => {
    await openTab(page, "Run it");
    const anchor = panel(page).getByRole("slider", { name: /Anchor token/i });
    await anchor.fill("0");
    await expect(anchor).toHaveValue("0");
    const layout = panel(page).getByRole("slider", { name: /Coordinate system/i });
    await layout.fill("1");
    await expect(layout).toHaveValue("1");
    await expect(panel(page).getByText(/PCA scatter/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the parameter reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 3 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page)
      .getByRole("button", { name: /training objective preserved relational directions/i })
      .click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: one-hot mode triggers the no-neighbours failure", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Symptom · no neighbours/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Repair · learned embeddings/i }).click();
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the learned vs PCA companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/king's neighbours — learned vs PCA/i)).toBeVisible();
    await expect(panel(page).getByText(/What is an embedding in a language model/i)).toBeVisible();
  });
});
