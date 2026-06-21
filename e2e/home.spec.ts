import { expect, test } from "@playwright/test";

/**
 * The front door (A1): orientation, the map, and the guided path all have to
 * actually take you somewhere.
 */

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("orients: hero, open exhibits, map, journey", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Get your hands on machine learning." }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Now showing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The map" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Journey · Foundations/ })).toBeVisible();
    await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  });

  test("exhibit cards enter the exhibits", async ({ page }) => {
    await page
      .getByRole("link", { name: /Linear Regression.*Enter exhibit/s })
      .click();
    await expect(
      page.getByRole("heading", { name: "Linear Regression" }),
    ).toBeVisible();
  });

  test("the map's open doors navigate; closed rooms do not", async ({ page }) => {
    const map = page.locator("#map");
    await expect(map.getByRole("link", { name: /Gradient Descent/ })).toBeVisible();
    // Stub nodes are present on the map but are not links.
    await expect(map.getByText("Logistic Regression")).toBeVisible();
    await expect(map.getByRole("link", { name: /Logistic Regression/ })).toHaveCount(0);

    await map.getByRole("link", { name: /Gradient Descent/ }).click();
    await expect(page.getByRole("heading", { name: "Gradient Descent" })).toBeVisible();
  });

  test("the journey lists every stop in order with live links", async ({ page }) => {
    const journey = page.locator("#foundations");
    await expect(journey.getByRole("listitem")).toHaveCount(11);
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
    await page.goto("/exhibits/linear-regression");
    await expect(page.getByText(/Francis Galton/)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Why the errors get squared" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();

    await page.goto("/exhibits/gradient-descent");
    await expect(page.getByText(/hillside in fog/)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "One knob behind it all" }),
    ).toBeVisible();
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
