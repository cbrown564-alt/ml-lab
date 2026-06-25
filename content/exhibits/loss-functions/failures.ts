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
      boundary: "A robust loss downweights extreme residuals, which can be harmful when those cases are rare but important rather than contaminated.",
      scenarioId: "meet-the-judges",
    },
    {
      id: "robustness-isnt-free",
      primitive: "outliers",
      title: "Robustness isn't free",
      trigger: "Reach for absolute or Huber error on clean data that has no outliers at all.",
      symptom: "The fit is no better — and the optimisation is fiddlier: absolute error's gradient is the same size everywhere and kinks at zero, so it jitters near the minimum instead of settling.",
      diagnosis: "A robust loss spends statistical efficiency (and smooth curvature) to buy resistance to outliers — with none present, you've paid for protection you don't need. Are there really extremes to defend against?",
      repair: "Under roughly Gaussian, homoscedastic noise, squared error is an efficient and convenient choice. Under other noise or cost structures, another loss may still be preferable.",
      boundary: "The moment a few extreme points appear, the calculus flips — then the robustness is worth every bit of the precision it costs.",
    },
  ],
};
