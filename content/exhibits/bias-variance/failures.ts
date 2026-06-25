import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Bias–variance failure gallery. Both ends of the U are failures: too much capacity
 * (overfit, the live Break-it one) and too little (underfit).
 */
export const biasVarianceFailures: FailureGallery = {
  nodeId: "bias-variance",
  cards: [
    {
      id: "memorise-the-noise",
      primitive: "overfitting",
      title: "Memorising the noise",
      trigger: "Raise the model's flexibility (the polynomial degree) until it can thread every training point.",
      symptom: "Training error falls toward zero while validation error — on data the model never saw during selection — climbs. The curve lunges between the points.",
      diagnosis: "The extra capacity is spent fitting the noise in the training sample, not the underlying shape — high variance, a fit that swings wildly as the sample changes.",
      repair: "Use a validation curve or cross-validation to choose capacity, then evaluate the selected model once on the final test set; or hold capacity and regularize, or gather more data.",
      boundary: "With enough data, a flexible model can be the right call — more data often reduces variance, so the sweet-spot degree rises.",
    },
    {
      id: "too-stiff",
      primitive: "underfitting",
      title: "Too stiff to see the shape",
      trigger: "Drop the degree to 1 — a straight line — on data that genuinely curves.",
      symptom: "Training and validation error are both high, and roughly equal: the model misses the shape everywhere, on seen and unseen data alike.",
      diagnosis: "The model is too rigid to represent the truth — high bias. With the model class held fixed, more data does not remove approximation bias; the model simply can't bend that far.",
      repair: "Raise capacity (a higher degree, a richer model) until the fit can follow the real shape — using a validation curve or cross-validation to find the floor, then evaluate once on the final test set.",
      boundary: "If the truth really is a straight line, the stiff model is correct — bias is only a failure relative to a shape the model can't reach.",
    },
  ],
};
