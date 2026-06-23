import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism in one comparison: same examples, two targets, two scores. A continuous
 * target is scored by average distance; a categorical one by the fraction matched. The
 * target's type picks the loss — that's the whole definition of the task.
 */
export const regressionTaskMath: MathDrawerContent = {
  nodeId: "regression-task",
  invitation:
    "Strip it to the scoring rule. A regression task and a classification task differ in one place — the type of the target — and that single difference picks which formula measures “how good”.",
  sections: [
    {
      id: "regression",
      heading: "Regression — scored by distance",
      blocks: [
        {
          kind: "equation",
          lines: ["ŷ = f(x),   y ∈ ℝ", "loss  =  (1/n) Σ |ŷᵢ − yᵢ|"],
          caption: "The target is a continuous quantity, so the error of a prediction is its distance from the truth; the loss averages those distances (squared, for MSE).",
          highlights: [{ text: "|ŷᵢ − yᵢ|", hue: "error" }],
        },
      ],
    },
    {
      id: "classification",
      heading: "Classification — scored by matches",
      blocks: [
        {
          kind: "equation",
          lines: ["ŷ ∈ {classes}", "accuracy  =  (1/n) Σ 𝟙[ŷᵢ = yᵢ]"],
          caption: "The target is a label, so there's no distance — a prediction matches or it doesn't, and accuracy counts the matches.",
          highlights: [{ text: "𝟙[ŷᵢ = yᵢ]", hue: "truth" }],
        },
        {
          kind: "prose",
          text: "Same features, same examples — only the target's type changed, and with it the entire scoring rule. That's why naming the task comes first: it decides what the model outputs and which number tells you it works. Grade a continuous prediction with exact-match accuracy and even a near-perfect model scores ~0; grade a label with distance and the number is meaningless.",
          highlights: [
            { text: "exact-match accuracy", hue: "truth" },
            { text: "distance", hue: "error" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: ["loss-functions", "classification-task"],
};
