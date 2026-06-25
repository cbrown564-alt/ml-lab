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
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen"); // hydration
    await page.getByRole("tab", { name: "Explain it" }).click();
    const check = page.getByRole("tabpanel", { includeHidden: false });

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
    const badge = page.getByTestId("mastery-badge");
    await expect(badge).toHaveText("seen");

    await page.getByRole("tab", { name: "Explain it" }).click();
    const check = page.getByRole("tabpanel", { includeHidden: false });
    await check.getByRole("button", { name: /overshot the valley/ }).click();
    await check
      .getByRole("button", { name: /gradient gets smaller as the surface flattens/ })
      .click();
    await check.getByRole("button", { name: /points uphill/ }).click();
    await check.getByRole("button", { name: /Astronomically worse/ }).click();
    // The transfer item is the open form (rubric v2 §1c): write the diagnosis in
    // your own words, then commit to resolve it (commit + reveal, not recognition).
    await check
      .getByRole("textbox")
      .fill("Their steps are tiny, so raise the learning rate to cover more ground each step.");
    await check.getByRole("button", { name: /Save my answer and compare/ }).click();

    // The lab task is the last gate: mastery requires actually diverging — and the
    // divergence happens over in the Experiment tab; the task bus carries it back.
    await expect(badge).not.toHaveText("mastered");
    await page.getByRole("tab", { name: "Run it" }).click();
    await page.getByRole("button", { name: /over the edge/i }).click();
    await page.getByRole("button", { name: "Play" }).click();
    await expect(page.getByText(/This is divergence/)).toBeVisible({ timeout: 15000 });

    await page.getByRole("tab", { name: "Explain it" }).click();
    await expect(check.getByText(/Complete — the experiment registered it/)).toBeVisible();

    await expect(badge).toHaveText("mastered");

    // Mastery is local-first state: a fresh load still knows.
    await page.reload();
    await expect(badge).toHaveText("mastered");

    // And the home trail shows it — the station carries its mastery state.
    await page.goto("/");
    await expect(
      page.locator('#foundations [data-node-id="gradient-descent"]'),
    ).toHaveAttribute("data-mastery", "mastered");
  });

  test("an unfinished exhibit becomes an explainable recommendation", async ({
    page,
  }) => {
    // Visiting earns "seen" — enough to have started, not enough to finish.
    await page.goto("/exhibits/linear-regression");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");

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
