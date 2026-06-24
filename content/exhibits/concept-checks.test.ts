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

      it("every option-bearing item has exactly one correct option and feedback on all of them", () => {
        for (const item of check.items) {
          if (item.kind === "experiment-task") continue;
          // Open transfer items carry a model answer, not options — skip them.
          if (item.kind === "transfer" && item.open) continue;
          const options = item.options ?? [];
          const correct = options.filter((o) => o.correct === true);
          expect(correct, item.id).toHaveLength(1);
          for (const o of options) {
            expect(o.feedback.length, `${item.id}: "${o.label}"`).toBeGreaterThan(20);
          }
        }
      });

      it("open transfer items pose a model answer to reveal", () => {
        for (const item of check.items) {
          if (item.kind !== "transfer" || !item.open) continue;
          expect(item.open.answer.length, item.id).toBeGreaterThan(40);
          expect(item.options, `${item.id} must not also carry MCQ options`).toBeUndefined();
        }
      });

      it("predict items say what to set up and how to verify", () => {
        for (const item of check.items) {
          if (item.kind !== "predict") continue;
          expect(item.setup.length, item.id).toBeGreaterThan(20);
          expect(item.verify.length, item.id).toBeGreaterThan(20);
        }
      });

      it("experiment tasks carry real feedback and a namespaced event", () => {
        for (const item of check.items) {
          if (item.kind !== "experiment-task") continue;
          expect(item.feedback.length, item.id).toBeGreaterThan(20);
          // The event namespace ties the task to its own exhibit.
          expect(item.taskEvent, item.id).toMatch(
            new RegExp(`^${check.nodeId}:[a-z-]+$`),
          );
        }
      });

      it("predict and transfer items pose a real setup", () => {
        for (const item of check.items) {
          if (item.kind === "predict") expect(item.setup.length, item.id).toBeGreaterThan(20);
          if (item.kind === "transfer") expect(item.scenario.length, item.id).toBeGreaterThan(40);
        }
      });

      it("uses every assessment kind the exhibit has earned", () => {
        // Both flagship exhibits carry all four kinds (docs/06, B5 + success
        // metrics): retrieval, predict-then-verify, assessment-as-play, and the
        // north-star transfer item — application to a novel unseen case.
        const kinds = new Set(check.items.map((i) => i.kind));
        expect([...kinds].sort()).toEqual([
          "choice",
          "experiment-task",
          "predict",
          "transfer",
        ]);
      });

      it("item ids are unique", () => {
        const ids = check.items.map((i) => i.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});
