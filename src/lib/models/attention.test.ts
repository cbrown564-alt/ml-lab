import { describe, expect, it } from "vitest";
import {
  attentionHeads,
  attentionPinned,
  attentionTokens,
  headById,
  headState,
  topKeys,
  weightsFromLogits,
} from "./attention";

describe("attention model layer", () => {
  it("matches committed softmax weights for the syntax head", () => {
    const head = headById.get("syntax")!;
    const recomputed = weightsFromLogits(head.logits, head.dK);
    recomputed.forEach((row, rowIndex) => {
      row.forEach((weight, colIndex) => {
        expect(weight).toBeCloseTo(head.weights[rowIndex]![colIndex]!, 5);
      });
    });
  });

  it("pins sat attending to cat on the syntax head", () => {
    const head = headById.get("syntax")!;
    const satIndex = attentionTokens.findIndex((token) => token.id === "sat");
    const catIndex = attentionTokens.findIndex((token) => token.id === "cat");
    const top = topKeys(head.weights, satIndex, 1)[0]!;
    expect(top.token.id).toBe("cat");
    expect(top.weight).toBeCloseTo(attentionPinned.satToCat.weight, 5);
    expect(catIndex).toBe(attentionPinned.satToCat.keyIndex);
  });

  it("pins on attending to mat on the syntax head", () => {
    const head = headById.get("syntax")!;
    const onIndex = attentionTokens.findIndex((token) => token.id === "on");
    const top = topKeys(head.weights, onIndex, 1)[0]!;
    expect(top.token.id).toBe("mat");
    expect(top.weight).toBeCloseTo(attentionPinned.onToMat.weight, 5);
  });

  it("local head peaks near the diagonal", () => {
    const head = headById.get("local")!;
    head.weights.forEach((row, index) => {
      const peak = row.indexOf(Math.max(...row));
      expect(Math.abs(peak - index)).toBeLessThanOrEqual(1);
    });
  });

  it("recomputes headState from logits overrides", () => {
    const state = headState("syntax", 2);
    expect(state.mix[0]?.token.id).toBe("cat");
    expect(state.weights.length).toBe(attentionTokens.length);
    expect(attentionHeads.length).toBe(2);
  });
});
