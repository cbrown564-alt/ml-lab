import type { Spine } from "@/lib/exhibit/spine";
import type { EmbeddingLayout } from "@/components/viz/EmbeddingMap";

export type EmbeddingsFrame = {
  anchorId: string;
  layout: EmbeddingLayout;
  showAnalogy?: boolean;
  showNeighbors?: boolean;
};

export const embeddingsSpine: Spine<EmbeddingsFrame> = [
  {
    sectionId: "hook",
    frame: { anchorId: "king", layout: "learned", showNeighbors: true },
    terms: [
      { phrase: "discrete tokens", hue: "truth" },
      { phrase: "continuous vectors", hue: "param" },
      { phrase: "similar things close", hue: "prediction" },
    ],
  },
  {
    sectionId: "similarity-is-distance",
    frame: { anchorId: "cat", layout: "learned", showNeighbors: true },
    terms: [
      { phrase: "cosine similarity", hue: "param" },
      { phrase: "nearest neighbours", hue: "prediction" },
      { phrase: "semantic cluster", hue: "truth" },
    ],
  },
  {
    sectionId: "vector-analogy",
    frame: { anchorId: "king", layout: "learned", showAnalogy: true },
    terms: [
      { phrase: "king − man + woman", hue: "param" },
      { phrase: "≈ queen", hue: "prediction" },
      { phrase: "linear offset", hue: "truth" },
    ],
    predict: {
      prompt:
        "In the learned embedding space, king − man + woman lands almost exactly on queen. What does that tell you about how the space was trained?",
      options: [
        {
          label:
            "The training objective preserved relational directions — gender and royalty show up as consistent vector offsets",
          correct: true,
          feedback:
            "Right. The space is not random coordinates — relationships become geometry you can add and subtract.",
        },
        {
          label:
            "PCA on the raw co-occurrence table would have produced the same layout automatically",
          feedback:
            "PCA finds directions of variance in fixed features. It does not tune axes so that king − man + woman lands on queen — toggle PCA in Run it to see the difference.",
        },
        {
          label:
            "It only means the three words share letters — the arithmetic is a coincidence",
          feedback:
            "The offset is pinned to distance 0.00 from queen in the committed fixture. That is structure in the vectors, not spelling.",
        },
      ],
    },
  },
  {
    sectionId: "pca-contrast",
    frame: { anchorId: "king", layout: "pca", showNeighbors: true },
    terms: [
      { phrase: "fixed rotation", hue: "error" },
      { phrase: "learned coordinates", hue: "truth" },
      { phrase: "task-tuned", hue: "param" },
    ],
  },
  {
    sectionId: "hierarchy",
    frame: { anchorId: "kitten", layout: "learned", showNeighbors: true },
    terms: [
      { phrase: "CNN feature maps", hue: "param" },
      { phrase: "token vectors", hue: "prediction" },
      { phrase: "attention reads here", hue: "truth" },
    ],
  },
];
