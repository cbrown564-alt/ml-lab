"use client";

import { NextTokenLogits, PrefixStrip } from "@/components/viz/NextTokenLogits";
import { StatGrid } from "@/components/viz/StatGrid";
import { TransformerBlockFlow } from "@/components/viz/TransformerBlockFlow";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { TransformerFrame } from "@content/exhibits/the-transformer/spine";
import {
  stages,
  tokens,
  transformerLabState,
} from "@content/exhibits/the-transformer/experiment";
import { attentionRowFixture } from "@/lib/models/transformer";

export function TransformerStory() {
  const frame = useActiveFrame<TransformerFrame>();
  const blockCount = frame?.blockCount ?? 1;
  const temperature = frame?.temperature ?? 1;
  const stageId = frame?.stageId ?? "head";
  const stageIndex = Math.max(0, stages.findIndex((stage) => stage.id === stageId));
  const state = transformerLabState(blockCount, Math.round(temperature * 10), stageIndex);

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <PrefixStrip tokens={tokens} predictIndex={4} width={560} />
      <TransformerBlockFlow
        stages={stages}
        activeStageId={state.stage.id}
        blockCount={state.blockCount}
        width={560}
        ariaLabel={`Transformer block flow highlighting ${state.stage.label}.`}
      />
      {frame?.showAttention ? (
        <ContextAttentionRow
          weights={attentionRowFixture.weights}
          highlightIndex={attentionRowFixture.topKeyIndex}
          queryLabel={tokens[attentionRowFixture.queryIndex]?.label ?? "the"}
        />
      ) : (
        <NextTokenLogits
          distribution={state.distribution}
          targetId={state.target.id}
          width={560}
          ariaLabel={`Next-token logits at temperature ${temperature.toFixed(1)}.`}
        />
      )}
      <StatGrid
        caption={
          frame?.showAttention
            ? `Attention peak: ${state.attentionTopLabel} (${state.attentionWeights[attentionRowFixture.topKeyIndex]?.toFixed(2)})`
            : `Top next token: ${state.top.candidate.label} (${state.top.prob.toFixed(3)})`
        }
        stats={[
          {
            label: "blocks",
            value: String(state.blockCount),
            hue: "var(--viz-param-ink)",
            note: "stack depth",
          },
          {
            label: "stage",
            value: state.stage.label,
            hue: "var(--viz-truth-ink)",
            note: state.stage.id,
          },
          {
            label: "P(mat)",
            value: state.targetProb.toFixed(3),
            hue: "var(--viz-prediction-ink)",
            note: "committed",
          },
        ]}
      />
    </figure>
  );
}

function ContextAttentionRow({
  weights,
  highlightIndex,
  queryLabel,
}: {
  weights: number[];
  highlightIndex: number;
  queryLabel: string;
}) {
  return (
    <figure className="rounded-lg border border-line bg-sunken p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Query {queryLabel} → keys
      </figcaption>
      <div className="flex flex-col gap-2">
        {tokens.map((token, index) => (
          <div key={token.id} className="grid grid-cols-[4rem_1fr_3rem] items-center gap-2">
            <span
              className={`font-mono text-xs ${
                index === highlightIndex ? "font-semibold text-[var(--viz-prediction-ink)]" : "text-ink-muted"
              }`}
            >
              {token.label}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-raised">
              <div
                className="h-full rounded-full bg-[var(--viz-param)]"
                style={{ width: `${Math.max(4, (weights[index] ?? 0) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-ink-muted">
              {(weights[index] ?? 0).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}
