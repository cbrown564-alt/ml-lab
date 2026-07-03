"use client";

import { useMemo, useState } from "react";
import {
  AdaptationCompare,
  AdaptationMetricsPanel,
  AdaptationPipeline,
} from "@/components/viz/AdaptationPanel";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  adaptationLabState,
  adaptationScenario,
  scenarioAt,
  scenarioParam,
  strategyAt,
  strategyParam,
} from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/experiment";

export function AdaptationLab() {
  const [scenarioIndex, setScenarioIndex] = useState(scenarioParam.default);
  const [strategyIndex, setStrategyIndex] = useState(strategyParam.default);
  const state = useMemo(
    () => adaptationLabState(scenarioIndex, strategyIndex),
    [scenarioIndex, strategyIndex],
  );

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{adaptationScenario.prompt}</p>
          <blockquote className="rounded-lg border border-line bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-muted">
            {state.scenario.userQuery}
          </blockquote>

          <div className="flex flex-col gap-4 rounded-lg border border-line bg-sunken p-4">
            <Slider
              id="adaptation-scenario"
              label={scenarioParam.label}
              value={scenarioIndex}
              display={scenarioAt(scenarioIndex)}
              min={scenarioParam.min}
              max={scenarioParam.max}
              step={scenarioParam.step}
              hint={scenarioParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() =>
                  useLearner.getState().recordPractice("fine-tuning-vs-prompting-vs-rag"),
                );
                setScenarioIndex(value);
              }}
            />
            <Slider
              id="adaptation-strategy"
              label={strategyParam.label}
              value={strategyIndex}
              display={strategyAt(strategyIndex)}
              min={strategyParam.min}
              max={strategyParam.max}
              step={strategyParam.step}
              hint={strategyParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() =>
                  useLearner.getState().recordPractice("fine-tuning-vs-prompting-vs-rag"),
                );
                setStrategyIndex(value);
              }}
              ticks={[
                { value: 0, label: "Fine-tune" },
                { value: 1, label: "Prompt" },
                { value: 2, label: "RAG" },
              ]}
            />
          </div>

          <StatGrid
            direction="col"
            caption={`Gold answer: ${state.scenario.goldAnswer}`}
            stats={[
              {
                label: "on-target",
                value: state.onTarget ? "yes" : "no",
                hue: state.onTarget ? "var(--viz-prediction-ink)" : "var(--viz-error-ink)",
                note: state.strategy.label,
              },
            ]}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:mt-0">
          <AdaptationPipeline
            strategy={state.strategy}
            width={560}
            ariaLabel={`${state.strategy.label} pipeline.`}
          />
          <AdaptationMetricsPanel
            metrics={state.metrics}
            sampleAnswer={state.sampleAnswer}
            onTarget={state.onTarget}
            width={560}
            ariaLabel="Adaptation metrics for the selected strategy."
          />
          <AdaptationCompare
            rows={state.compare}
            width={560}
            ariaLabel="Side-by-side comparison on the selected ticket."
          />
        </div>
      </div>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  hint,
  ticks,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  hint: string;
  ticks?: { value: number; label: string }[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
      {ticks && (
        <div className="flex justify-between font-mono text-[10px] text-ink-faint">
          {ticks.map((tick) => (
            <span key={tick.value}>{tick.label}</span>
          ))}
        </div>
      )}
      <p className="text-xs leading-relaxed text-ink-faint">{hint}</p>
    </div>
  );
}
