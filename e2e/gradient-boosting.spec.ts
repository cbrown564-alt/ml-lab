import { expect, test, type Page } from "@playwright/test";

/**
 * The gradient-boosting exhibit (trees cluster, node 3). The claims: the Story opens on a
 * single weak round; adding rounds in Run it eventually overshoots (held-out loss climbs);
 * the See-it prediction (more boosting overfits, unlike a forest) is committed before the
 * reveal; and Break it overshoots through both dials — too many rounds and too large a step.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("gradient-boosting exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/gradient-boosting");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on a single weak round", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Gradient Boosting" })).toBeVisible();
    await expect(panel(page).getByRole("img", { name: /boosted boundary after 1 round/i })).toBeVisible();
  });

  test("Run it: dragging rounds past the low point overshoots", async ({ page }) => {
    await openTab(page, "Run it");
    await panel(page).getByRole("slider", { name: "Boosting rounds" }).fill("200");
    await expect(panel(page).getByText(/Past the low point/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the overshoot reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 3 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /each boosting tree fits the last one's leftover errors/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: too many rounds overshoots the held-out loss", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
    await panel(page).getByRole("slider", { name: "Boosting rounds" }).fill("200");
    await expect(panel(page).getByText(/Symptom · it broke/i)).toBeVisible();
  });

  test("Break it: too large a learning rate overshoots", async ({ page }) => {
    await openTab(page, "Break it");
    await panel(page).getByRole("button", { name: "Steps too big" }).click();
    await panel(page).getByRole("button", { name: "1.50", exact: true }).click();
    await expect(panel(page).getByText(/Symptom · it broke/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the three-round instrument", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/The same booster, three round counts/i)).toBeVisible();
    await expect(panel(page).getByText(/never overfit from adding trees/i)).toBeVisible();
  });
});
