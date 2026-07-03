import { describe, expect, it } from "vitest";
import { FailureGallerySchema } from "@/lib/failure/schema";
import { attentionPinned } from "@/lib/models/attention";
import { attentionCheck } from "./concept-check";
import { attentionState } from "./experiment";
import { attentionFailures } from "./failures";
import { attentionMath } from "./math";
import { attentionNarrative } from "./narrative";
import { attentionSpine } from "./spine";

describe("attention exhibit content", () => {
  it("is anchored to the same node id across content modules", () => {
    expect(attentionNarrative.nodeId).toBe("attention");
    expect(attentionMath.nodeId).toBe("attention");
    expect(attentionFailures.nodeId).toBe("attention");
    expect(attentionCheck.nodeId).toBe("attention");
  });

  it("pins syntax routing claims to the fixture", () => {
    const sat = attentionState(
      attentionPinned.satToCat.queryIndex,
      0,
    );
    expect(sat.topKeyLabel).toBe("cat");
    expect(sat.topWeight).toBeCloseTo(attentionPinned.satToCat.weight, 5);

    const on = attentionState(attentionPinned.onToMat.queryIndex, 0);
    expect(on.topKeyLabel).toBe("mat");
    expect(on.topWeight).toBeCloseTo(attentionPinned.onToMat.weight, 5);
  });

  it("keeps the see-it and run-it scaffolding present", () => {
    expect(attentionSpine.some((beat) => beat.predict != null)).toBe(true);
    expect(attentionCheck.items.some((item) => item.kind === "experiment-task")).toBe(true);
    expect(attentionCheck.items.some((item) => item.kind === "transfer" && item.open)).toBe(true);
  });

  it("has a valid failure gallery", () => {
    const result = FailureGallerySchema.safeParse(attentionFailures);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});
