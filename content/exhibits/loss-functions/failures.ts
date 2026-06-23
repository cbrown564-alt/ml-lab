import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Loss-functions failure gallery. The signature failure of squared error is its
 * sensitivity to outliers — the same story the Break-it lab stages live.
 */
export const lossFunctionsFailures: FailureGallery = {
  nodeId: "loss-functions",
  cards: [
    {
      id: "outliers-wreck-mse",
      primitive: "outliers",
      title: "Three points, a different line",
      trigger: "Add a few points far off the trend (or load “a few rogue points”) and judge with squared error.",
      symptom: "The least-squares line lurches toward the outliers, abandoning the trend the bulk of the data agrees on.",
      diagnosis: "Squared error penalises a miss by its square, so a few distant points outvote many honest ones — is the model wrong, or just the loss too sensitive to extremes?",
      repair: "Score with absolute error or Huber loss; both weight a miss closer to its size than its square, so the extremes lose their outsized vote.",
      boundary: "If the extreme points are real signal — not data-entry errors — a robust loss throws away exactly the data you needed.",
      scenarioId: "meet-the-judges",
    },
    {
      id: "mae-flat-gradient",
      primitive: "outliers",
      title: "When the robust fix stalls",
      trigger: "Optimise absolute error with plain gradient descent near the fit.",
      symptom: "The gradient is the same size everywhere and never shrinks near the minimum, so the optimiser jitters around the answer instead of settling.",
      diagnosis: "Absolute error has a constant slope and a kink at zero — there's no curvature to slow the steps down. Is robustness worth a loss that's hard to optimise?",
      repair: "Use Huber loss: quadratic near zero (smooth, settles cleanly) and linear in the tails (robust). It buys most of the robustness without the kink.",
      boundary: "With no outliers at all, plain squared error is simpler and statistically efficient — robustness you don't need is just lost precision.",
    },
  ],
};
