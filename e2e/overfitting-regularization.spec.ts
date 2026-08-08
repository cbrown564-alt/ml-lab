import { expect, test, type Page } from "@playwright/test";

/**
 * The overfitting & regularisation exhibit (regression cluster, four-act spine —
 * See it + Run it). The claim under test: a degree-12 model overfits at λ→0, and
 * turning up the ridge penalty reins it in (the regime flips); the See-it prediction
 * is committed before the reveal.
 */
const openTab = (page: Page, name: string) => page.getByRole("tab", { name }).click();
const panel = (page: Page) => page.getByRole("tabpanel", { includeHidden: false });

test.describe("overfitting-regularization exhibit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/overfitting-regularization");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
  });

  test("the Story opens overfitting", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Overfitting & Regularization" })).toBeVisible();
    await expect(panel(page).getByText(/overfitting/i).first()).toBeVisible();
  });

  test("turning up the penalty reins in the wiggle", async ({ page }) => {
    await openTab(page, "Run it");
    await expect(panel(page).getByText(/overfitting/i).first()).toBeVisible();
    const slider = panel(page).getByRole("slider", { name: "Penalty λ" });
    await slider.fill("-0.5"); // log10 λ ≈ -0.5 → λ ≈ 0.32
    await expect(panel(page).getByText(/reined in/i).first()).toBeVisible();
  });

  test("Hear the gap couples complexity, error, sound opt-in, and feedback", async ({ page }) => {
    await openTab(page, "Run it");
    const lab = panel(page).getByRole("region", { name: "Hear the gap" });
    const degree = lab.getByRole("slider");

    await degree.fill("8");
    await expect(
      lab.getByRole("img", { name: /Degree 8 polynomial/ }),
    ).toBeVisible();
    await expect(
      lab.getByText(
        "Degree 8: training error keeps falling while held-out error rises. The gap is overfitting.",
      ),
    ).toBeVisible();

    await lab.getByRole("button", { name: "Start sound" }).click();
    await expect(lab.getByRole("button", { name: "Mute sound" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await lab.getByRole("button", { name: "Mute sound" }).click();
    await expect(lab.getByRole("button", { name: "Start sound" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await lab.getByRole("button", { name: "Mark the turn here" }).click();
    await expect(lab.getByRole("status")).toContainText(
      "it began earlier—near degree 3",
    );

    await lab.getByRole("button", { name: "Reset" }).click();
    await expect(degree).toHaveValue("1");
    await expect(lab.getByRole("status")).toHaveCount(0);
  });

  test("Hear the gap disables automatic sweeping under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
    await openTab(page, "Run it");

    const lab = panel(page).getByRole("region", { name: "Hear the gap" });
    await expect(lab.getByRole("button", { name: "Play sweep" })).toBeDisabled();
    await expect(lab.getByRole("slider")).toBeEnabled();
  });

  test("See it enforces a committed prediction before the reveal", async ({ page }) => {
    await panel(page).getByRole("button", { name: /Beat 2 of/ }).click();
    await expect(panel(page).getByText(/Predict first/i)).toBeVisible();
    await panel(page).getByRole("button", { name: /relaxes toward the smooth shape/i }).click();
    await expect(panel(page).getByText(/You're right/)).toBeVisible();
  });

  test("Break it: over-penalising underfits, then dialling back rescues it", async ({ page }) => {
    await openTab(page, "Break it");
    const slider = panel(page).getByRole("slider").first();
    await slider.fill("1.7"); // log10 λ ≈ 1.7 → λ ≈ 50, far past the window
    await expect(panel(page).getByRole("status")).toHaveText("Over-penalised");
    await slider.fill("-0.5"); // λ ≈ 0.3, back in the window
    await expect(panel(page).getByRole("status")).toHaveText("Reined in");
  });

  test("Explain it pairs the check with a live companion", async ({ page }) => {
    await openTab(page, "Explain it");
    await expect(panel(page).getByText(/Answer against the dial/i)).toBeVisible();
    await expect(panel(page).getByText(/What is the penalty actually doing/i)).toBeVisible();
  });
});
