import { describe, expect, it } from "vitest";
import {
  analogyDistance,
  analogyFixture,
  cosineSimilarity,
  embeddingTokens,
  nearestByCosine,
  queenCosineFromKing,
  tokenById,
  vectorAnalogy,
} from "./embeddings";

describe("embeddings model layer", () => {
  it("pins the king→queen cosine similarity from the fixture", () => {
    const king = tokenById.get("king")!.vector;
    const queen = tokenById.get("queen")!.vector;
    expect(cosineSimilarity(king, queen)).toBeCloseTo(queenCosineFromKing, 6);
  });

  it("resolves king − man + woman near queen", () => {
    expect(analogyFixture.distanceToQueen).toBeLessThan(0.05);
    expect(
      analogyDistance("king", "man", "woman", "queen"),
    ).toBeCloseTo(analogyFixture.distanceToQueen, 6);
  });

  it("ranks royalty neighbours ahead of unrelated tokens for king", () => {
    const nearest = nearestByCosine("king", embeddingTokens, 3).map((row) => row.token.id);
    expect(nearest).toEqual(["queen", "prince", "woman"]);
  });

  it("breaks the analogy in pca space (the Break-it beat depends on this)", () => {
    expect(
      analogyDistance("king", "man", "woman", "queen", "pca"),
    ).toBeCloseTo(analogyFixture.pcaDistanceToQueen, 6);
    // PCA is linear, so a compositional feature matrix would carry the analogy into
    // the projection exactly — guard that the fixture keeps the miss genuinely visible.
    expect(analogyFixture.pcaDistanceToQueen).toBeGreaterThan(0.35);
  });
});
