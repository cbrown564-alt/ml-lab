import { expect, test, type Page } from "@playwright/test";

/**
 * The what-is-ml exhibit (foundations, four-act spine — See it + Run it). The claim under
 * test: a hand-written single-feature rule tops out, the machine learns a better one from
 * the labelled examples, and the See-it prediction — that the machine needs labelled
 * examples — is committed before the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("what-is-ml exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/what-is-ml");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens on the hand-written rule", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "What is Machine Learning?" })).toBeVisible();
    await expect(panel(page).getByText(/one feature, one cut/i)).toBeVisible();
  });

  test("Run it: a hand rule tops out, the machine learns a better one", async ({ page }) => {
    await openTab(page, "Run it");
    await expect(panel(page).getByText(/your hand-written rule/i)).toBeVisible();
    await expect(panel(page).getByText(/the learned rule/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Learn from the examples/i }).click();
    // the learned rule beats the hand rule by a margin
    await expect(panel(page).getByText(/That's machine learning/i)).toBeVisible();
  });

  test("See it enforces a committed prediction on the inversion beat", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 3 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /Examples labeled with the right answers/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: biased labels yield a biased rule; clean data fixes it", async ({ page }) => {
    await openTab(page, "Break it");
    await expect(panel(page).getByText(/learned the bias/i)).toBeVisible();
    await panel(page).getByRole("slider").first().fill("0");
    await expect(panel(page).getByText(/Repaired/i)).toBeVisible();
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Bias in, bias out/i)).toBeVisible();
    await expect(panel(page).getByText(/conventional programming/i)).toBeVisible();
  });
});
