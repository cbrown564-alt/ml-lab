"use client";

import { useMemo, useState } from "react";
import { AttentionHeatmap, ValueMixBar } from "@/components/viz/AttentionHeatmap";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  attentionScenario,
  attentionState,
  headAt,
  headParam,
  queryAt,
  queryParam,
  tokens,
} from "@content/exhibits/attention/experiment";

export function AttentionLab() {
  const [queryIndex, setQueryIndex] = useState(queryParam.default);
  const [headIndex, setHeadIndex] = useState(headParam.default);
  const state = useMemo(() => attentionState(queryIndex, headIndex), [queryIndex, headIndex]);

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{attentionScenario.prompt}</p>

          <div className="flex flex-col gap-4 rounded-lg border border-line bg-sunken p-4">
            <Slider
              id="attention-query"
              label={queryParam.label}
              value={queryIndex}
              display={queryAt(queryIndex)}
              min={queryParam.min}
              max={queryParam.max}
              step={queryParam.step}
              hint={queryParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("attention"));
                setQueryIndex(value);
              }}
            />
            <Slider
              id="attention-head"
              label={headParam.label}
              value={headIndex}
              display={headAt(headIndex)}
              min={headParam.min}
              max={headParam.max}
              step={headParam.step}
              hint={headParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("attention"));
                setHeadIndex(value);
              }}
              ticks={[
                { value: 0, label: "Syntax" },
                { value: 1, label: "Local" },
              ]}
            />
          </div>

          <StatGrid
            direction="col"
            caption={`Peak route: ${state.queryLabel} → ${state.topKeyLabel}`}
            stats={state.mix.map((row, index) => ({
              label: `#${index + 1}`,
              value: row.token.label,
              hue: "var(--viz-prediction-ink)",
              note: row.weight.toFixed(3),
            }))}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:mt-0">
          <AttentionHeatmap
            tokens={tokens}
            weights={state.weights}
            queryIndex={state.queryIndex}
            highlightKeyIndex={state.highlightKeyIndex}
            width={560}
            height={360}
            ariaLabel={`Attention lab: ${state.queryLabel} on ${state.headLabel} head.`}
          />
          <ValueMixBar tokens={tokens} weights={state.weights} queryIndex={state.queryIndex} width={560} />
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
