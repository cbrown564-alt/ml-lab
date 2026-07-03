/**
 * Conceptual adaptation tradeoffs — fine-tuning, prompting, and RAG on committed scenarios.
 */

import fixture from "./fixtures/adaptation.json";

export type AdaptationScenario = {
  id: string;
  title: string;
  userQuery: string;
  goldAnswer: string;
};

export type AdaptationStrategy = {
  id: string;
  label: string;
  lever: string;
  pipeline: string[];
};

export type AdaptationMetrics = {
  domainFit: number;
  freshness: number;
  cost: number;
  latency: number;
  citesSource: boolean;
};

export const adaptationProduct = fixture.product;
export const adaptationScenarios: AdaptationScenario[] = fixture.scenarios;
export const adaptationStrategies: AdaptationStrategy[] = fixture.strategies;
export const adaptationPinned = fixture.pinned;
export const adaptationBreakIt = fixture.breakIt;

const scenarioById = new Map(adaptationScenarios.map((scenario) => [scenario.id, scenario]));
const strategyById = new Map(adaptationStrategies.map((strategy) => [strategy.id, strategy]));

export function adaptationMetrics(
  scenarioId: string,
  strategyId: string,
  mode: "healthy" | "stale-finetune" | "bad-retrieval" = "healthy",
): AdaptationMetrics {
  if (mode === "stale-finetune" && strategyId === "fine-tuning") {
    return adaptationBreakIt.staleFineTune[scenarioId as keyof typeof adaptationBreakIt.staleFineTune];
  }
  if (mode === "bad-retrieval" && strategyId === "rag") {
    return adaptationBreakIt.badRetrieval[scenarioId as keyof typeof adaptationBreakIt.badRetrieval];
  }
  return fixture.metrics[scenarioId as keyof typeof fixture.metrics][
    strategyId as keyof (typeof fixture.metrics)["reset-procedure"]
  ];
}

export function adaptationState(
  scenarioId: string,
  strategyId: string,
  mode: "healthy" | "stale-finetune" | "bad-retrieval" = "healthy",
) {
  const scenario = scenarioById.get(scenarioId)!;
  const strategy = strategyById.get(strategyId)!;
  const metrics = adaptationMetrics(scenarioId, strategyId, mode);
  const sampleAnswer =
    metrics.domainFit >= 0.8
      ? scenario.goldAnswer
      : metrics.domainFit >= 0.5
        ? "Try the reset button on the dock — details may vary."
        : "Press and hold reset for about five seconds.";
  return {
    scenario,
    strategy,
    metrics,
    mode,
    sampleAnswer,
    onTarget: metrics.domainFit >= 0.85,
  };
}

export function compareStrategies(scenarioId: string, mode: "healthy" | "stale-finetune" | "bad-retrieval" = "healthy") {
  return adaptationStrategies.map((strategy) => ({
    strategy,
    metrics: adaptationMetrics(scenarioId, strategy.id, mode),
  }));
}
