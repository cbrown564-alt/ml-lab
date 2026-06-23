import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * The mechanism (the formal treatment) — now composed inside the Run it act as a
 * coordinated representation of the same model, not a separate tab or a collapsed
 * drawer — and the small-screen notice (docs/01 experience principles).
 */

const EXHIBITS = [
  {
    route: "/exhibits/linear-regression",
    equation: "w* = Σᵢ (xᵢ − x̄)(yᵢ − ȳ) / Σᵢ (xᵢ − x̄)²",
  },
  {
    route: "/exhibits/gradient-descent",
    equation: "η < 2 / λₘₐₓ",
  },
];

for (const { route, equation } of EXHIBITS) {
  test(`the mechanism on ${route} presents the formal treatment in Run it`, async ({ page }) => {
    await page.goto(route);
    // Hydration sentinel: the acts are client-side, so wait before switching.
    await expect(page.getByTestId("mastery-badge")).toHaveText("seen");

    // Intuition first, formalism on demand: the maths sits inside Run it, so the
    // formal equation isn't even mounted until that act is opened.
    await expect(page.getByText(equation)).toBeHidden();

    await page.getByRole("tab", { name: "Run it" }).click();
    const math = page.getByRole("tabpanel", { includeHidden: false });
    await expect(math.getByText(equation)).toBeVisible();

    // The view points into the math wing of the graph (the cross-link carries a → arrow).
    await expect(math.getByRole("link", { name: /The Gradient/ })).toBeVisible();

    // The opened view passes the same axe bar as everything else.
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      blocking,
      blocking.map((v) => `${v.id} (${v.impact})`).join("\n"),
    ).toEqual([]);
  });
}

test.describe("small screens", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("a phone gets the honest big-screen notice; reading stays available", async ({
    page,
  }) => {
    await page.goto("/exhibits/linear-regression");
    await expect(page.getByText(/built for a big screen/)).toBeVisible();
    // The prose is still there — a notice, not a wall.
    await expect(page.getByRole("heading", { name: "Linear Regression" })).toBeVisible();
  });
});

test("the notice stays out of the way on the design-target viewport", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText(/built for a big screen/)).toBeHidden();
});
