"use client";

import { AdaptationCompare } from "@/components/viz/AdaptationPanel";
import { adaptationLabState } from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/experiment";

export function AdaptationHero() {
  const state = adaptationLabState(0, 2);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          steer the model
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          fine-tune · prompt · RAG
        </span>
      </figcaption>
      <div className="px-5 py-4">
        <AdaptationCompare
          rows={state.compare}
          width={520}
          ariaLabel="Comparison of fine-tuning, prompting, and RAG on the reset support ticket."
        />
      </div>
    </figure>
  );
}
