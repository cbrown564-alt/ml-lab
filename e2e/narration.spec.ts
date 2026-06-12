import { expect, test } from "@playwright/test";

/**
 * Narration audio (docs/06, B4): the prose reads itself aloud and the
 * transcript — the prose itself — follows word by word.
 */

test.describe("narration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/exhibits/linear-regression");
    // Hydration sentinel — see gradient-descent.spec.ts.
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
  });

  test("each section can read itself aloud with a word-synced transcript", async ({
    page,
  }) => {
    // Hook + every story section carries a Listen button.
    const buttons = page.getByRole("button", { name: /^Listen/ });
    expect(await buttons.count()).toBeGreaterThanOrEqual(4);

    const first = buttons.first();
    await first.scrollIntoViewIfNeeded();
    await first.click();
    await expect(page.getByRole("button", { name: /^Pause/ }).first()).toBeVisible();

    // The narrator reaches the first words; the transcript follows.
    await expect(page.locator("[data-word][data-active]").first()).toBeVisible({
      timeout: 5000,
    });

    // Pausing returns the button.
    await page.getByRole("button", { name: /^Pause/ }).first().click();
    await expect(first).toHaveText(/Listen/);
  });

  test("starting one narration stops another", async ({ page }) => {
    const buttons = page.getByRole("button", { name: /^Listen/ });
    await buttons.first().scrollIntoViewIfNeeded();
    await buttons.first().click();
    await expect(page.getByRole("button", { name: /^Pause/ })).toHaveCount(1);

    // The first *remaining* Listen button is the next section.
    await buttons.first().scrollIntoViewIfNeeded();
    await buttons.first().click();
    await expect(page.getByRole("button", { name: /^Pause/ })).toHaveCount(1);
  });
});
