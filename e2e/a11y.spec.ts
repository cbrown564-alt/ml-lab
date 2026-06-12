import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Accessibility gate (docs/06, A6): axe-core over every live surface.
 * Serious and critical violations fail the build — comfort is not a polish
 * pass, it's an entry requirement.
 */

const ROUTES = ["/", "/exhibits/linear-regression", "/exhibits/gradient-descent"];

for (const route of ROUTES) {
  test(`axe: ${route} has no serious or critical violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      blocking,
      blocking
        .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(", ")}`)
        .join("\n"),
    ).toEqual([]);
  });
}
