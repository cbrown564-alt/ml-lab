import { expect, test, type Page } from "@playwright/test";

/**
 * The neural-network-fundamentals exhibit (four-act spine — See it + Run it). The claim
 * under test: a network trains live (the step counter advances) and a single hidden unit
 * can't solve XOR (the stall warning), and the See-it prediction — that one hidden unit
 * is too few — is committed before the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("neural-network-fundamentals exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/neural-network-fundamentals");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the single-neuron stage", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Neural Network Fundamentals" })).toBeVisible();
    await expect(panel(page).getByText(/a straight line XOR defeats/i)).toBeVisible();
  });

  test("Run it trains live and a single hidden unit stalls", async ({ page }) => {
    await openTab(page, "Run it");
    await expect(panel(page).getByText(/^0 steps ·/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Train ▶/i }).click();
    await expect(panel(page).getByText(/\d+ steps ·/i)).not.toHaveText(/^0 steps ·/, { timeout: 4000 });
    // one hidden unit can't draw the X — the stall warning appears
    await panel(page).getByRole("button", { name: "1", exact: true }).click();
    await expect(panel(page).getByText(/can't draw the X/i)).toBeVisible();
  });

  test("See it enforces a committed prediction on the hidden-layer beat", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /one unit is still essentially one bend/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: high capacity overfits, low capacity generalises", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByRole("status")).toHaveText("Overfit — memorising noise");
    await panel(page).getByRole("button", { name: "4", exact: true }).click();
    await expect(panel(page).getByRole("status")).toHaveText("Generalising");
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/The capacity trade-off/i)).toBeVisible();
    await expect(panel(page).getByText(/collapses to a single linear map/i)).toBeVisible();
  });
});
