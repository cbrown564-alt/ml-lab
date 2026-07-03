"use client";

import { NextTokenLogits, PrefixStrip } from "@/components/viz/NextTokenLogits";
import { TransformerBlockFlow } from "@/components/viz/TransformerBlockFlow";
import { transformerLabState, tokens } from "@content/exhibits/the-transformer/experiment";
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
      <div className="flex flex-col gap-4 px-5 py-4">
        <PrefixStrip tokens={tokens} predictIndex={predictIndex} width={520} />
        <NextTokenLogits
          distribution={state.distribution}
          targetId={state.target.id}
          width={520}
          ariaLabel={`Next-token distribution after prefix; mat probability ${state.targetProb.toFixed(
            2,
          )}.`}
        />
      </div>
    </figure>
  );
}
