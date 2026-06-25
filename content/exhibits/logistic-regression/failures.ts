import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Logistic-regression failure gallery. The signature failure is the linear boundary
 * itself — it underfits any curved problem (the live XOR loop) — with overfitting the
 * opposite wall once you start engineering features.
 */
export const logisticRegressionFailures: FailureGallery = {
  nodeId: "logistic-regression",
  cards: [
    {
      id: "linear-cant-bend",
      primitive: "underfitting",
      title: "A straight line can't bend",
      trigger: "Train logistic regression on a problem whose boundary is curved — a parabola, a circle, one class encircling another.",
      symptom: "It nails the easy middle but is confidently wrong wherever the boundary curves away from the line; accuracy plateaus well short and no setting of the weights helps.",
      diagnosis: "Logistic regression draws one straight line (the score is linear in the features) — it's too rigid to follow a curve. High bias, and the optimiser isn't at fault.",
      repair: "Engineer features that bend: add x₁², x₁x₂, … so a straight line in the expanded space is a curve in the original — or switch to a model that bends on its own (trees, kernels, networks).",
      boundary: "If the classes really are linearly separable, the straight line is exactly right — adding curvature would only invite overfitting.",
    },
    {
      id: "bend-too-far",
      primitive: "overfitting",
      title: "Bend it too far",
      trigger: "Keep adding engineered features (high-degree polynomials, interactions) until the boundary can wriggle freely.",
      symptom: "Training accuracy hits 100% with a contorted boundary that loops around individual points — and test accuracy drops.",
      diagnosis: "Enough features make the linear model arbitrarily flexible, and it starts fitting noise — the same overfitting as a high-degree polynomial regression.",
      repair: "Add only the features the problem needs, and regularise (the L2 penalty) to keep the weights — and the boundary — tame.",
      boundary: "On genuinely complex boundaries with enough data, more features are the right call — overfitting is a risk to manage, not a reason to stay linear.",
    },
  ],
};
