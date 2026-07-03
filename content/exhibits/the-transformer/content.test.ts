import { describe, expect, it } from "vitest";
import { FailureGallerySchema } from "@/lib/failure/schema";
import { nextTokenPinned } from "@/lib/models/transformer";
import { transformerCheck } from "./concept-check";
import { transformerLabState } from "./experiment";
import { transformerFailures } from "./failures";
import { transformerMath } from "./math";
import { transformerNarrative } from "./narrative";
import { transformerSpine } from "./spine";

describe("the-transformer exhibit content", () => {
  it("is anchored to the same node id across content modules", () => {
    expect(transformerNarrative.nodeId).toBe("the-transformer");
    expect(transformerMath.nodeId).toBe("the-transformer");
    expect(transformerFailures.nodeId).toBe("the-transformer");
    expect(transformerCheck.nodeId).toBe("the-transformer");
  });

  it("pins mat as the next-token peak on the fixture", () => {
    const state = transformerLabState(1, 10, 5);
    expect(state.top.candidate.id).toBe("mat");
    expect(state.targetProb).toBeCloseTo(nextTokenPinned.pinnedProb, 5);
  });

  it("keeps the see-it and run-it scaffolding present", () => {
    expect(transformerSpine.some((beat) => beat.predict != null)).toBe(true);
    expect(transformerCheck.items.some((item) => item.kind === "experiment-task")).toBe(true);
    expect(transformerCheck.items.some((item) => item.kind === "transfer" && item.open)).toBe(true);
  });

  it("has a valid failure gallery", () => {
    const result = FailureGallerySchema.safeParse(transformerFailures);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});
