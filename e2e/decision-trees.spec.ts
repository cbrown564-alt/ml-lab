import { expect, test, type Page } from "@playwright/test";

/**
 * The decision-trees exhibit (trees cluster opener, full four-act spine). The claims
 * under test: the Story opens on the straight line that can't bend; the depth knob grows
 * the tree to a 100%-on-training overfit in Run it and Break it; the See-it prediction
 * (a perfectly pure tree generalizes worse) is committed before the reveal; and Explain
 * it pairs the checks with the live three-depth instrument.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("decision-trees exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/decision-trees");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the straight line that can't bend", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Decision Trees" })).toBeVisible();
    await expect(
      panel(page).getByRole("img", { name: /cannot follow the curve/i }),
    ).toBeVisible();
  });

  test("Run it: dragging depth to the maximum overfits the tree", async ({ page }) => {
    await openTab(page, "Run it");
    const depth = panel(page).getByRole("slider", { name: "Tree depth" });
    await depth.fill("7");
    // At full depth the tree memorizes training — the readout caption says so.
    await expect(panel(page).getByText(/Memorized — perfect on training/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the overfitting reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 4 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /memorizes flukes/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: pushing depth to the max breaks the held-out score", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Trigger it/i)).toBeVisible();
    await panel(page).getByRole("slider", { name: "Tree depth" }).fill("7");
    await expect(panel(page).getByText(/Symptom · it broke/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the three-depth instrument", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/The same tree, three depths/i)).toBeVisible();
    await expect(panel(page).getByText(/looks like a staircase/i)).toBeVisible();
  });
});
