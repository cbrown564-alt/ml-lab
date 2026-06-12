import { describe, expect, it } from "vitest";
import { gradientDescentExperiment as spec } from "./experiment";
import {
  createGradientDescent,
  mse,
  olsFit,
} from "@/lib/models/linear-regression";

/**
 * Scenario prompts make claims about what each learning rate does. Those
 * claims are content, and content can rot — so they are pinned here to the
 * actual model behavior at the exhibit's step budget (500 steps).
 */

const STEP_BUDGET = 500;

const scenarioPoints = (scenarioId: string) => {
  const sc = spec.scenarios.find((s) => s.id === scenarioId)!;
  return spec.datasets.find((d) => d.id === sc.datasetId)!.points;
};

const scenarioLr = (scenarioId: string) =>
  spec.scenarios.find((s) => s.id === scenarioId)!.params!.learningRate;

describe("spec integrity", () => {
  it("every scenario references a real dataset and only declared params", () => {
    const datasetIds = new Set(spec.datasets.map((d) => d.id));
    const paramIds = new Set(spec.params.map((p) => p.id));
    for (const sc of spec.scenarios) {
      expect(datasetIds.has(sc.datasetId)).toBe(true);
      for (const key of Object.keys(sc.params ?? {})) {
        expect(paramIds.has(key)).toBe(true);
      }
    }
  });

  it("scenario learning rates sit inside the slider's range", () => {
    const lrDef = spec.params.find((p) => p.id === "learningRate")!;
    for (const sc of spec.scenarios) {
      const lr = sc.params?.learningRate;
      if (lr === undefined) continue;
      expect(lr).toBeGreaterThanOrEqual(lrDef.min);
      expect(lr).toBeLessThanOrEqual(lrDef.max);
    }
  });
});

describe("scenario claims hold at the exhibit's step budget", () => {
  it("'Watch it learn' gets close to the OLS loss within the budget", () => {
    const points = scenarioPoints("watch-it-learn");
    const target = mse(points, olsFit(points));
    const gd = createGradientDescent(points, {
      learningRate: scenarioLr("watch-it-learn"),
    });
    gd.run(STEP_BUDGET);
    expect(gd.current.loss).toBeLessThan(target * 1.05);
  });

  it("'Too timid' barely moves within the budget", () => {
    const points = scenarioPoints("too-timid");
    const gd = createGradientDescent(points, {
      learningRate: scenarioLr("too-timid"),
    });
    const initial = gd.current.loss;
    gd.run(STEP_BUDGET);
    // Still stuck above 80% of the starting loss: visibly "an unfinished walk".
    expect(gd.current.loss).toBeGreaterThan(initial * 0.8);
  });

  it("'Over the edge' explodes fast enough to see while playing", () => {
    const points = scenarioPoints("over-the-edge");
    const gd = createGradientDescent(points, {
      learningRate: scenarioLr("over-the-edge"),
    });
    gd.run(50);
    // The exhibit auto-pauses past 1e12; divergence must hit that within
    // 50 steps (~5s of play time) for the failure beat to land.
    expect(gd.current.loss).toBeGreaterThan(1e12);
  });
});
