import { describe, expect, it } from "vitest";
import { FailureGallerySchema } from "@/lib/failure/schema";
import { kMeansCheck } from "./concept-check";
import {
  badInitK2,
  goodK,
  iterations,
  kMeansScenario,
  tooManyK,
  wrongK,
} from "./experiment";
import { kMeansFailures } from "./failures";
import { kMeansMath } from "./math";
import { kMeansNarrative } from "./narrative";
import { kMeansSpine } from "./spine";

describe("k-means exhibit content", () => {
  it("is anchored to the same node id across content modules", () => {
    expect(kMeansNarrative.nodeId).toBe("k-means");
    expect(kMeansMath.nodeId).toBe("k-means");
    expect(kMeansFailures.nodeId).toBe("k-means");
    expect(kMeansCheck.nodeId).toBe("k-means");
  });

  it("pins the main story claims to the committed fixture numbers", () => {
    expect(goodK.inertia).toBeCloseTo(65.4931931, 6);
    expect(wrongK.inertia).toBeGreaterThan(goodK.inertia);
    expect(tooManyK.inertia).toBeLessThan(goodK.inertia);
    expect(badInitK2.inertia).toBeCloseTo(wrongK.inertia, 6);
  });

  it("commits that the Lloyd loop settles in one visible update on this dataset", () => {
    expect(iterations).toHaveLength(2);
    expect(iterations[1].inertia).toBeCloseTo(goodK.inertia, 6);
  });

  it("keeps the see-it and run-it scaffolding present", () => {
    expect(kMeansScenario.prompt).toMatch(/k = 3/i);
    expect(kMeansSpine.some((beat) => beat.predict != null)).toBe(true);
    expect(
      kMeansCheck.items.some((item) => item.kind === "experiment-task"),
    ).toBe(true);
    expect(kMeansCheck.items.some((item) => item.kind === "transfer" && item.open)).toBe(true);
  });

  it("has a valid failure gallery", () => {
    const result = FailureGallerySchema.safeParse(kMeansFailures);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });
});
