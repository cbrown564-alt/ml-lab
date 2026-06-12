import { describe, expect, it } from "vitest";
import { gradientDescentCheck } from "./gradient-descent/concept-check";
import { linearRegressionCheck } from "./linear-regression/concept-check";
import { nodes } from "@content/graph/nodes";

/** Structural integrity of assessment content — broken checks can't ship. */

const checks = [linearRegressionCheck, gradientDescentCheck];

describe("concept checks", () => {
  for (const check of checks) {
    describe(check.nodeId, () => {
      it("belongs to a real graph node", () => {
        expect(nodes.some((n) => n.id === check.nodeId)).toBe(true);
      });

      it("every item has exactly one correct option and feedback on all of them", () => {
        for (const item of check.items) {
          const correct = item.options.filter((o) => o.correct === true);
          expect(correct, item.id).toHaveLength(1);
          for (const o of item.options) {
            expect(o.feedback.length, `${item.id}: "${o.label}"`).toBeGreaterThan(20);
          }
        }
      });

      it("item ids are unique", () => {
        const ids = check.items.map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});
