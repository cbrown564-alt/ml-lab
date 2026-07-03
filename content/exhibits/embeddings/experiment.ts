import type { ParamDef } from "@/lib/experiment/spec";
import {
  analogyFixture,
  embeddingTokens,
  learnedDomain,
  nearestByCosine,
  pcaDomain,
  pcaYDomain,
  queenCosineFromKing,
  tokenById,
} from "@/lib/models/embeddings";
import type { EmbeddingLayout } from "@/components/viz/EmbeddingMap";

export const tokens = embeddingTokens;

export const anchorChoices = tokens.map((token, index) => ({
  index,
  id: token.id,
  label: token.label,
}));

export const anchorParam: ParamDef = {
  id: "anchor",
  label: "Anchor token",
  hint: "Pick a word — its nearest neighbours in cosine distance are the ones the model thinks are similar.",
  min: 0,
  max: anchorChoices.length - 1,
  step: 1,
  default: 0,
};

export const layoutParam: ParamDef = {
  id: "layout",
  label: "Coordinate system",
  hint: "Learned embeddings are tuned for the task. PCA on raw co-occurrence counts finds variance, not analogy.",
  min: 0,
  max: 1,
  step: 1,
  default: 0,
};

export const anchorAt = (index: number) =>
  anchorChoices[Math.max(0, Math.min(anchorChoices.length - 1, index))]!.id;

export const layoutAt = (index: number): EmbeddingLayout => (index === 1 ? "pca" : "learned");

export const embeddingState = (anchorIndex: number, layoutIndex: number) => {
  const anchorId = anchorAt(anchorIndex);
  const layout = layoutAt(layoutIndex);
  const neighbors = nearestByCosine(anchorId, tokens, 3);
  const domains =
    layout === "learned"
      ? { x: learnedDomain, y: learnedDomain }
      : { x: pcaDomain, y: pcaYDomain };
  return {
    anchorId,
    layout,
    neighbors,
    domains,
    analogy: analogyFixture,
    queenCosine: queenCosineFromKing,
    anchorLabel: tokenById.get(anchorId)!.label,
  };
};

export const embeddingsScenario = {
  id: "word-geometry",
  title: "Words as points in a plane",
  prompt:
    "Each token is a vector — here drawn in 2-D so you can see the geometry. Similar words sit close; analogies become vector arithmetic. Toggle PCA to see what a fixed linear rotation misses.",
};

export { analogyFixture, queenCosineFromKing } from "@/lib/models/embeddings";
