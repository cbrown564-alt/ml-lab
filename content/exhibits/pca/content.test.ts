import { describe, expect, it } from "vitest";
import { FailureGallerySchema } from "@/lib/failure/schema";
import { pcaCheck } from "./concept-check";
import { pcaFit, pcaRawFit, pcaReconstructionError1D } from "./experiment";
import { pcaFailures } from "./failures";
import { pcaMath } from "./math";
import { pcaNarrative } from "./narrative";
import { pcaSpine } from "./spine";

describe("pca exhibit content", () => {
  it("is anchored to the same node id across content modules", () => {
    expect(pcaNarrative.nodeId).toBe("pca");
    expect(pcaMath.nodeId).toBe("pca");
    expect(pcaFailures.nodeId).toBe("pca");
    expect(pcaCheck.nodeId).toBe("pca");
  });

  it("pins the main story claims to the committed fixture numbers", () => {
    expect(pcaFit.explainedVarianceRatio[0]).toBeCloseTo(0.984, 3);
    expect(pcaReconstructionError1D).toBeCloseTo(0.031, 3);
    expect(Math.abs(pcaRawFit.components[0].x1)).toBeGreaterThan(
      Math.abs(pcaRawFit.components[0].x2),
    );
  });

  it("keeps the see-it and run-it scaffolding present", () => {
    expect(pcaSpine.some((beat) => beat.predict != null)).toBe(true);
    expect(pcaCheck.items.some((item) => item.kind === "experiment-task")).toBe(true);
    expect(pcaCheck.items.some((item) => item.kind === "transfer" && item.open)).toBe(true);
  });

  it("has a valid failure gallery", () => {
    const result = FailureGallerySchema.safeParse(pcaFailures);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});
