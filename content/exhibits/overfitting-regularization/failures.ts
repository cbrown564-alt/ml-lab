import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Regularisation failure gallery. The signature failure is over-penalising (the live
 * Break-it one); the others are the traps that make a single λ penalise unfairly.
 */
export const overfittingRegularizationFailures: FailureGallery = {
  nodeId: "overfitting-regularization",
  cards: [
    {
      id: "over-penalised",
      primitive: "overfitting",
      title: "Too much of the cure",
      trigger: "Having reined an overfit in with a moderate penalty, keep raising λ on the assumption that more is safer.",
      symptom: "The curve goes limp and flat — the weights are crushed toward zero — and the test error climbs back up.",
      diagnosis: "Past a point the penalty removes signal, not just noise: you've traded variance for pure bias. Is the model wrong, or the penalty too strong?",
      repair: "Dial λ back into the window where the held-out error bottoms out — tune it, don't max it.",
      boundary: "Too little λ is the opposite failure (the overfit returns); the best λ is found by validation, never by intuition.",
    },
    {
      id: "unscaled-penalty",
      primitive: "feature-scaling",
      title: "An unfair penalty",
      trigger: "Apply ridge to features on wildly different scales without standardising first.",
      symptom: "A feature measured in large units gets an unfairly tiny weight and is barely penalised, while a small-unit feature is over-penalised — the regularisation lands on the wrong things.",
      diagnosis: "Ridge penalises every weight equally (Σwⱼ²), but a feature's weight scales inversely with its units — so the penalty's effect depends on arbitrary measurement choices.",
      repair: "Standardise the features before regularising, so the penalty treats them on equal footing.",
      boundary: "Some pipelines deliberately leave a feature unpenalised (like the intercept) — equal penalties aren't always the goal, but unintended ones never are.",
    },
  ],
};
