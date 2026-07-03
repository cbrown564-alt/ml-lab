/**
 * Embedding geometry for the embeddings exhibit: cosine similarity, vector
 * analogies, and nearest-neighbour lookup on committed 2-D token vectors.
 */

import fixture from "./fixtures/embeddings.json";

export type Vec2 = { x: number; y: number };

export type EmbeddingToken = {
  id: string;
  label: string;
  group: string;
  vector: Vec2;
  pca: Vec2;
};

const toVec2 = (pair: number[]): Vec2 => ({ x: pair[0]!, y: pair[1]! });

export const embeddingTokens: EmbeddingToken[] = fixture.tokens.map((token) => ({
  id: token.id,
  label: token.label,
  group: token.group,
  vector: toVec2(token.vector),
  pca: toVec2(token.pca),
}));

export const tokenById = new Map(embeddingTokens.map((token) => [token.id, token]));

export const analogyFixture = {
  ...fixture.analogy,
  result: toVec2(fixture.analogy.result),
  distanceToQueen: fixture.analogy.distanceToQueen,
};

export const learnedDomain = fixture.domain.learned as [number, number];
export const pcaDomain = fixture.domain.pca as [number, number];
export const pcaYDomain = fixture.domain.pcaY as [number, number];

export const queenCosineFromKing = fixture.nearestKing.queenCosine as number;

export function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vecSub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vecNorm(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function cosineSimilarity(a: Vec2, b: Vec2): number {
  const denom = vecNorm(a) * vecNorm(b);
  if (denom === 0) return 0;
  return (a.x * b.x + a.y * b.y) / denom;
}

export function euclideanDistance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function vectorAnalogy(a: Vec2, b: Vec2, c: Vec2): Vec2 {
  return vecAdd(vecSub(a, b), c);
}

export function nearestByCosine(
  anchorId: string,
  tokens: EmbeddingToken[] = embeddingTokens,
  k = 3,
): { token: EmbeddingToken; cosine: number }[] {
  const anchor = tokenById.get(anchorId);
  if (!anchor) return [];
  return tokens
    .filter((token) => token.id !== anchorId)
    .map((token) => ({ token, cosine: cosineSimilarity(anchor.vector, token.vector) }))
    .sort((left, right) => right.cosine - left.cosine)
    .slice(0, k);
}

export function analogyDistance(aId: string, bId: string, cId: string, targetId: string): number {
  const a = tokenById.get(aId)!.vector;
  const b = tokenById.get(bId)!.vector;
  const c = tokenById.get(cId)!.vector;
  const target = tokenById.get(targetId)!.vector;
  return euclideanDistance(vectorAnalogy(a, b, c), target);
}

export const GROUP_COLORS: Record<string, { fill: string; ink: string }> = {
  royalty: { fill: "var(--viz-prediction)", ink: "var(--viz-prediction-ink)" },
  gender: { fill: "var(--viz-param)", ink: "var(--viz-param-ink)" },
  animal: { fill: "var(--viz-truth)", ink: "var(--viz-truth-ink)" },
  motion: { fill: "var(--viz-error)", ink: "var(--viz-error-ink)" },
  temperature: { fill: "var(--viz-neutral)", ink: "var(--viz-neutral-ink)" },
};

export const groupColor = (group: string) =>
  GROUP_COLORS[group] ?? { fill: "var(--viz-neutral)", ink: "var(--viz-neutral-ink)" };
