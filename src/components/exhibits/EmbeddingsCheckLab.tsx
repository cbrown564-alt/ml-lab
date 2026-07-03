"use client";

import { useState } from "react";
import { EmbeddingMap } from "@/components/viz/EmbeddingMap";
import { analogyFixture, embeddingState, tokens } from "@content/exhibits/embeddings/experiment";

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
        king − man + woman — learned vs PCA
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
      <div className="mb-4 grid grid-cols-2 gap-2">
        {STAGES.map((entry) => {
          const miss =
            entry.id === "learned"
              ? analogyFixture.distanceToQueen
              : analogyFixture.pcaDistanceToQueen;
          const active = entry.id === stageId;
          return (
            <div
              key={entry.id}
              className={`rounded-lg border px-3 py-2 ${active ? "border-[color-mix(in_srgb,var(--accent)_40%,var(--line))] bg-sunken" : "border-line"}`}
            >
              <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
                {entry.label} · miss
              </div>
              <div
                className={`mt-0.5 font-mono text-lg tabular-nums ${
                  active
                    ? entry.id === "pca"
                      ? "text-[var(--viz-error-ink)]"
                      : "text-[var(--viz-prediction-ink)]"
                    : "text-ink-muted"
                }`}
              >
                {miss.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
      <EmbeddingMap
        tokens={tokens}
        layout={state.layout}
        xDomain={state.domains.x}
        yDomain={state.domains.y}
        selectedId="queen"
        analogy={{ a: "king", b: "man", c: "woman", target: "queen", showResult: true }}
        width={560}
        height={330}
        ariaLabel={`Check companion: king minus man plus woman in ${state.layout} coordinates.`}
      />
    </figure>
  );
}
