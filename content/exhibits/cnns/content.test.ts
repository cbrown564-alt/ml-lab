import { describe, expect, it } from "vitest";
import { FailureGallerySchema } from "@/lib/failure/schema";
import { cnnsCheck } from "./concept-check";
import { convParams, cnnsScenario, fcParams, verticalOnHorizontal } from "./experiment";
import { cnnsFailures } from "./failures";
import { cnnsMath } from "./math";
import { cnnsNarrative } from "./narrative";
import { cnnsSpine } from "./spine";

describe("cnns exhibit content", () => {
  it("is anchored to the same node id across content modules", () => {
    expect(cnnsNarrative.nodeId).toBe("cnns");
    expect(cnnsMath.nodeId).toBe("cnns");
    expect(cnnsFailures.nodeId).toBe("cnns");
    expect(cnnsCheck.nodeId).toBe("cnns");
  });

  it("pins the parameter-count and activation claims to the fixture", () => {
    expect(fcParams).toBe(2340);
    expect(convParams).toBe(10);
    expect(verticalOnHorizontal).toBeCloseTo(25.2, 1);
  });

  it("keeps the see-it and run-it scaffolding present", () => {
    expect(cnnsScenario.prompt).toMatch(/3×3 filter/i);
    expect(cnnsSpine.some((beat) => beat.predict != null)).toBe(true);
    expect(cnnsCheck.items.some((item) => item.kind === "experiment-task")).toBe(true);
    expect(cnnsCheck.items.some((item) => item.kind === "transfer" && item.open)).toBe(true);
  });

  it("has a valid failure gallery", () => {
    const result = FailureGallerySchema.safeParse(cnnsFailures);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});
