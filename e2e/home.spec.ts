import { expect, test } from "@playwright/test";

/**
 * The front door (A1): orientation, the map, and the guided path all have to
 * actually take you somewhere.
 */

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("orients: hero, the cabinet, its wings, the journey", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Get your hands on machine learning." }),
    ).toBeVisible();
    await expect(page.getByText(/Now showing · \d+ exhibits/)).toBeVisible();
    // The cabinet is curated into wings — the grouping is on the page as headings.
    await expect(page.getByRole("heading", { name: "The first models" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Journey · Foundations/ })).toBeVisible();
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

  test("every jewel is a live door — every node now has an exhibit", async ({ page }) => {
    const cabinet = page.locator("#exhibits");
    await expect(cabinet.getByRole("link", { name: /Gradient Descent/ })).toBeVisible();
    // Every foundations node now has a live exhibit — including the last one to land.
    await cabinet.getByRole("link", { name: /The Dataset/ }).click();
    await expect(page.getByRole("heading", { name: "The Dataset" })).toBeVisible();
  });

  test("the journey lists every stop in order with live links", async ({ page }) => {
    const journey = page.locator("#foundations");
    await expect(journey.getByRole("listitem")).toHaveCount(14);
    await journey.getByRole("link", { name: /Linear Regression/ }).click();
    await expect(
      page.getByRole("heading", { name: "Linear Regression" }),
    ).toBeVisible();
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
    await expect(page.getByText(/what's the learning rate\?/)).toBeVisible();
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
