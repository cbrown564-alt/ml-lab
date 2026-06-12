import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * The math drawer (docs/01 exhibit anatomy) and the small-screen notice
 * (docs/01 experience principles) — both landed by the Phase 0 exit
 * review's punch list.
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
  test(`math drawer on ${route} opens to the formal treatment`, async ({ page }) => {
    await page.goto(route);

    const drawer = page.locator("details", { has: page.locator("summary") });
    const summary = drawer.locator("summary");
    await expect(summary).toHaveText(/Open the drawer/);

    // Closed by default: intuition first, formalism on demand.
    await expect(page.getByText(equation)).toBeHidden();

    await summary.click();
    await expect(page.getByText(equation)).toBeVisible();

    // The drawer points into the math wing of the graph.
    await expect(drawer.getByText("The Gradient", { exact: true })).toBeVisible();

    // The opened drawer passes the same axe bar as everything else.
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
