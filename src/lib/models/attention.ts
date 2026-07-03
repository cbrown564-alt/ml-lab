/**
 * Scaled dot-product self-attention on a committed six-token sentence fixture.
 * Logits are hand-tuned per head; weights are softmax(logits / √d_k).
 */

import fixture from "./fixtures/attention.json";

export type AttentionToken = {
  id: string;
  label: string;
  role: string;
};

export type AttentionHead = {
  id: string;
  label: string;
  dK: number;
  logits: number[][];
  weights: number[][];
  values: number[][];
  outputs: number[][];
};

export const attentionTokens: AttentionToken[] = fixture.tokens;
export const attentionSentence = fixture.sentence;
export const attentionHeads: AttentionHead[] = fixture.heads;
export const attentionValueDim = fixture.valueDim;
export const attentionPinned = fixture.pinned;

export const headById = new Map(attentionHeads.map((head) => [head.id, head]));

export function softmaxRow(row: number[]): number[] {
  const max = Math.max(...row);
  const exp = row.map((value) => Math.exp(value - max));
  const sum = exp.reduce((total, value) => total + value, 0);
  return exp.map((value) => value / sum);
}

export function weightsFromLogits(logits: number[][], dK: number): number[][] {
  const scale = Math.sqrt(dK);
  return logits.map((row) => softmaxRow(row.map((value) => value / scale)));
}

export function attentionOutput(weights: number[][], values: number[][]): number[][] {
  return weights.map((row) =>
    values[0]!.map((_, dim) =>
      row.reduce((total, weight, index) => total + weight * values[index]![dim]!, 0),
    ),
  );
}

export function topKeys(
  weights: number[][],
  queryIndex: number,
  k = 3,
): { token: AttentionToken; weight: number; keyIndex: number }[] {
  const row = weights[queryIndex] ?? [];
  return row
    .map((weight, keyIndex) => ({ weight, keyIndex, token: attentionTokens[keyIndex]! }))
    .filter((entry) => entry.keyIndex !== queryIndex)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, k);
}

export function uniformLogits(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

export function frozenRowLogits(sourceRow: number[], size: number): number[][] {
  return Array.from({ length: size }, () => [...sourceRow]);
}

export function headState(headId: string, queryIndex: number, logitsOverride?: number[][]) {
  const head = headById.get(headId)!;
  const logits = logitsOverride ?? head.logits;
  const weights = weightsFromLogits(logits, head.dK);
  const outputs = attentionOutput(weights, head.values);
  return {
    head,
    queryIndex,
    query: attentionTokens[queryIndex]!,
    logits,
    weights,
    outputs,
    mix: topKeys(weights, queryIndex, 3),
    output: outputs[queryIndex]!,
  };
}
