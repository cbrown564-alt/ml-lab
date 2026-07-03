/**
 * Hand-rolled transformer block + next-token head on a committed five-token prefix.
 */

import fixture from "./fixtures/transformer.json";

export type ContextToken = {
  id: string;
  label: string;
};

export type NextTokenCandidate = {
  id: string;
  label: string;
};

export type BlockStage = {
  id: string;
  label: string;
  norm?: number;
  deltaNorm?: number;
};

export const transformerPrefix = fixture.prefix;
export const contextTokens: ContextToken[] = fixture.context;
export const predictIndex = fixture.predictIndex;
export const nextTokenCandidates: NextTokenCandidate[] = fixture.candidates;
export const nextTokenPinned = fixture.nextToken;
export const blockStages: BlockStage[] = fixture.block.stages;
export const blockResidualShare = fixture.block.residualShare;
export const attentionRowFixture = fixture.attentionRow;

const candidateById = new Map(nextTokenCandidates.map((candidate) => [candidate.id, candidate]));

export function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exp = logits.map((value) => Math.exp(value - max));
  const sum = exp.reduce((total, value) => total + value, 0);
  return exp.map((value) => value / sum);
}

export function logitsForPrediction(
  blockCount: number,
  options: { residualEnabled?: boolean } = {},
): number[] {
  const { residualEnabled = true } = options;
  const base = residualEnabled
    ? nextTokenPinned.baseLogits
    : nextTokenPinned.noResidualLogits;
  const boost = nextTokenPinned.blockBoost;
  return base.map((logit, index) => logit + Math.max(0, blockCount - 1) * boost[index]!);
}

export function probabilities(logits: number[], temperature = 1): { candidate: NextTokenCandidate; prob: number }[] {
  const scaled = logits.map((value) => value / temperature);
  const probs = softmax(scaled);
  return nextTokenCandidates.map((candidate, index) => ({
    candidate,
    prob: probs[index]!,
  }));
}

export function transformerState(
  blockCount: number,
  temperature: number,
  stageIndex: number,
  options: { residualEnabled?: boolean } = {},
) {
  const logits = logitsForPrediction(blockCount, options);
  const distribution = probabilities(logits, temperature);
  const top = [...distribution].sort((left, right) => right.prob - left.prob)[0]!;
  const target = candidateById.get(nextTokenPinned.targetId)!;
  const targetEntry = distribution.find((entry) => entry.candidate.id === target.id)!;
  return {
    blockCount,
    temperature,
    stageIndex,
    stage: blockStages[Math.max(0, Math.min(blockStages.length - 1, stageIndex))]!,
    logits,
    distribution,
    top,
    target,
    targetProb: targetEntry.prob,
    prefixLabel: contextTokens.map((token) => token.label).join(" "),
    attentionWeights: attentionRowFixture.weights,
    attentionTopIndex: attentionRowFixture.topKeyIndex,
    attentionTopLabel: contextTokens[attentionRowFixture.topKeyIndex]?.label ?? "—",
    residualEnabled: options.residualEnabled ?? true,
  };
}
