"use client";

import { useState } from "react";
import { AttentionHeatmap } from "@/components/viz/AttentionHeatmap";
import { attentionState, tokens } from "@content/exhibits/attention/experiment";

const QUERIES = [
  { id: "sat", label: "sat", queryIndex: 2, headIndex: 0 },
  { id: "on", label: "on", queryIndex: 3, headIndex: 0 },
] as const;

export function AttentionCheckLab() {
  const [queryId, setQueryId] = useState<(typeof QUERIES)[number]["id"]>("sat");
  const query = QUERIES.find((entry) => entry.id === queryId)!;
  const state = attentionState(query.queryIndex, query.headIndex);

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        syntax routes — sat vs on
      </figcaption>
      <div
        role="group"
        aria-label="Query token"
        className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs"
      >
        {QUERIES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={queryId === entry.id}
            onClick={() => setQueryId(entry.id)}
            className={`rounded-full px-3 py-1 transition-colors ${
              queryId === entry.id ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <AttentionHeatmap
        tokens={tokens}
        weights={state.weights}
        queryIndex={state.queryIndex}
        highlightKeyIndex={state.highlightKeyIndex}
        width={480}
        height={280}
        ariaLabel={`Check companion: ${state.queryLabel} syntax head peaks on ${state.topKeyLabel}.`}
      />
    </figure>
  );
}
