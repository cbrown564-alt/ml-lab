"use client";

import {
  AdaptationCompare,
  AdaptationMetricsPanel,
  AdaptationPipeline,
} from "@/components/viz/AdaptationPanel";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { AdaptationFrame } from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/spine";
import {
  adaptationLabState,
} from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/experiment";
import { adaptationStrategies } from "@/lib/models/adaptation";

export function AdaptationStory() {
  const frame = useActiveFrame<AdaptationFrame>();
  const scenarioIndex = frame?.scenarioIndex ?? 0;
  const strategyId = frame?.strategyId ?? "rag";
  const strategyIndex = Math.max(
    0,
    adaptationStrategies.findIndex((strategy) => strategy.id === strategyId),
  );
  const state = adaptationLabState(scenarioIndex, strategyIndex);

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <blockquote className="border-l-2 border-[var(--viz-param)] pl-4 text-sm leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">User:</span> {state.scenario.userQuery}
      </blockquote>
      {frame?.showCompare ? (
        <AdaptationCompare
          rows={state.compare}
          width={560}
          ariaLabel="Three-way adaptation comparison on the committed ticket."
        />
      ) : (
        <>
          <AdaptationPipeline
            strategy={state.strategy}
            width={560}
            ariaLabel={`${state.strategy.label} pipeline for OrbitDesk support.`}
          />
          <AdaptationMetricsPanel
            metrics={state.metrics}
            sampleAnswer={state.sampleAnswer}
            onTarget={state.onTarget}
            width={560}
            ariaLabel={`${state.strategy.label} metrics and sample answer.`}
          />
        </>
      )}
      <StatGrid
        caption={`Strategy: ${state.strategy.label}`}
        stats={[
          {
            label: "domain",
            value: state.metrics.domainFit.toFixed(2),
            hue: "var(--viz-prediction-ink)",
            note: "fit",
          },
          {
            label: "fresh",
            value: state.metrics.freshness.toFixed(2),
            hue: "var(--viz-truth-ink)",
            note: "docs",
          },
          {
            label: "cite",
            value: state.metrics.citesSource ? "yes" : "no",
            hue: "var(--viz-param-ink)",
            note: "audit",
          },
        ]}
      />
    </figure>
  );
}
