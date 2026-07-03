import { expect, test, type Page } from "@playwright/test";

const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("fine-tuning-vs-prompting-vs-rag exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/fine-tuning-vs-prompting-vs-rag");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("the Story opens on the three-way comparison", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Fine-Tuning vs Prompting vs RAG" })).toBeVisible();
    await expect(page.getByRole("img", { name: /Three-way adaptation comparison/i }).first()).toBeVisible();
  });

  test("Run it: ticket and strategy sliders update the pipeline", async ({ page }) => {
    await openTab(page, "Run it");
    const ticket = panel(page).getByRole("slider", { name: /Support ticket/i });
    await ticket.fill("1");
    await expect(ticket).toHaveValue("1");
    const strategy = panel(page).getByRole("slider", { name: /Adaptation strategy/i });
    await strategy.fill("0");
    await expect(strategy).toHaveValue("0");
    await expect(panel(page).getByText(/Fine-tuning · Update weights/i)).toBeVisible();
  });

  test("See it enforces a committed prediction before the parameter reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 5 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page)
      .getByRole("button", { name: /RAG — refresh the doc index/i })
      .click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: stale fine-tune drops domain fit", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/Symptom · stale weights/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Repair · retrain weights/i }).click();
    await expect(panel(page).getByText(/Retrain or pair/i)).toBeVisible();
  });

  test("Explain it pairs the checks with the comparison companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/compare strategies on the same ticket/i)).toBeVisible();
    await expect(panel(page).getByText(/What does fine-tuning change/i)).toBeVisible();
  });
});
