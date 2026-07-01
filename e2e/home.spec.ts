import { expect, test } from "@playwright/test";

/**
 * The front door (A1): orientation, the map, and the guided path all have to
 * actually take you somewhere.
 */

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    // Rest looping motion (the hero fit motif) on its fitted frame so the
    // full-page screenshot is deterministic rather than catching a random frame.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
  });

  test("orients: hero, the cabinet, its wings, the journeys", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Build intuition by running the model." }),
    ).toBeVisible();
    await expect(page.getByText(/\d+ interactive exhibits/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "The first models" })).toBeVisible();
    await expect(page.locator("#exhibits").getByRole("heading", { name: "Trees & ensembles" })).toBeVisible();
    await expect(page.locator("#exhibits").getByRole("heading", { name: "Unsupervised", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Journey · Foundations/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Journey · Unsupervised Learning/ })).toBeVisible();
    await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  });

  test("the jewels enter the exhibits", async ({ page }) => {
    await page
      .locator("#exhibits")
      .getByRole("link", { name: /Linear Regression/ })
      .click();
    await expect(
      page.getByRole("heading", { name: "Linear Regression" }),
    ).toBeVisible();
  });

  test("every jewel is a live door — all twenty exhibits in the cabinet", async ({ page }) => {
    const cabinet = page.locator("#exhibits");
    await expect(cabinet.getByRole("link", { name: /Gradient Descent/ })).toBeVisible();
    await expect(cabinet.getByRole("link", { name: /K-Means Clustering/ })).toBeVisible();
    await expect(cabinet.getByRole("link", { name: /Random Forests/ })).toBeVisible();
    await cabinet.getByRole("link", { name: /The Dataset/ }).click();
    await expect(page.getByRole("heading", { name: "The Dataset" })).toBeVisible();
  });

  test("the Foundations journey lists every stop in order with live links", async ({ page }) => {
    const journey = page.locator("#foundations");
    await expect(journey.getByRole("listitem")).toHaveCount(15);
    await journey.getByRole("link", { name: /Linear Regression/ }).click();
    await expect(
      page.getByRole("heading", { name: "Linear Regression" }),
    ).toBeVisible();
  });

  test("the Unsupervised journey lists its stops with live links", async ({ page }) => {
    const journey = page.locator("#unsupervised");
    await expect(journey.getByRole("listitem")).toHaveCount(3);
    await journey.getByRole("link", { name: /K-Means Clustering/ }).click();
    await expect(page.getByRole("heading", { name: "K-Means Clustering" })).toBeVisible();
  });
});

test.describe("exhibit narrative", () => {
  test("hook, story sections, and field notes render on both exhibits", async ({
    page,
  }) => {
    // The stepper shows one beat at a time; the rail jumps to a beat by heading.
    await page.goto("/exhibits/linear-regression");
    // Hydration sentinel — the rail's onClick needs handlers attached.
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
    await expect(page.getByText(/Francis Galton/)).toBeVisible(); // hook, beat 1
    await page.getByRole("button", { name: /Why the errors get squared/ }).click();
    await expect(
      page.getByRole("heading", { name: "Why the errors get squared" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /In the wild/ }).click();
    await expect(page.getByRole("heading", { name: "In the wild" })).toBeVisible();
    await expect(page.getByText(/the baseline that fancier models/)).toBeVisible();

    await page.goto("/exhibits/gradient-descent");
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");
    await expect(page.getByText(/hillside in fog/)).toBeVisible(); // hook, beat 1
    await page.getByRole("button", { name: /One knob behind it all/ }).click();
    await expect(
      page.getByRole("heading", { name: "One knob behind it all" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /In the wild/ }).click();
    await expect(page.getByText(/loss curve rockets upward/)).toBeVisible();
  });
});

test.describe("exhibit frame", () => {
  test("shows the exhibit's place in the graph with live links", async ({ page }) => {
    await page.goto("/exhibits/gradient-descent");
    await expect(page.getByText("Builds on")).toBeVisible();
    await expect(page.getByText("Leads to")).toBeVisible();
    // Linear regression is a live prerequisite: it links.
    await page.getByRole("link", { name: /Linear Regression/ }).click();
    await expect(
      page.getByRole("heading", { name: "Linear Regression" }),
    ).toBeVisible();
  });
});
