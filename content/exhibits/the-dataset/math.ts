import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The dataset, formally: a feature matrix X and a target vector y. Each row is an example,
 * each feature column a dimension of X, and learning is finding a map from X to y using
 * only these rows. The notation makes "the table is all it sees" precise.
 */
export const theDatasetMath: MathDrawerContent = {
  nodeId: "the-dataset",
  invitation:
    "One line of notation pins down what a dataset is — and why the table, not the algorithm, is where the result is decided.",
  sections: [
    {
      id: "matrix",
      heading: "Features X, target y",
      blocks: [
        {
          kind: "equation",
          lines: ["X ∈ ℝ^{n×d},   y ∈ ℝ^n", "row i:   (xᵢ, yᵢ) = (features, target)"],
          caption: "n rows (examples), d feature columns stacked into X, and the target column y. Each row pairs one example's features with its answer.",
          highlights: [
            { text: "X", hue: "neutral" },
            { text: "y", hue: "truth" },
          ],
        },
      ],
    },
    {
      id: "map",
      heading: "Learning is X → y from the rows",
      blocks: [
        {
          kind: "equation",
          lines: ["find  f  such that  f(xᵢ) ≈ yᵢ  for the rows you have"],
          caption: "Every supervised model is some f mapping the feature row to the target — fit using only the rows in the table.",
          highlights: [{ text: "f(xᵢ) ≈ yᵢ", hue: "prediction" }],
        },
        {
          kind: "prose",
          text: "This is why the table is decisive. f is only ever fit to the rows of X and y you provide — a column you omit is a dimension f cannot see, a corrupted row is a point f must still honour, and an unrepresentative sample is the only population f will ever know. The algorithm chooses f from a family; the data chooses which f.",
          highlights: [{ text: "the data chooses which f", hue: "truth" }],
        },
      ],
    },
  ],
  mathNodeIds: ["what-is-ml", "regression-task"],
};
