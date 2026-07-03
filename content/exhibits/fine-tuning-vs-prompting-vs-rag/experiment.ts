import type { ParamDef } from "@/lib/experiment/spec";
import {
  adaptationScenarios,
  adaptationState,
  adaptationStrategies,
  compareStrategies,
} from "@/lib/models/adaptation";

export const scenarios = adaptationScenarios;
export const strategies = adaptationStrategies;

export const scenarioParam: ParamDef = {
  id: "scenario",
  label: "Support ticket",
  hint: "Same pretrained base — different adaptation lever. Metrics are committed teaching numbers, not live API scores.",
  min: 0,
  max: scenarios.length - 1,
  step: 1,
  default: 0,
};

export const strategyParam: ParamDef = {
  id: "strategy",
  label: "Adaptation strategy",
  hint: "Fine-tuning changes weights; prompting changes instructions; RAG changes what evidence the model can read at query time.",
  min: 0,
  max: strategies.length - 1,
  step: 1,
  default: 2,
};

export const scenarioAt = (index: number) =>
  scenarios[Math.max(0, Math.min(scenarios.length - 1, index))]!.title;

export const strategyAt = (index: number) =>
  strategies[Math.max(0, Math.min(strategies.length - 1, index))]!.label;

export const scenarioIdAt = (index: number) =>
  scenarios[Math.max(0, Math.min(scenarios.length - 1, index))]!.id;

export const strategyIdAt = (index: number) =>
  strategies[Math.max(0, Math.min(strategies.length - 1, index))]!.id;

export const adaptationScenario = {
  id: "orbitdesk-support",
  title: "Steer a pretrained support bot",
  prompt:
    "OrbitDesk ships a general language model, then adapts it for product support. Compare what each strategy changes — weights, instructions, or retrieved evidence — and read the tradeoffs on domain fit versus freshness.",
};

export const adaptationLabState = (scenarioIndex: number, strategyIndex: number) => {
  const scenarioId = scenarioIdAt(scenarioIndex);
  const strategyId = strategyIdAt(strategyIndex);
  return {
    ...adaptationState(scenarioId, strategyId),
    compare: compareStrategies(scenarioId),
  };
};

export { adaptationPinned } from "@/lib/models/adaptation";
