import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Feature-scaling failure gallery. The stretched valley is the live one (the Break-it
 * lab); the others are the traps around scaling — that a bigger step can't fix it, and
 * that scaling on all the data leaks.
 */
export const featureScalingFailures: FailureGallery = {
  nodeId: "feature-scaling",
  cards: [
    {
      id: "stretched-valley",
      primitive: "feature-scaling",
      title: "The stretched valley",
      trigger: "Leave the input on raw, uncentred units, so the loss bowl is long, thin, and tilted.",
      symptom: "Descent zig-zags across the narrow valley with tiny steps, taking a hundred-plus iterations to crawl to a floor a round bowl would reach in a handful.",
      diagnosis: "The bowl's steepest and shallowest directions differ wildly (a large condition number), so the one stable step size is set by the steep wall — is the model slow, or the surface lopsided?",
      repair: "Standardize the input (mean 0, variance 1); scale mismatch often improves and the stable step range often widens, though correlation may still elongate the surface.",
      boundary: "Tree-based models split one feature at a time and are largely invariant to monotonic rescaling — scaling them often buys little.",
    },
    {
      id: "bigger-step-backfires",
      primitive: "feature-scaling",
      title: "The bigger step that backfires",
      trigger: "Try to cure the crawl on raw units by simply raising the learning rate.",
      symptom: "Instead of speeding up, the descent diverges — the loss explodes by powers of ten.",
      diagnosis: "A stretched bowl has a low stability ceiling; the step needed to make progress along the valley is far past the step that flies up the steep walls. The crawl can't be brute-forced.",
      repair: "Fix the conditioning, not the step: standardize to improve scale mismatch, and the larger step often becomes safe.",
      boundary: "On an already round bowl, a too-large step still diverges — scaling raises the ceiling, it doesn't remove it.",
    },
    {
      id: "scale-leak",
      primitive: "data-leakage",
      title: "Scaling that leaks",
      trigger: "Fit the scaler (its mean and variance) on the whole dataset before splitting into train and test.",
      symptom: "Validation looks fine, but the score may be quietly optimistic and not hold on truly unseen data.",
      diagnosis: "The scaler has seen the test set's distribution, so the test points were standardized using information from themselves — a subtle leak.",
      repair: "Fit the scaler on the training split only, then apply it to validation and test (a Pipeline does this inside each fold).",
      boundary: "The leak is often small for plain standardization on a large IID sample, but the same mistake with target-aware transforms is catastrophic — make the discipline a habit.",
    },
  ],
};
