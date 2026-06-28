import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Accessibility gate (docs/06, A6): axe-core over every live surface.
 * Serious and critical violations fail the build — comfort is not a polish
 * pass, it's an entry requirement.
 *
 * ROUTES mirrors content/exhibits/index.ts (liveExhibits) plus the homepage;
 * keep it in sync when an exhibit goes live. Each route is checked in its
 * opening (See it) state. Acts that have surfaced act-specific violations get
 * an explicit regression guard below, since the opening sweep can't see them.
 */

const ROUTES = [
  "/",
  "/exhibits/what-is-ml",
  "/exhibits/the-dataset",
  "/exhibits/regression-task",
  "/exhibits/linear-regression",
  "/exhibits/loss-functions",
  "/exhibits/gradient-descent",
  "/exhibits/feature-scaling",
  "/exhibits/train-test-generalization",
  "/exhibits/bias-variance",
  "/exhibits/data-leakage",
  "/exhibits/overfitting-regularization",
  "/exhibits/classification-task",
  "/exhibits/logistic-regression",
  "/exhibits/neural-network-fundamentals",
  "/exhibits/the-gradient",
  "/exhibits/decision-trees",
  "/exhibits/random-forests",
];

/** Serious/critical axe violations on the current page, formatted for the failure message. */
async function blockingAxe(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(", ")}`);
}

for (const route of ROUTES) {
  test(`axe: ${route} has no serious or critical violations`, async ({ page }) => {
    await page.goto(route);
    const blocking = await blockingAxe(page);
    expect(blocking, blocking.join("\n")).toEqual([]);
  });
}

// Act-specific regression guard. The interactive neural-network bench renders
// hidden units as focusable buttons, so the diagram must not declare an image
// role and then nest those controls (axe nested-interactive). This act is not
// reachable by the opening sweep above. See NetworkDiagram.tsx.
test("axe: neural-network Run it has no serious or critical violations", async ({ page }) => {
  await page.goto("/exhibits/neural-network-fundamentals");
  await page.getByRole("tab", { name: "Run it" }).click();
  await page.getByRole("tabpanel", { includeHidden: false }).waitFor();
  const blocking = await blockingAxe(page);
  expect(blocking, blocking.join("\n")).toEqual([]);
});
