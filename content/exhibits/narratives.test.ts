import { describe, expect, it } from "vitest";
import { gradientDescentNarrative } from "./gradient-descent/narrative";
import { linearRegressionNarrative } from "./linear-regression/narrative";
import { nodes } from "@content/graph/nodes";

/** Structural integrity of narrative content. */

const narratives = [linearRegressionNarrative, gradientDescentNarrative];

describe("narratives", () => {
  for (const n of narratives) {
    describe(n.nodeId, () => {
      it("belongs to a real graph node", () => {
        expect(nodes.some((node) => node.id === n.nodeId)).toBe(true);
      });

      it("has a hook, a multi-section story, and field notes", () => {
        expect(n.hook.length).toBeGreaterThanOrEqual(1);
        expect(n.story.length).toBeGreaterThanOrEqual(2);
        expect(n.fieldNotes.length).toBeGreaterThanOrEqual(1);
        for (const s of n.story) {
          expect(s.heading.length).toBeGreaterThan(0);
          expect(s.paragraphs.length).toBeGreaterThanOrEqual(1);
        }
      });

      it("section ids are unique", () => {
        const ids = n.story.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });
  }
});
