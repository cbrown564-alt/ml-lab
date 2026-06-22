import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Gradient descent's failure gallery. Both cards are live: "over the edge"
 * stages divergence, and the stretched-valley card names why the descent in
 * "watch it learn" zigzags rather than walking straight down — the conditioning
 * story the surface already tells.
 */
export const gradientDescentFailures: FailureGallery = {
  nodeId: "gradient-descent",
  cards: [
    {
      id: "diverge-too-bold",
      primitive: "vanishing-exploding-gradients",
      title: "Over the edge",
      trigger: "Turn the learning rate up past the stability ceiling — try 1.0, or load “over the edge”.",
      symptom: "Each step overshoots the valley and lands higher up the far wall; the loss doesn't fall, it explodes toward infinity.",
      diagnosis: "The step is larger than the curvature can absorb — is the model broken, or just the step size? (The surface fixes a hard ceiling near η ≈ 2/λ_max.)",
      repair: "Lower the learning rate below that ceiling, or normalise / clip so no single step can blow up.",
      boundary: "Too timid a step is the opposite failure — it never diverges, but it never arrives either.",
      scenarioId: "over-the-edge",
    },
    {
      id: "stretched-valley",
      primitive: "feature-scaling",
      title: "The stretched valley",
      trigger: "Leave features on wildly different scales — here the loss surface is already stretched into a long, narrow valley.",
      symptom: "Descent zigzags across the valley instead of heading straight down, taking many steps to crawl to the floor.",
      diagnosis: "One step size can't suit a surface that is steep across the valley and shallow along it — which axis is forcing the small step?",
      repair: "Standardise the features so the bowl is round; the same learning rate then walks almost straight to the floor.",
      boundary: "Tree-based models split one feature at a time and ignore scale entirely — rescaling there buys nothing.",
      scenarioId: "watch-it-learn",
    },
  ],
};
