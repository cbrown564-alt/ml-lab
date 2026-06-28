import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: the forest is a mean of tree votes, and one formula explains everything —
 * Var(average) = ρσ² + (1−ρ)σ²/B. Averaging kills the (1−ρ)/B part (the uncorrelated
 * variance), which is why you decorrelate the trees; it leaves the correlated floor ρσ²
 * and the bias untouched. Variance error-red, the count B param-purple, the vote prediction.
 */
export const randomForestsMath: MathDrawerContent = {
  nodeId: "random-forests",
  invitation:
    "One equation carries the whole idea. The forest is just an average of trees, and the variance of an average of B noisy, correlated estimators tells you exactly why the bootstrap, the random features, and 'more trees never hurt' all work.",
  sections: [
    {
      id: "the-ensemble",
      heading: "The forest is a mean of votes",
      blocks: [
        {
          kind: "equation",
          lines: ["P̄(x) = (1 / B) · Σ_b  p_b(x),   b = 1 … B"],
          caption:
            "Each p_b is one deep tree's estimated probability of class 1, grown on its own bootstrap sample with a random feature subset at every split. The forest's prediction is their plain mean over the B trees.",
          highlights: [{ text: "P̄(x)", hue: "prediction" }],
        },
      ],
    },
    {
      id: "variance-reduction",
      heading: "Why the average is steadier",
      blocks: [
        {
          kind: "equation",
          lines: ["Var(P̄) = ρ·σ²  +  (1 − ρ)·σ² / B"],
          caption:
            "σ² is one tree's variance; ρ is the average correlation between two trees' predictions. Add trees (B → ∞) and the second term vanishes, leaving the floor ρσ². So averaging only cancels the UNcorrelated part of the noise.",
          highlights: [
            { text: "Var(P̄)", hue: "error" },
            { text: "B", hue: "param" },
          ],
        },
        {
          kind: "prose",
          text: "That floor is the whole reason a random forest is random. Identical trees have ρ = 1, so Var(P̄) = σ² — averaging buys nothing. Push ρ toward 0 and the floor drops and the 1/B reduction bites. The bootstrap and the per-split feature subset exist precisely to lower ρ — to make the trees disagree — because disagreement is what averaging needs.",
          highlights: [{ text: "ρ", hue: "param" }],
        },
      ],
    },
    {
      id: "bias-stays",
      heading: "Averaging touches variance, never bias",
      blocks: [
        {
          kind: "prose",
          text: "The mean of B copies of a model has the same expected value as one copy: E[P̄] = E[p_b]. So the forest's bias equals a single tree's bias — averaging cannot fix underfitting. That is why the trees are grown deep: deep trees are low-bias and high-variance, and the forest is built to keep the low bias and average the variance away. A forest of shallow stumps would just be a steadier underfit.",
          highlights: [{ text: "never bias", hue: "param" }],
        },
        {
          kind: "prose",
          text: "And notice where the tree count B lives: only inside the variance term, divided. It can shrink variance toward the ρσ² floor but never add capacity to fit noise — so growing B can't overfit. The knob that can overfit is each tree's depth (it sets σ² and the bias); the number of trees is the free, safe one. Two different dials, doing two different jobs.",
          highlights: [{ text: "B", hue: "param" }],
        },
      ],
    },
  ],
  mathNodeIds: [],
};
