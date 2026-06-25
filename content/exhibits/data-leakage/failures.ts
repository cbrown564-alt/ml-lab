import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Data-leakage failure gallery. The feature-selection trap is the live one; the
 * others are the doors a leak most often walks through — preprocessing before the
 * split, and a feature computed from the future.
 */
export const dataLeakageFailures: FailureGallery = {
  nodeId: "data-leakage",
  cards: [
    {
      id: "selection-peeked",
      primitive: "data-leakage",
      title: "Selection that peeked",
      trigger: "Choose the most target-correlated features using the whole dataset, then cross-validate.",
      symptom: "Cross-validation reports confident skill — even on pure noise — and the held-out points line up on the diagonal as if predictable.",
      diagnosis: "The selection saw every row, including the ones each fold later 'holds out', so the features were chosen partly to fit the test folds. Is the model skilled, or did the pipeline peek? A score too good to be true is a warning, not a diagnosis by itself.",
      repair: "Move every data-dependent step — selection included — inside the cross-validation loop, fitted on each fold's training rows only.",
      boundary: "If the features were chosen by domain knowledge rather than from the data, there's no leak — the trap is letting the data choose using the test rows.",
    },
    {
      id: "preprocess-before-split",
      primitive: "data-leakage",
      title: "Preprocessing before the split",
      trigger: "Fit a scaler, imputer, or target encoder on the full dataset before splitting into train and test.",
      symptom: "Validation looks great; the model quietly underperforms on truly unseen data, and the gap only shows up in production.",
      diagnosis: "The transform learned statistics (means, variances, category-target maps) from the test rows, so the test set's own information leaked into how it was processed.",
      repair: "Fit every transform on the training split only and apply it to the rest — a single Pipeline does this correctly inside each fold.",
      boundary: "Stateless transforms (a fixed log, a constant unit conversion) learn nothing from the data and can't leak — only fitted ones do.",
    },
    {
      id: "future-feature",
      primitive: "data-leakage",
      title: "A feature from the future",
      trigger: "Include a feature whose value is only known after the outcome — tomorrow's price, a field filled in at resolution time.",
      symptom: "The model is near-perfect in validation and useless in deployment, where that feature simply isn't available yet.",
      diagnosis: "The feature is a proxy for the target itself, so the model 'predicts' by reading the answer — a leak that survives any split because it's baked into the data.",
      repair: "Audit each feature for what was knowable at prediction time, and drop anything that wouldn't exist when the model is actually called.",
      boundary: "A lagged version of the same signal (yesterday's price) is fair game — the test is availability at prediction time, not the variable's name.",
    },
  ],
};
