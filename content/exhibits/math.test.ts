import { describe, expect, it } from "vitest";
import { gradientDescentMath } from "./gradient-descent/math";
import { linearRegressionMath } from "./linear-regression/math";
import { gradientDescentExperiment } from "./gradient-descent/experiment";
import { nodes } from "@content/graph/nodes";
import { olsFit } from "@/lib/models/linear-regression";

/**
 * Structural integrity of math drawers, plus the honesty pins: a drawer
 * that states a number about this lab's data must have that number
 * recomputed from the data and checked here. Prose drift is a red build.
 */

const drawers = [linearRegressionMath, gradientDescentMath];

const allText = (d: (typeof drawers)[number]): string =>
  d.sections
    .flatMap((s) =>
      s.blocks.map((b) =>
        b.kind === "prose" ? b.text : [...b.lines, b.caption ?? ""].join(" "),
      ),
    )
    .join(" ");

describe("math drawers", () => {
  for (const d of drawers) {
    describe(d.nodeId, () => {
      it("belongs to a real graph node", () => {
        expect(nodes.some((n) => n.id === d.nodeId)).toBe(true);
      });

      it("has an invitation and non-empty sections with unique ids", () => {
        expect(d.invitation.length).toBeGreaterThan(0);
        expect(d.sections.length).toBeGreaterThanOrEqual(1);
        const ids = d.sections.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const s of d.sections) {
          expect(s.heading.length).toBeGreaterThan(0);
          expect(s.blocks.length).toBeGreaterThanOrEqual(1);
        }
      });

      it("leans on real math nodes from the math wing", () => {
        expect(d.mathNodeIds.length).toBeGreaterThanOrEqual(1);
        for (const id of d.mathNodeIds) {
          const node = nodes.find((n) => n.id === id);
          expect(node, `math node "${id}" missing from the graph`).toBeDefined();
          expect(node!.kind).toBe("math");
        }
      });
    });
  }

  describe("honesty pins", () => {
    // The Hessian of MSE over (slope, intercept) is (2/n)·[[Σx², Σx],[Σx, n]].
    // Its largest eigenvalue sets the divergence ceiling η < 2/λmax that the
    // gradient-descent drawer states as ≈ 0.029, and the eigenvalue ratio is
    // the "about 135 times steeper" condition number.
    const points = gradientDescentExperiment.datasets[0].points;
    const n = points.length;
    let sxx = 0;
    let sx = 0;
    for (const p of points) {
      sxx += p.x * p.x;
      sx += p.x;
    }
    const a = (2 * sxx) / n;
    const b = (2 * sx) / n;
    const dd = 2;
    const tr = a + dd;
    const det = a * dd - b * b;
    const lmax = (tr + Math.sqrt(tr * tr - 4 * det)) / 2;
    const lmin = (tr - Math.sqrt(tr * tr - 4 * det)) / 2;

    it("the stated stability ceiling η ≈ 0.029 is the dataset's actual 2/λmax", () => {
      const ceiling = 2 / lmax;
      expect(ceiling).toBeGreaterThan(0.028);
      expect(ceiling).toBeLessThan(0.03);
      expect(allText(gradientDescentMath)).toContain("0.029");
    });

    it("the ceiling sits between the predict item's 0.02 and 0.04", () => {
      const ceiling = 2 / lmax;
      expect(ceiling).toBeGreaterThan(0.02);
      expect(ceiling).toBeLessThan(0.04);
    });

    it("the stated condition number ≈ 135 is the dataset's actual eigenvalue ratio", () => {
      const cond = lmax / lmin;
      expect(cond).toBeGreaterThan(130);
      expect(cond).toBeLessThan(140);
      expect(allText(gradientDescentMath)).toContain("135");
    });

    it("the linreg drawer's degenerate-x claim matches the implementation", () => {
      // "if every point shares the same x … the flat line through ȳ"
      const fit = olsFit([
        { x: 3, y: 2 },
        { x: 3, y: 4 },
        { x: 3, y: 9 },
      ]);
      expect(fit.slope).toBe(0);
      expect(fit.intercept).toBeCloseTo(5, 12);
      expect(allText(linearRegressionMath)).toMatch(/denominator is zero/);
    });
  });
});
