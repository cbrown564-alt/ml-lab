import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Train/test failure gallery. The live failure is the single small split (a lottery);
 * the others are tuning on the sealed test set, and reporting the training score at all.
 */
export const trainTestGeneralizationFailures: FailureGallery = {
  nodeId: "train-test-generalization",
  cards: [
    {
      id: "single-small-split",
      primitive: "small-samples",
      title: "A single small split",
      trigger: "Hold out only a handful of points and report the validation error from that one split.",
      symptom: "Reshuffle and the score swings wildly — near-zero on one split, large on the next, for the very same model. You can't tell skill from luck.",
      diagnosis: "A small validation set is a tiny, noisy sample of the model's true error, so any single number off it is dominated by which points happened to land in the holdout.",
      repair: "Use cross-validation (average over k folds) so every point is scored once as validation and the luck averages out — or hold out more data if you can spare it.",
      boundary: "With a large validation set, a single split is already stable — the lottery is specifically a small-holdout problem.",
    },
    {
      id: "tuning-on-test",
      primitive: "data-leakage",
      title: "Tuning on the test set",
      trigger: "Use your final test set repeatedly to choose the model, the features, or the hyperparameters.",
      symptom: "Validation looks ever better as you iterate, but the model underperforms on genuinely new data.",
      diagnosis: "Every decision made against a set fits the model to that set's quirks — so the more you tune against the test set, the less its score reflects unseen performance. You've leaked it into model selection.",
      repair: "Tune against a separate validation set (or cross-validation), and keep one test set sealed until the very end, spent exactly once.",
      boundary: "Looking at the test score once, at the end, is fine and necessary — the leak is using it to make choices.",
    },
  ],
};
