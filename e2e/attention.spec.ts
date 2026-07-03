import { expect, test, type Page } from "@playwright/test";

const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("attention exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/attention");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on sat attending to cat", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Attention" })).toBeVisible();
    await expect(
      page.getByRole("img", { name: /Attention story frame: sat query on Syntax head/i }).first(),
    ).toBeVisible();
  });

  test("Run it: query and head sliders update the heatmap", async ({ page }) => {
    await openTab(page, "Run it");
    const query = panel(page).getByRole("slider", { name: /Query token/i });
    await query.fill("3");
    await expect(query).toHaveValue("3");
    const head = panel(page).getByRole("slider", { name: /Attention head/i });
    await head.fill("1");
    await expect(head).toHaveValue("1");
    await expect(panel(page).getByText(/Peak route: on →/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the parameter reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 4 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page)
      .getByRole("button", { name: /Different heads can specialise/i })
      .click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: uniform mode triggers flat weights", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Symptom · flat weights/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Repair · learned logits/i }).click();
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the sat vs on companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/syntax routes — sat vs on/i)).toBeVisible();
    await expect(panel(page).getByText(/What does self-attention compute/i)).toBeVisible();
  });
});
