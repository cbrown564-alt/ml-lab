import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Train/test generalisation as methodology: training error flatters, a single test
 * split is a lottery, and cross-validation averages the lottery into a number you can
 * trust. Reuses the polynomial model from the regression cluster; the focus is the
 * split, not the model.
 */
export const trainTestGeneralizationNarrative: ExhibitNarrative = {
  nodeId: "train-test-generalization",
  hook: [
    "The most natural way to check a model is also the most misleading: score it on the data you trained it on. Of course it does well there — it has seen every one of those points. The question a generalizing model must answer is how it does on data it hasn't seen, and answering it honestly turns out to be its own small discipline.",
    "Here is one pool of points and one model. Everything you change is how the data is split and scored — and how much that choice moves the verdict.",
  ],
  story: [
    {
      id: "training-flatters",
      heading: "The training score flatters",
      paragraphs: [
        "Fit the model on the gold training points and it threads them closely — the training error is low. But that number is the model grading its own homework: it was tuned to fit exactly those points. Score it instead on the hollow held-out points, which it never saw during fitting, and the error is often higher — though on a small or easier holdout it may be lower by chance. The gap between the two is the model's optimism made visible.",
      ],
    },
    {
      id: "the-lottery",
      heading: "A single split is a lottery",
      paragraphs: [
        "So hold some data out and report the validation error — done? Not quite. Which points land in the validation set was a coin toss, and with a small holdout that toss matters enormously. Reshuffle the split and the very same model on the very same data posts a different validation error, sometimes wildly so. One split gives you one sample of the model's true skill, with a generous helping of luck baked in.",
      ],
    },
    {
      id: "cross-validation",
      heading: "Cross-validation averages the luck out",
      paragraphs: [
        "The fix is to stop trusting any single split. K-fold cross-validation rotates the validation fold: fit on k−1 folds, score on the remaining fold, and repeat. Averaging the fold scores uses the training data more efficiently and reveals how sensitive the estimate is to the split. It reduces dependence on one lucky holdout; it does not remove uncertainty. Use cross-validation for model selection, and reserve a final untouched test set for the final estimate.",
      ],
    },
    {
      id: "in-practice",
      heading: "Three sets, used once",
      paragraphs: [
        "In practice the data splits three ways: a training set to fit on, a validation set (or cross-validation) to tune choices like the model's complexity, and a final test set sealed until the very end and spent exactly once. The moment you tune anything against a set, it stops being an honest estimate of unseen performance — so you keep one set truly untouched. Generalisation isn't a metric; it's a discipline about who sees what, and when.",
      ],
    },
  ],
  fieldNotes: [
    "Stratify the split on the target (and any rare group) so each fold has a representative mix — otherwise a fold can miss a class entirely and the score lurches. For grouped data (multiple rows per patient, per user), split by group, never by row, or the same entity leaks across train and test.",
    "For time series, never shuffle: the future must not leak into the past. Split by time — train on the past, test on the future — and use rolling-origin cross-validation instead of random folds.",
  ],
};
