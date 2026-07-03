"use client";

import { AttentionHeatmap } from "@/components/viz/AttentionHeatmap";
import { attentionState, tokens } from "@content/exhibits/attention/experiment";

export function AttentionHero() {
  const state = attentionState(2, 0);

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
      <div className="px-3 py-3">
        <AttentionHeatmap
          tokens={tokens}
          weights={state.weights}
          queryIndex={state.queryIndex}
          highlightKeyIndex={state.highlightKeyIndex}
          width={520}
          height={300}
          ariaLabel={`Attention heatmap: query sat on syntax head with strongest weight on cat (${state.topWeight.toFixed(
            2,
          )}).`}
        />
      </div>
    </figure>
  );
}
