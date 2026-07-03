import { expect, test, type Page } from "@playwright/test";

const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("the-transformer exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/the-transformer");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on the next-token distribution", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "The Transformer" })).toBeVisible();
    await expect(page.getByText(/mat/i).first()).toBeVisible();
  });

  test("Run it: block, temperature, and stage sliders update the readout", async ({ page }) => {
    await openTab(page, "Run it");
    const blocks = panel(page).getByRole("slider", { name: /Stack depth/i });
    await blocks.fill("2");
    await expect(blocks).toHaveValue("2");
    const temperature = panel(page).getByRole("slider", { name: /Softmax temperature/i });
    await temperature.fill("25");
    await expect(temperature).toHaveValue("25");
    await expect(panel(page).getByRole("slider", { name: /Block stage/i })).toBeVisible();
  });

  test("See it enforces a committed prediction before the parameter reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 4 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page)
      .getByRole("button", { name: /routes context with attention/i })
      .click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: no-residual mode drops mat confidence", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Symptom · confidence drop/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Repair · residuals on/i }).click();
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the stack-depth companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/stack depth vs P\(mat\)/i)).toBeVisible();
    await expect(panel(page).getByText(/What are the core sublayers inside one transformer block/i)).toBeVisible();
  });
});
