"use client";

import { useState } from "react";
import { EmbeddingMap } from "@/components/viz/EmbeddingMap";
import { embeddingState, tokens } from "@content/exhibits/embeddings/experiment";

const STAGES = [
  { id: "learned", label: "Learned", layoutIndex: 0 as const },
  { id: "pca", label: "PCA", layoutIndex: 1 as const },
] as const;

export function EmbeddingsCheckLab() {
  const [stageId, setStageId] = useState<(typeof STAGES)[number]["id"]>("learned");
  const stage = STAGES.find((entry) => entry.id === stageId)!;
  const state = embeddingState(0, stage.layoutIndex);

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        king&apos;s neighbours — learned vs PCA
      </figcaption>
      <div
        role="group"
        aria-label="Embedding layout"
        className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs"
      >
        {STAGES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={stageId === entry.id}
            onClick={() => setStageId(entry.id)}
            className={`rounded-full px-3 py-1 transition-colors ${
              stageId === entry.id ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <EmbeddingMap
        tokens={tokens}
        layout={state.layout}
        xDomain={state.domains.x}
        yDomain={state.domains.y}
        selectedId="king"
        neighborIds={state.neighbors.map((row) => row.token.id)}
        width={480}
        height={280}
        ariaLabel={`Check companion: king neighbours in ${state.layout} layout.`}
      />
    </figure>
  );
}
