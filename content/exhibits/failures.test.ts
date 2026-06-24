import { describe, expect, it } from "vitest";
import { FailureGallerySchema } from "@/lib/failure/schema";
import { linearRegressionFailures } from "@content/exhibits/linear-regression/failures";
import { gradientDescentFailures } from "@content/exhibits/gradient-descent/failures";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";
import { gradientDescentExperiment } from "@content/exhibits/gradient-descent/experiment";

/**
 * Honesty pins for the failure galleries (docs/07-failure-taxonomy.md): every
 * card conforms to the schema, the gallery is anchored to its node, card ids are
 * unique, and any card that claims a live scenario names one that actually
 * exists in the exhibit's experiment spec — a card cannot promise a reproduction
 * the bench can't deliver.
 */
const galleries = [
  { gallery: linearRegressionFailures, spec: linearRegressionExperiment },
  { gallery: gradientDescentFailures, spec: gradientDescentExperiment },
];

describe("failure galleries", () => {
  for (const { gallery, spec } of galleries) {
    describe(gallery.nodeId, () => {
      it("conforms to the FailureGallery schema", () => {
        const result = FailureGallerySchema.safeParse(gallery);
        expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
      });

      it("is anchored to its exhibit node", () => {
        expect(gallery.nodeId).toBe(spec.id);
      });

      it("has unique card ids", () => {
        const ids = gallery.cards.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("every card's scenarioId names a real scenario", () => {
        const scenarioIds = new Set(spec.scenarios.map((s) => s.id));
        for (const card of gallery.cards) {
          if (card.scenarioId) {
            expect(scenarioIds, `${card.id} → ${card.scenarioId}`).toContain(card.scenarioId);
          }
        }
      });
    });
  }
});
