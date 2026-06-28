import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Gradient-boosting failure gallery. Boosting's power is its danger: it descends so well
 * that it descends past the signal (overfitting — the round count and learning rate are
 * dials you can overshoot), and because each round chases the current errors, it fixates
 * on the hardest points (outliers and mislabeled examples) harder than a forest would.
 */
export const gradientBoostingFailures: FailureGallery = {
  nodeId: "gradient-boosting",
  intro:
    "Boosting overfits where a forest can't, because it is descent: it keeps cutting the training loss until nothing useful is left to cut.",
  cards: [
    {
      id: "one-step-too-many",
      primitive: "overfitting",
      title: "One step too many",
      trigger:
        "Keep boosting well past the held-out loss's low point — or raise the learning rate so each step is large.",
      symptom:
        "Training loss runs to zero and the boundary contorts to capture stray points, while the held-out loss, which fell at first, turns back up and climbs. Accuracy may hold even as the model grows over-confidently wrong.",
      diagnosis:
        "Boosting is gradient descent, and descent doesn't stop itself. Every extra round (or every oversized step) keeps reducing training loss, so past the optimum the new trees fit noise the held-out set doesn't share.",
      repair:
        "Early stopping — watch a validation loss and quit at its minimum. Shrink the learning rate and add more rounds instead. Keep the trees shallow. These are the standard boosting controls, used together.",
      boundary:
        "On a large, clean dataset with a small learning rate, thousands of rounds can be exactly right — the held-out loss simply hasn't bottomed yet. 'Too many' is defined by that curve, not by a fixed number.",
      scenarioId: "two-moons-boosted",
    },
    {
      id: "chases-the-hard-cases",
      primitive: "outliers",
      title: "It chases the hard cases",
      trigger:
        "Mislabel a few points, or leave genuine outliers in the data, then boost for many rounds.",
      symptom:
        "Late trees spend themselves bending the boundary around those few stubborn points — the model contorts to fit examples a random forest would have averaged away.",
      diagnosis:
        "Each round fits the current residuals, and a mislabeled or outlying point stays wrong, so its residual stays large and keeps drawing the next tree's attention. Boosting focuses on the hardest cases by design — which backfires when the hardest cases are noise.",
      repair:
        "Clean or down-weight suspect points, use a more robust loss, cap depth and the learning rate so no few points dominate — or prefer bagging (a forest) when the data is noisy, since averaging dilutes outliers instead of chasing them.",
      boundary:
        "If the hard cases are real, rare signal rather than noise, boosting's focus on them is exactly what you want — that fixation is a feature on clean data and a failure on dirty data.",
    },
  ],
};
