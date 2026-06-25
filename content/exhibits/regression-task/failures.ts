import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Regression-task failure gallery. The live failure is scoring a continuous target with
 * accuracy (a metric mismatch); the other is needlessly binarising it, which forces an
 * arbitrary threshold and throws away how-much information.
 */
export const regressionTaskFailures: FailureGallery = {
  nodeId: "regression-task",
  cards: [
    {
      id: "accuracy-on-regression",
      primitive: "metric-mismatch",
      title: "Accuracy without a justified tolerance",
      trigger: "Score a continuous-valued model with exact-match (or “within ±k”) accuracy.",
      symptom: "An excellent model reads only a fraction “correct”, and a generous tolerance band can inflate the score to anything — tighten it toward exact and it collapses to near zero. The score is whatever band you pick.",
      diagnosis: "Accuracy needs a notion of “correct”, which for a continuous target requires an arbitrary cutoff. The metric doesn't fit the target's type, so its number is meaningless.",
      repair: "Score by distance — mean absolute or squared error — which needs no threshold and reflects how far off the model actually is.",
      boundary: "A predeclared tolerance can be useful when the application genuinely treats errors inside that band as equivalent. The failure is inventing the band after seeing the predictions or treating it as a universal definition of correctness.",
    },
    {
      id: "needless-binarisation",
      primitive: "threshold-choice",
      title: "Throwing the numbers away",
      trigger: "Collapse a continuous target into classes (pass/fail, high/low) when the decision actually needs the magnitude.",
      symptom: "Predicting 61 and predicting 95 both become just “pass”; the model can no longer tell a near-miss from a triumph, and moving the cutoff silently changes every label.",
      diagnosis: "Binarising discards how-much information and makes the result hostage to an arbitrary threshold — a regression question forced into a classification mould.",
      repair: "Keep the target continuous and predict the number; only binarise when the decision truly is categorical, and then justify the cutoff.",
      boundary: "If the decision really is yes/no (does the dosage exceed the safe limit?), classification is correct — the failure is discarding magnitude the decision needs.",
    },
  ],
};
