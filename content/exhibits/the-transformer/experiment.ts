import type { ParamDef } from "@/lib/experiment/spec";
import {
  blockStages,
  contextTokens,
  nextTokenPinned,
  transformerPrefix,
  transformerState,
} from "@/lib/models/transformer";

export const tokens = contextTokens;
export const stages = blockStages;

export const blockParam: ParamDef = {
  id: "blocks",
  label: "Stack depth",
  hint: "Real models stack dozens of identical blocks. Here, a second block nudges the LM head toward mat without changing the story.",
  min: 1,
  max: 2,
  step: 1,
  default: 1,
};

export const temperatureParam: ParamDef = {
  id: "temperature",
  label: "Softmax temperature",
  hint: "Training uses temperature 1. At decode time, higher temperature flattens the next-token distribution.",
  min: 0.7,
  max: 2.5,
  step: 0.1,
  default: 1,
};

export const stageParam: ParamDef = {
  id: "stage",
  label: "Block stage",
  hint: "Step through one transformer block: attention mix, residual add, feed-forward, then the language-model head.",
  min: 0,
  max: stages.length - 1,
  step: 1,
  default: stages.length - 1,
};

export const blockAt = (index: number) => `${Math.round(index)} block${index > 1 ? "s" : ""}`;
export const temperatureAt = (value: number) => value.toFixed(1);
export const stageAt = (index: number) => stages[Math.max(0, Math.min(stages.length - 1, index))]!.label;

export const transformerScenario = {
  id: "next-token",
  title: "Predict the next token",
  prompt: `Given the prefix "${transformerPrefix} ___", the model runs stacked transformer blocks, then softmaxes logits into a next-token distribution. On the fixture, mat is the committed peak at temperature 1 with one block (p ≈ ${nextTokenPinned.pinnedProb.toFixed(
    2,
  )}).`,
};

export const transformerLabState = (
  blockCountIndex: number,
  temperatureTimesTen: number,
  stageIndex: number,
) => {
  const blockCount = Math.round(blockCountIndex);
  const temperature = temperatureTimesTen / 10;
  return transformerState(blockCount, temperature, stageIndex);
};

export { nextTokenPinned, transformerPrefix };
