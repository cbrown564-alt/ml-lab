import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Linear regression's failure gallery. The outlier card is the live one — the
 * "tyranny of the outlier" scenario stages it in the bench; the collinearity
 * card is a diagnosis the learner carries into multi-feature models. Both bind
 * to shared taxonomy primitives so the same failures are recognisable later.
 */
export const linearRegressionFailures: FailureGallery = {
  nodeId: "linear-regression",
  cards: [
    {
      id: "outlier-tyranny",
      primitive: "outliers",
      title: "One outlier, outsized influence",
      trigger: "Drag one or two points far off the trend — or load the outlier scenario.",
      symptom: "The whole fit line swings toward the strays, and one giant residual square dwarfs every other.",
      diagnosis: "Squared error penalises a miss by its square, so a handful of far points outvote the crowd — is the model wrong, or is squared error the wrong judge for this data?",
      repair: "Switch to a robust loss (absolute error or Huber), or remove points you can confirm are recording errors.",
      boundary: "If the outliers are the signal — fraud, a rare event, a real regime — robustifying hides exactly what you came to find.",
      scenarioId: "tyranny-of-the-outlier",
    },
    {
      id: "redundant-feature",
      primitive: "collinearity",
      title: "Two features that move together",
      trigger: "Add a feature that is nearly a copy — a linear combination — of one the model already has.",
      symptom: "Coefficients swing wildly and flip sign on tiny data changes, even though the fitted line barely moves.",
      diagnosis: "When features are linearly dependent, many weightings fit equally well — which one did the solver land on, and why won't it sit still?",
      repair: "Drop or merge the redundant feature, or add ridge regularisation to pick one stable solution.",
      boundary: "If you only need predictions, unstable coefficients may not matter — don't “fix” what you are not reading.",
    },
  ],
};
