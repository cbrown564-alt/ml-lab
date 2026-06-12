import { expect, test } from "@playwright/test";

/**
 * The learner model end-to-end (B5/A2): concept checks give explanatory
 * feedback, results feed mastery, and mastery survives a reload (IndexedDB).
 */

test.describe("concept check + mastery", () => {
  test("a wrong answer explains the misconception; correcting it counts", async ({
    page,
  }) => {
    await page.goto("/exhibits/linear-regression");
    const check = page.locator("section", {
      hasText: "Check your understanding",
    });

    await check
      .getByRole("button", { name: /passes through as many points/ })
      .click();
    await expect(check.getByText(/Not quite/).first()).toBeVisible();
    await expect(
      check.getByText(/usually passes through none of the points/),
    ).toBeVisible();

    await check
      .getByRole("button", { name: /sum of squared vertical distances/ })
      .click();
    await expect(check.getByText(/Right\./).first()).toBeVisible();
  });

  test("visiting marks seen; answering everything correctly masters; it persists", async ({
    page,
  }) => {
    await page.goto("/exhibits/gradient-descent");

    // The visit alone earns "seen" on the exhibit header.
    await expect(page.getByText("seen", { exact: true })).toBeVisible();

    const check = page.locator("section", {
      hasText: "Check your understanding",
    });
    await check.getByRole("button", { name: /overshot the valley/ }).click();
    await check
      .getByRole("button", { name: /gradient gets smaller as the surface flattens/ })
      .click();
    await check.getByRole("button", { name: /points uphill/ }).click();

    await expect(page.getByText("mastered", { exact: true })).toBeVisible();

    // Mastery is local-first state: a fresh load still knows.
    await page.reload();
    await expect(page.getByText("mastered", { exact: true })).toBeVisible();

    // And the home journey shows it.
    await page.goto("/");
    await expect(
      page.locator("#foundations").getByText("mastered", { exact: true }),
    ).toBeVisible();
  });

  test("an unfinished exhibit becomes an explainable recommendation", async ({
    page,
  }) => {
    // Visiting earns "seen" — enough to have started, not enough to finish.
    await page.goto("/exhibits/linear-regression");
    await expect(page.getByText("seen", { exact: true })).toBeVisible();

    await page.goto("/");
    const next = page.getByRole("region", { name: "Your next step" });
    await expect(next).toBeVisible();
    await expect(
      next.getByText(/You've explored Linear Regression but haven't taken its concept check/),
    ).toBeVisible();

    // The recommendation is a working door.
    await next.getByRole("link", { name: /Linear Regression/ }).click();
    await expect(page).toHaveURL(/exhibits\/linear-regression/);
  });
});
