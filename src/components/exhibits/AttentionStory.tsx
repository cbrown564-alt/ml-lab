"use client";

import { AttentionHeatmap, ValueMixBar } from "@/components/viz/AttentionHeatmap";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { AttentionFrame } from "@content/exhibits/attention/spine";
import { attentionState, tokens } from "@content/exhibits/attention/experiment";

export function AttentionStory() {
  const frame = useActiveFrame<AttentionFrame>();
  const headId = frame?.headId ?? "syntax";
  const queryIndex = frame?.queryIndex ?? 2;
  const headIndex = headId === "local" ? 1 : 0;
  const state = attentionState(queryIndex, headIndex);
  const highlightKeyIndex = frame?.highlightKeyIndex ?? state.highlightKeyIndex;

  const caption =
    headId === "local"
      ? "Local head — neighbours dominate each query row"
      : `Syntax head — ${state.queryLabel} listens most to ${state.topKeyLabel}`;

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {caption}
      </figcaption>
      <AttentionHeatmap
        tokens={tokens}
        weights={state.weights}
        queryIndex={queryIndex}
        highlightKeyIndex={highlightKeyIndex}
        width={560}
        height={340}
        ariaLabel={`Attention story frame: ${state.queryLabel} query on ${state.headLabel} head.`}
      />
      <ValueMixBar tokens={tokens} weights={state.weights} queryIndex={queryIndex} width={560} />
      <StatGrid
        caption={`Top keys for ${state.queryLabel}: ${state.mix
          .map((row) => `${row.token.label} (${row.weight.toFixed(2)})`)
          .join(" · ")}`}
        stats={[
          {
            label: "query",
            value: state.queryLabel,
            hue: "var(--viz-param-ink)",
            note: state.query.role,
          },
          {
            label: "head",
            value: state.headLabel,
            hue: "var(--viz-truth-ink)",
            note: headId,
          },
          {
            label: "peak",
            value: state.topKeyLabel,
            hue: "var(--viz-prediction-ink)",
            note: state.topWeight.toFixed(3),
          },
        ]}
      />
    </figure>
  );
}
