import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Regularization failure gallery. The signature failure is over-penalizing (the live
 * Break-it one); the others are the traps that make a single λ penalize unfairly.
 */
export const overfittingRegularizationFailures: FailureGallery = {
  nodeId: "overfitting-regularization",
  cards: [
    {
      id: "over-penalised",
      primitive: "underfitting",
      title: "Too much of the cure",
      trigger: "Having reined an overfit in with a moderate penalty, keep raising λ on the assumption that more is safer.",
      symptom: "The curve goes limp and flat — the weights are crushed toward zero — and validation error climbs back up.",
      diagnosis: "Past a point the penalty removes signal, not just noise: you've traded variance for pure bias. Is the model wrong, or the penalty too strong?",
      repair: "Dial λ back into the window where validation error bottoms out — tune it, don't max it.",
      boundary: "Too little λ is the opposite failure (the overfit returns); domain knowledge can guide the search, but validation or cross-validation should choose among candidate values.",
    },
    {
      id: "unscaled-penalty",
      primitive: "feature-scaling",
      title: "An unfair penalty",
      trigger: "Apply ridge to features on wildly different scales without standardizing first.",
      symptom: "A feature measured in large units gets an unfairly tiny weight and is barely penalized, while a small-unit feature is over-penalized — the regularization lands on the wrong things.",
      diagnosis: "Ridge penalizes every weight equally (Σwⱼ²), but a feature's weight scales inversely with its units — so the penalty's effect depends on arbitrary measurement choices.",
      repair: "Standardize the features before regularizing, so the penalty treats them on equal footing.",
      boundary: "Some pipelines deliberately leave a feature unpenalized (like the intercept) — equal penalties aren't always the goal, but unintended ones never are.",
    },
  ],
};
