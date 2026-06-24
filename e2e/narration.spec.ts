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

  test("a section reads itself aloud with a word-synced transcript", async ({
    page,
  }) => {
    // The stepper shows one beat at a time; the active beat carries a Listen.
    const listen = page.getByRole("button", { name: /^Listen/ });
    await expect(listen).toHaveCount(1);
    await listen.click();
    await expect(page.getByRole("button", { name: /^Pause/ })).toBeVisible();

    // The narrator reaches the first words; the transcript follows.
    await expect(page.locator("[data-word][data-active]").first()).toBeVisible({
      timeout: 5000,
    });

    // Pausing returns the button.
    await page.getByRole("button", { name: /^Pause/ }).click();
    await expect(page.getByRole("button", { name: /^Listen/ })).toBeVisible();

    // A later beat narrates too — every story section carries its own audio.
    await page.getByRole("button", { name: /Why the errors get squared/ }).click();
    await expect(page.getByRole("button", { name: /^Listen/ })).toBeVisible();
  });

  test("stepping to another beat stops the narration", async ({ page }) => {
    // One narrator at a time: with a single beat mounted, stepping away unmounts
    // the playing section and stops it.
    await page.getByRole("button", { name: /^Listen/ }).click();
    await expect(page.getByRole("button", { name: /^Pause/ })).toHaveCount(1);

    await page.getByRole("button", { name: "Next beat" }).click();
    await expect(page.getByRole("button", { name: /^Pause/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Listen/ })).toBeVisible();
  });
});
