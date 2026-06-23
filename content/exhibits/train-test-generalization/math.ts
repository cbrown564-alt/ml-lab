import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: the training error is optimistically biased because the fit was
 * chosen to minimise it, and k-fold CV averages k held-out estimates so every point is
 * tested once. Train error tinted neutral (flatters), test/true error prediction, CV truth.
 */
export const trainTestGeneralizationMath: MathDrawerContent = {
  nodeId: "train-test-generalization",
  invitation:
    "Two facts make the whole discipline necessary: the training error is biased low by construction, and a single held-out estimate is noisy — both of which cross-validation is built to fix.",
  sections: [
    {
      id: "biased-low",
      heading: "Training error is biased low",
      blocks: [
        {
          kind: "equation",
          lines: ["fit chosen to minimise L_train   ⟹   E[L_train] ≤ E[L_test]"],
          caption: "The model's parameters were tuned to make L_train small, so it underestimates the error on fresh data — the gap is the optimism.",
          highlights: [
            { text: "L_train", hue: "neutral" },
            { text: "L_test", hue: "prediction" },
          ],
        },
        {
          kind: "prose",
          text: "The more flexible the model, the wider this gap: a model with enough capacity can drive L_train to zero while L_test stays high — which is exactly overfitting, seen here through the lens of the score rather than the fit.",
          highlights: [
            { text: "L_train", hue: "neutral" },
            { text: "L_test", hue: "prediction" },
          ],
        },
      ],
    },
    {
      id: "k-fold",
      heading: "k-fold CV averages k held-out estimates",
      blocks: [
        {
          kind: "equation",
          lines: ["CV = (1/k) Σ_f L_fold      (every point tested exactly once)"],
          caption: "Rotate the held-out fold k times and average. Averaging k estimates shrinks the variance, so the number barely moves when you reshuffle.",
          highlights: [{ text: "CV", hue: "truth" }],
        },
        {
          kind: "prose",
          text: "Choosing k is its own small tradeoff. Large k (up to leave-one-out, k = n) trains on almost all the data so each estimate is nearly unbiased, but the folds overlap heavily and it's expensive. Small k (5 or 10) is cheaper and the standard choice — a touch more bias, far less cost.",
          highlights: [{ text: "CV", hue: "truth" }],
        },
      ],
    },
  ],
  mathNodeIds: [],
};
