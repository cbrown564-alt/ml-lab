import type { MathDrawerContent } from "@/lib/narrative/math";
import { analogyFixture, queenCosineFromKing } from "./experiment";

export const embeddingsMath: MathDrawerContent = {
  nodeId: "embeddings",
  invitation:
    "Two numbers per token here — but the same ideas scale to thousand-dimensional vectors and cosine attention scores.",
  sections: [
    {
      id: "cosine",
      heading: "Cosine similarity",
      blocks: [
        {
          kind: "equation",
          lines: ["cos(u, v) = (u · v) / (‖u‖ ‖v‖)"],
          caption: `On the fixture, cos(king, queen) = ${queenCosineFromKing.toFixed(
            3,
          )} — high because the vectors point the same way even if their lengths differ.`,
          highlights: [
            { text: "u · v", hue: "param" },
            { text: "‖u‖ ‖v‖", hue: "truth" },
          ],
        },
      ],
    },
    {
      id: "analogy",
      heading: "Vector analogy",
      blocks: [
        {
          kind: "equation",
          lines: ["v* ≈ v_a − v_b + v_c"],
          caption: `Committed example: king − man + woman lands ${analogyFixture.distanceToQueen.toFixed(
            2,
          )} from queen — essentially zero in this teaching map.`,
          highlights: [{ text: "v_a − v_b + v_c", hue: "prediction" }],
        },
      ],
    },
    {
      id: "pca-contrast",
      heading: "PCA vs learned",
      blocks: [
        {
          kind: "prose",
          text: "PCA rotates co-occurrence features to maximise variance. Embeddings rotate (and scale) coordinates so the language-model loss falls. Same compression problem — different objective, different geometry.",
          highlights: [
            { text: "maximise variance", hue: "error" },
            { text: "language-model loss", hue: "truth" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: ["pca"],
};
