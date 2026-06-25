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
      diagnosis: "The step is larger than the curvature can absorb — a learning-rate stability problem, distinct from exploding gradients in deep networks, though both can show up as runaway loss. (The surface fixes a hard ceiling near η ≈ 2/λ_max.)",
      repair: "Lower the learning rate below that ceiling, or improve conditioning with standardization. Gradient clipping can cap a step but does not repair poor curvature or choose a stable learning rate by itself.",
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
      repair: "Standardize to improve the scale mismatch; correlation may still leave the surface elongated. The same learning rate then often walks more directly to the floor.",
      boundary: "Tree-based models split one feature at a time and ignore scale entirely — rescaling there buys nothing.",
      scenarioId: "watch-it-learn",
    },
  ],
};
