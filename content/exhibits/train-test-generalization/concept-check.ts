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
      prompt: "With a tiny holdout, the same model's test error swung from near-zero to large across random splits. Why?",
      options: [
        {
          label: "A small test set is a tiny, noisy sample — which few points land in it dominates the score",
          correct: true,
          feedback:
            "Right. The model is fixed; only the measurement changed. Average error over 3 lucky points is wildly different from 3 unlucky ones, so one small split is mostly luck.",
        },
        {
          label: "The model is being retrained differently each reshuffle, so it really changes",
          feedback:
            "It's refit on each split's training points, but the swing is far larger than that — it's the measurement on a tiny test set that's noisy, not the model.",
        },
        {
          label: "Reshuffling corrupts the data, inflating the error randomly",
          feedback:
            "Reshuffling just reassigns which points are train vs test — no corruption. The variance comes from scoring on a handful of points, where a couple of hard ones dominate.",
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
          label: "It rotates the holdout so every point is tested once, then averages — so the luck of any single split washes out",
          correct: true,
          feedback:
            "Exactly. Each point serves as a test point in exactly one fold; averaging the k held-out errors shrinks the variance, so the estimate barely moves when you reshuffle.",
        },
        {
          label: "It trains the model k times, so the model itself ends up better",
          feedback:
            "CV is about estimating error, not improving the model — you usually refit on all the data afterward. Its value is the stable estimate, from averaging k held-out scores.",
        },
        {
          label: "It uses a bigger test set than a single split does",
          feedback:
            "Each fold's test set is actually smaller (1/k of the data). The stability comes from averaging k of them so every point is tested once, not from any one being large.",
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
      prompt: "Break it on purpose: shrink the holdout to just a few points and watch a single split's test error become a coin flip across random splits.",
      taskEvent: "train-test:single-split-lottery",
      feedback:
        "You've seen why one split — especially a small one — can't be trusted. The cross-validation mark that didn't budge is the number to report instead.",
      difficulty: 1,
      targets: ["tt:break"],
    },
    {
      id: "transfer-deployment-gap",
      kind: "transfer",
      scenario:
        "A team validates a model with 90% cross-validation accuracy and ships it. In production it scores 71%, and the gap is stable — it isn't drifting over time. Cross-validation was done correctly.",
      prompt:
        "From what you've learned about what CV does and doesn't promise: what's the most likely explanation, what's the fix, and why won't more folds or regularisation help? Write it in your own words.",
      open: {
        placeholder:
          "e.g. CV only estimates error on data like… a stable gap means… so the fix is… more folds won't help because…",
        answer:
          "Honest cross-validation only estimates performance on data drawn like the training set — it can't see a population it was never shown. A stable gap (not drift) means production is a different distribution from the start, so the 90% was a correct estimate about the wrong population. The fix is representative data: collect production-like examples and re-evaluate (and retrain) on them. More folds won't help — they'd just pin down the same training-distribution estimate more tightly — and regularisation won't either: overfitting shows as a train–CV gap, but here CV itself was high and honest, so the problem is distribution shift, not capacity.",
      },
      difficulty: 3,
      targets: ["tt:transfer-shift"],
    },
  ],
};
