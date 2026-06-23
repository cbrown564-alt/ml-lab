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
    "The most natural way to check a model is also the most misleading: score it on the data you trained it on. Of course it does well there — it has seen every one of those points. The only question that matters is how it does on data it hasn't seen, and answering it honestly turns out to be its own small discipline.",
    "Here is one pool of points and one model. Everything you change is how the data is split and scored — and how much that choice moves the verdict.",
  ],
  story: [
    {
      id: "training-flatters",
      heading: "The training score flatters",
      paragraphs: [
        "Fit the model on the gold training points and it threads them closely — the training error is low. But that number is the model grading its own homework: it was tuned to fit exactly those points. Score it instead on the hollow held-out points, which it never saw during fitting, and the error is higher and honest. The gap between the two is the model's optimism made visible.",
      ],
    },
    {
      id: "the-lottery",
      heading: "A single split is a lottery",
      paragraphs: [
        "So hold some data out and report the test error — done? Not quite. Which points land in the test set was a coin toss, and with a small holdout that toss matters enormously. Reshuffle the split and the very same model on the very same data posts a different test error, sometimes wildly so. One split gives you one sample of the model's true skill, with a generous helping of luck baked in.",
      ],
    },
    {
      id: "cross-validation",
      heading: "Cross-validation averages the luck out",
      paragraphs: [
        "The fix is to stop trusting any single split. Cross-validation splits the data into k folds, then takes turns: train on k−1 folds, test on the one held out, and rotate until every point has been a test point exactly once. Average the k test errors and the luck of any one split washes out — the estimate barely moves when you reshuffle. That stable number, not a lucky single split, is what you report and compare models by.",
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
