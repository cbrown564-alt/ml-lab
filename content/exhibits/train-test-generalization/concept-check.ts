import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Train/test concept check. The misconceptions: that a good test score is trustworthy
 * regardless of split size, that cross-validation is just "more splits," and that the
 * test set is there to be optimised against.
 */
export const trainTestGeneralizationCheck: ConceptCheck = {
  nodeId: "train-test-generalization",
  items: [
    {
      id: "why-single-split-noisy",
      kind: "choice",
      prompt: "With a tiny holdout, the same model's validation error swung from near-zero to large across random splits. Why?",
      options: [
        {
          label: "A small validation set is a tiny, noisy sample — which few points land in it dominates the score",
          correct: true,
          feedback:
            "Right. Each split changes both the training sample used to refit the model and the examples used to score it. Average error over 3 lucky points is wildly different from 3 unlucky ones, so one small split is mostly luck.",
        },
        {
          label: "The model is being retrained differently each reshuffle, so it really changes",
          feedback:
            "It's refit on each split's training points, but the swing is far larger than that — it's the measurement on a tiny validation set that's noisy, not the model.",
        },
        {
          label: "Reshuffling corrupts the data, inflating the error randomly",
          feedback:
            "Reshuffling just reassigns which points are train vs validation — no corruption. The variance comes from scoring on a handful of points, where a couple of hard ones dominate.",
        },
      ],
      difficulty: 2,
      targets: ["tt:single-split"],
    },
    {
      id: "what-cv-does",
      kind: "choice",
      prompt: "How does k-fold cross-validation give a more trustworthy number than one split?",
      options: [
        {
          label: "It rotates the holdout so every point is scored once as validation, then averages — so the luck of any single split washes out",
          correct: true,
          feedback:
            "Exactly. In ordinary k-fold CV, each point serves as a validation point in one fold; averaging the k held-out errors shrinks the variance compared with one split, though the estimate can still move when you reshuffle.",
        },
        {
          label: "It trains the model k times, so the model itself ends up better",
          feedback:
            "CV is about estimating error, not improving the model — you usually refit on all the data afterward. Its value is the stable estimate, from averaging k held-out scores.",
        },
        {
          label: "It uses a bigger validation set than a single split does",
          feedback:
            "Each fold's holdout is actually smaller (1/k of the data). The stability comes from averaging k of them so every point is scored once, not from any one being large.",
        },
      ],
      difficulty: 2,
      targets: ["tt:cv"],
    },
    {
      id: "sealed-test-predict",
      kind: "predict",
      setup: "You try twenty model variants and, each time, keep the one with the best score on your single held-out test set.",
      prompt: "Is that final test score still an honest estimate of performance on new data?",
      options: [
        {
          label: "No — picking the best of twenty by the test set fits it to that set's noise; the score is optimistic",
          correct: true,
          feedback:
            "Right. Selecting against the test set is a form of leakage: with twenty tries, the winner is partly lucky on those specific points. You'd need a fresh, untouched set to estimate honestly.",
        },
        {
          label: "Yes — you only looked at the test set, you never trained on it",
          feedback:
            "Looking is enough to leak when you select on it. Choosing the best of twenty by test score bakes that set's quirks into your choice, inflating the reported number.",
        },
        {
          label: "Yes, as long as the test set is large enough",
          feedback:
            "Size helps the variance but not the bias from selection. Tuning against a set — at any size — makes its score optimistic; you need a sealed set spent once.",
        },
      ],
      verify: "Conceptually: selecting against the test set leaks it into model choice — keep one set sealed.",
      difficulty: 3,
      targets: ["tt:sealed-set"],
    },
    {
      id: "break-lottery",
      kind: "experiment-task",
      prompt: "Break it on purpose: shrink the holdout to just a few points and watch a single split's validation error become a coin flip across random splits.",
      taskEvent: "train-test:single-split-lottery",
      feedback:
        "You've seen why one split — especially a small one — can't be trusted. Cross-validation gives a more stable estimate for model selection; keep a final test set sealed for the one-time check.",
      difficulty: 1,
      targets: ["tt:break"],
    },
    {
      id: "transfer-deployment-gap",
      kind: "transfer",
      scenario:
        "A team validates a model with 90% cross-validation accuracy and ships it. In production it scores 71%, and the gap is stable — it isn't drifting over time. Cross-validation was done correctly.",
      prompt:
        "From what you've learned about what CV does and doesn't promise: what's the most likely explanation, what's the fix, and why won't more folds or regularization help? Write it in your own words.",
      open: {
        placeholder:
          "e.g. CV only estimates error on data like… a stable gap means… so the fix is… more folds won't help because…",
        answer:
          "Honest cross-validation estimates performance on data drawn like the training set — it can't see a population it was never shown. A stable production gap does not uniquely identify distribution shift. Investigate whether production examples match the training population, whether features are computed identically, whether labels mean the same thing, whether latency or missingness changed, and whether any leakage inflated validation. Then collect production-like evaluation data and retrain or redesign the pipeline as the diagnosis requires. More folds won't help by themselves — they'd just pin down the same training-distribution estimate more tightly — and regularization won't either if the problem is population mismatch rather than overfitting.",
      },
      difficulty: 3,
      targets: ["tt:transfer-shift"],
    },
  ],
};
