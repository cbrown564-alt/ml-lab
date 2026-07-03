"use client";

import { useEffect, useState } from "react";
import { EmbeddingMap } from "@/components/viz/EmbeddingMap";
import { embeddingState, tokens } from "@content/exhibits/embeddings/experiment";
import { learnedDomain } from "@/lib/models/embeddings";

export function EmbeddingsHero() {
  const [reveal, setReveal] = useState(0);
  const state = embeddingState(0, 0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 260);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          embeddings
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          tokens as points — similar words close
        </span>
      </figcaption>
      <div className="px-3 py-3" style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
        <EmbeddingMap
          tokens={tokens}
          layout="learned"
          xDomain={learnedDomain}
          yDomain={learnedDomain}
          selectedId="king"
          neighborIds={state.neighbors.map((row) => row.token.id)}
          width={520}
          height={320}
          ariaLabel="Learned word embeddings with king highlighted and its nearest neighbours queen, prince, and woman."
        />
      </div>
    </figure>
  );
}
