"use client";

import { NextTokenLogits, PrefixStrip } from "@/components/viz/NextTokenLogits";
import { TransformerBlockFlow } from "@/components/viz/TransformerBlockFlow";
import { stages, transformerLabState, tokens } from "@content/exhibits/the-transformer/experiment";
import { predictIndex } from "@/lib/models/transformer";

export function TransformerHero() {
  const state = transformerLabState(1, 10, 5);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          the-transformer
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          next token · mat leads
        </span>
      </figcaption>
      <div className="grid gap-6 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
        <div className="flex flex-col gap-4">
          <PrefixStrip tokens={tokens} predictIndex={predictIndex} width={640} />
          <NextTokenLogits
            distribution={state.distribution}
            targetId={state.target.id}
            width={640}
            size="lg"
            ariaLabel={`Next-token distribution after prefix; mat probability ${state.targetProb.toFixed(
              2,
            )}.`}
          />
        </div>
        <div className="flex flex-col gap-4">
          <TransformerBlockFlow
            stages={stages}
            activeStageId={state.stage.id}
            blockCount={state.blockCount}
            width={720}
            ariaLabel="One transformer block: embed, self-attention, add-and-norm with residual, feed-forward, add-and-norm with residual, LM head."
          />
          <div className="max-w-[16rem] rounded-lg border border-line bg-sunken px-4 py-3">
            <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
              P(mat) · target
            </div>
            <div className="mt-1 font-mono text-xl tabular-nums text-[var(--viz-prediction-ink)]">
              {state.targetProb.toFixed(3)}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
