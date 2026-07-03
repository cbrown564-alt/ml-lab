import { describe, expect, it } from "vitest";
import {
  contextTokens,
  logitsForPrediction,
  nextTokenPinned,
  probabilities,
  transformerState,
} from "./transformer";

describe("transformer model layer", () => {
  it("pins mat as the top next-token at temperature 1 with one block", () => {
    const logits = logitsForPrediction(1);
    const dist = probabilities(logits, 1);
    const top = [...dist].sort((left, right) => right.prob - left.prob)[0]!;
    expect(top.candidate.id).toBe("mat");
    expect(top.prob).toBeCloseTo(nextTokenPinned.pinnedProb, 5);
  });

  it("boosts mat further with a second block", () => {
    const one = probabilities(logitsForPrediction(1), 1).find((row) => row.candidate.id === "mat")!;
    const two = probabilities(logitsForPrediction(2), 1).find((row) => row.candidate.id === "mat")!;
    expect(two.prob).toBeGreaterThan(one.prob);
  });

  it("flattens the distribution as temperature rises", () => {
    const cold = probabilities(logitsForPrediction(1), 0.7).find((row) => row.candidate.id === "mat")!;
    const hot = probabilities(logitsForPrediction(1), 2.5).find((row) => row.candidate.id === "mat")!;
    expect(cold.prob).toBeGreaterThan(hot.prob);
  });

  it("drops mat probability when residuals are disabled", () => {
    const withResidual = probabilities(logitsForPrediction(1, { residualEnabled: true }), 1).find(
      (row) => row.candidate.id === "mat",
    )!;
    const without = probabilities(logitsForPrediction(1, { residualEnabled: false }), 1).find(
      (row) => row.candidate.id === "mat",
    )!;
    expect(withResidual.prob).toBeGreaterThan(without.prob);
  });

  it("exposes block stage state for the story and lab", () => {
    const state = transformerState(1, 1, 2);
    expect(state.stage.id).toBe("attn-residual");
    expect(state.prefixLabel.split(" ").length).toBe(contextTokens.length);
    expect(state.attentionTopLabel).toBe("on");
  });
});
