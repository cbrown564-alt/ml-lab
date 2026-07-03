"use client";

import { useMemo, useState } from "react";
import { StatGrid } from "@/components/viz/StatGrid";
import { EmbeddingMap } from "@/components/viz/EmbeddingMap";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  anchorAt,
  anchorParam,
  embeddingState,
  embeddingsScenario,
  layoutAt,
  layoutParam,
  tokens,
} from "@content/exhibits/embeddings/experiment";

export function EmbeddingsLab() {
  const [anchorIndex, setAnchorIndex] = useState(anchorParam.default);
  const [layoutIndex, setLayoutIndex] = useState(layoutParam.default);
  const state = useMemo(
    () => embeddingState(anchorIndex, layoutIndex),
    [anchorIndex, layoutIndex],
  );

  const note =
    state.layout === "pca"
      ? "PCA scatter — clusters may appear, but analogy directions need not survive."
      : `Top neighbours: ${state.neighbors.map((row) => row.token.label).join(", ")}`;

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{embeddingsScenario.prompt}</p>

          <div className="flex flex-col gap-4 rounded-lg border border-line bg-sunken p-4">
            <Slider
              id="embeddings-anchor"
              label={anchorParam.label}
              value={anchorIndex}
              display={anchorAt(anchorIndex)}
              min={anchorParam.min}
              max={anchorParam.max}
              step={anchorParam.step}
              hint={anchorParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("embeddings"));
                setAnchorIndex(value);
              }}
            />
            <Slider
              id="embeddings-layout"
              label={layoutParam.label}
              value={layoutIndex}
              display={layoutAt(layoutIndex)}
              min={layoutParam.min}
              max={layoutParam.max}
              step={layoutParam.step}
              hint={layoutParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("embeddings"));
                setLayoutIndex(value);
              }}
              ticks={[
                { value: 0, label: "Learned" },
                { value: 1, label: "PCA" },
              ]}
            />
          </div>

          <StatGrid
            direction="col"
            caption={note}
            stats={state.neighbors.map((row, index) => ({
              label: `#${index + 1}`,
              value: row.token.label,
              hue: "var(--viz-prediction-ink)",
              note: `cos ${row.cosine.toFixed(3)}`,
            }))}
          />
        </div>

        <div className="mt-6 lg:mt-0">
          <EmbeddingMap
            tokens={tokens}
            layout={state.layout}
            xDomain={state.domains.x}
            yDomain={state.domains.y}
            selectedId={state.anchorId}
            neighborIds={state.neighbors.map((row) => row.token.id)}
            width={560}
            height={400}
            ariaLabel={`Embedding lab: ${state.anchorLabel} in ${state.layout} layout with three nearest neighbours.`}
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
