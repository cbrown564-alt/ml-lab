import { describe, expect, it } from "vitest";
import { FailureGallerySchema } from "@/lib/failure/schema";
import { analogyFixture, queenCosineFromKing } from "@/lib/models/embeddings";
import { embeddingsCheck } from "./concept-check";
import { embeddingState, tokens } from "./experiment";
import { embeddingsFailures } from "./failures";
import { embeddingsMath } from "./math";
import { embeddingsNarrative } from "./narrative";
import { embeddingsSpine } from "./spine";

describe("embeddings exhibit content", () => {
  it("is anchored to the same node id across content modules", () => {
    expect(embeddingsNarrative.nodeId).toBe("embeddings");
    expect(embeddingsMath.nodeId).toBe("embeddings");
    expect(embeddingsFailures.nodeId).toBe("embeddings");
    expect(embeddingsCheck.nodeId).toBe("embeddings");
  });

  it("pins analogy and neighbour claims to the fixture", () => {
    expect(analogyFixture.distanceToQueen).toBeLessThan(0.05);
    const state = embeddingState(0, 0);
    expect(state.neighbors.map((row) => row.token.id)).toEqual(["queen", "prince", "woman"]);
    expect(state.queenCosine).toBeCloseTo(queenCosineFromKing, 6);
  });

  it("keeps the see-it and run-it scaffolding present", () => {
    expect(tokens.length).toBeGreaterThanOrEqual(10);
    expect(embeddingsSpine.some((beat) => beat.predict != null)).toBe(true);
    expect(embeddingsCheck.items.some((item) => item.kind === "experiment-task")).toBe(true);
    expect(embeddingsCheck.items.some((item) => item.kind === "transfer" && item.open)).toBe(true);
  });

  it("has a valid failure gallery", () => {
    const result = FailureGallerySchema.safeParse(embeddingsFailures);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});
