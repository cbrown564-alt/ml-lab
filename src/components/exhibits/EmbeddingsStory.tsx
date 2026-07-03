"use client";

import { StatGrid } from "@/components/viz/StatGrid";
import { EmbeddingMap } from "@/components/viz/EmbeddingMap";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { EmbeddingsFrame } from "@content/exhibits/embeddings/spine";
import { embeddingState, tokens } from "@content/exhibits/embeddings/experiment";
import { tokenById } from "@/lib/models/embeddings";

export function EmbeddingsStory() {
  const frame = useActiveFrame<EmbeddingsFrame>();
  const anchorId = frame?.anchorId ?? "king";
  const layout = frame?.layout ?? "learned";
  const anchorIndex = tokens.findIndex((token) => token.id === anchorId);
  const state = embeddingState(Math.max(0, anchorIndex), layout === "pca" ? 1 : 0);

  const caption =
    frame?.showAnalogy
      ? "Vector analogy — king − man + woman ≈ queen"
      : layout === "pca"
        ? "PCA on co-occurrence — variance, not task geometry"
        : `Nearest neighbours of ${state.anchorLabel}`;

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {caption}
      </figcaption>
      <EmbeddingMap
        tokens={tokens}
        layout={layout}
        xDomain={state.domains.x}
        yDomain={state.domains.y}
        selectedId={anchorId}
        neighborIds={frame?.showNeighbors ? state.neighbors.map((row) => row.token.id) : []}
        analogy={
          frame?.showAnalogy
            ? { a: "king", b: "man", c: "woman", target: "queen", showResult: true }
            : undefined
        }
        width={560}
        height={360}
        ariaLabel={
          frame?.showAnalogy
            ? "Embedding analogy king minus man plus woman lands near queen."
            : `Embedding map for ${state.anchorLabel} in ${layout} coordinates.`
        }
      />
      <StatGrid
        caption={
          frame?.showAnalogy
            ? `Distance to queen: ${state.analogy.distanceToQueen.toFixed(2)}`
            : state.neighbors
                .map((row) => `${row.token.label} (${row.cosine.toFixed(2)})`)
                .join(" · ")
        }
        stats={[
          {
            label: "anchor",
            value: state.anchorLabel,
            hue: "var(--viz-param-ink)",
            note: tokenById.get(anchorId)!.group,
          },
          {
            label: "layout",
            value: layout,
            hue: layout === "learned" ? "var(--viz-truth-ink)" : "var(--viz-error-ink)",
            note: layout === "learned" ? "task-shaped" : "variance-only",
          },
          {
            label: "cos(k,q)",
            value: state.queenCosine.toFixed(3),
            hue: "var(--viz-prediction-ink)",
            note: "king·queen",
          },
        ]}
      />
    </figure>
  );
}
