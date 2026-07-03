"use client";

import { AttentionHeatmap, ValueMixBar } from "@/components/viz/AttentionHeatmap";
import { attentionState, tokens } from "@content/exhibits/attention/experiment";

export function AttentionHero() {
  const state = attentionState(2, 0);
  const peakToken = tokens[state.highlightKeyIndex ?? 0];
  const queryToken = tokens[state.queryIndex];

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          attention
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          sat → cat on the syntax head
        </span>
      </figcaption>
      <div className="grid gap-5 px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
        <AttentionHeatmap
          tokens={tokens}
          weights={state.weights}
          queryIndex={state.queryIndex}
          highlightKeyIndex={state.highlightKeyIndex}
          width={560}
          height={330}
          ariaLabel={`Attention heatmap: query sat on syntax head with strongest weight on cat (${state.topWeight.toFixed(
            2,
          )}).`}
        />
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-line bg-sunken px-4 py-3">
            <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
              Peak route
            </div>
            <div className="mt-1 font-mono text-xl tabular-nums text-[var(--viz-prediction-ink)]">
              {queryToken?.label} → {peakToken?.label} {state.topWeight.toFixed(2)}
            </div>
          </div>
          <ValueMixBar
            tokens={tokens}
            weights={state.weights}
            queryIndex={state.queryIndex}
            width={520}
          />
        </div>
      </div>
    </figure>
  );
}
