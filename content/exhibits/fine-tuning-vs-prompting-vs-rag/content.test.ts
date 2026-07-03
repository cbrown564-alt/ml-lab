import { describe, expect, it } from "vitest";
import { FailureGallerySchema } from "@/lib/failure/schema";
import { adaptationCheck } from "./concept-check";
import { adaptationLabState, adaptationPinned } from "./experiment";
import { adaptationFailures } from "./failures";
import { adaptationMath } from "./math";
import { adaptationNarrative } from "./narrative";
import { adaptationSpine } from "./spine";

describe("fine-tuning-vs-prompting-vs-rag exhibit content", () => {
  it("is anchored to the same node id across content modules", () => {
    expect(adaptationNarrative.nodeId).toBe("fine-tuning-vs-prompting-vs-rag");
    expect(adaptationMath.nodeId).toBe("fine-tuning-vs-prompting-vs-rag");
    expect(adaptationFailures.nodeId).toBe("fine-tuning-vs-prompting-vs-rag");
    expect(adaptationCheck.nodeId).toBe("fine-tuning-vs-prompting-vs-rag");
  });

  it("pins RAG domain fit on the reset scenario", () => {
    const state = adaptationLabState(0, 2);
    expect(state.strategy.id).toBe("rag");
    expect(state.metrics.domainFit).toBeCloseTo(adaptationPinned.resetProcedureRagDomain, 5);
  });

  it("keeps the see-it and run-it scaffolding present", () => {
    expect(adaptationSpine.some((beat) => beat.predict != null)).toBe(true);
    expect(adaptationCheck.items.some((item) => item.kind === "experiment-task")).toBe(true);
    expect(adaptationCheck.items.some((item) => item.kind === "transfer" && item.open)).toBe(true);
  });

  it("has a valid failure gallery", () => {
    const result = FailureGallerySchema.safeParse(adaptationFailures);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});
