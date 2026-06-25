import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Data-leakage concept check. The misconceptions: that a high CV score is always
 * good news, that leakage is about the model rather than the pipeline order, and that
 * a single sealed test set is paranoia rather than the best leak detector there is.
 */
export const dataLeakageCheck: ConceptCheck = {
  nodeId: "data-leakage",
  items: [
    {
      id: "why-leak-inflates",
      kind: "choice",
      prompt: "Selecting features on all the data, then cross-validating, gave R² ≈ 0.41 on pure noise. Why?",
      options: [
        {
          label: "The selection used every row, so the 'held-out' folds had already helped choose the features",
          correct: true,
          feedback:
            "Exactly — the features were picked partly because they fit the test rows, so when those rows are scored they look predictable. The CV measured the peek, not real skill.",
        },
        {
          label: "With enough noise features, one of them genuinely predicts the target",
          feedback:
            "By construction nothing predicts the target — it's independent noise. The score is an artifact of the selection seeing the test folds, not a real signal.",
        },
        {
          label: "Cross-validation is unreliable and should be replaced with a single split",
          feedback:
            "CV is fine — it's the order of operations that broke it. Done correctly (selection inside each fold), the same CV reports the honest ~0.",
        },
      ],
      difficulty: 2,
      targets: ["leak:selection"],
    },
    {
      id: "the-rule",
      kind: "choice",
      prompt: "What's the general rule that prevents this whole family of leaks?",
      options: [
        {
          label: "Every step that learns from data — selection, scaling, imputation, encoding — goes inside the cross-validation loop, fit on training rows only",
          correct: true,
          feedback:
            "Right. Split first, then fit each learned transform on the training split alone. A single Pipeline cross-validated as one object respects the fold boundaries automatically.",
        },
        {
          label: "Use more folds, so each test fold is smaller and harder to leak into",
          feedback:
            "More folds don't help — if selection still sees all the data, every fold leaks regardless of size. The fix is where the steps happen, not how many folds.",
        },
        {
          label: "Pick a simpler model that can't overfit the leaked features",
          feedback:
            "A simpler model still inherits the leak — the inflated score comes from the pipeline order, not model complexity. Move the learned steps inside the split.",
        },
      ],
      difficulty: 2,
      targets: ["leak:rule"],
    },
    {
      id: "sealed-set-predict",
      kind: "predict",
      setup: "Cross-validation looks strong, but the final untouched test score is much lower.",
      prompt: "What does that result justify?",
      options: [
        {
          label: "Investigate leakage, distribution shift, repeated tuning, split mismatch, and pipeline differences before drawing a conclusion",
          correct: true,
          feedback:
            "Right. The sealed test set reveals that the earlier estimate did not transfer. It does not identify the cause on its own; the pipeline and data-generating process still need to be audited.",
        },
        {
          label: "Conclude there is a leak — a big gap below CV is proof information leaked into training",
          feedback:
            "A gap is a warning, not a diagnosis. Distribution shift, sampling variability, repeated tuning, label mismatch, and implementation differences can produce the same symptom.",
        },
        {
          label: "Re-run cross-validation a few more times and average the scores",
          feedback:
            "Averaging a leaky or optimistic CV just gives a stable wrong answer. The sealed holdout shows the estimate did not transfer — the next step is to audit why, not to re-average.",
        },
      ],
      verify: "Conceptually: a sealed test set scored once shows whether the estimate transferred; investigate before concluding leakage.",
      difficulty: 3,
      targets: ["leak:sealed-set"],
    },
    {
      id: "break-leak",
      kind: "experiment-task",
      prompt: "Break it on purpose: select the features on all the data and cross-validate, and watch a confident score appear on pure noise.",
      taskEvent: "data-leakage:leaked",
      feedback:
        "You've manufactured skill from nothing — the exact way a model aces validation and dies in production. Now you know the tell (a score too good to be true) and the fix (selection inside the fold).",
      difficulty: 1,
      targets: ["leak:break"],
    },
    {
      id: "transfer-scaling-leak",
      kind: "transfer",
      scenario:
        "A teammate standardises every feature using the full dataset's mean and variance, then splits into train and test and reports a strong validation score. The model later underperforms on new data.",
      prompt:
        "From what the leak taught you: what went wrong, how should they fix it, and why isn't the fix to drop standardisation? Write it in your own words.",
      open: {
        placeholder:
          "e.g. fitting the scaler on all the data let it see … so the validation score … the fix is … and dropping scaling is wrong because …",
        answer:
          "Fitting the scaler on the full dataset before splitting let it see the test rows' statistics (their mean and variance) — the same leak as selecting features on all the data — so the validation score was optimistic and didn't hold up on truly unseen data. The fix isn't to drop standardization; the transform is fine, its timing was the leak. Fit the scaler on the training split only (e.g. inside a Pipeline so it's re-fit on each fold) and re-evaluate. Fitting the scaler before the split is a leak and should be corrected with a pipeline. Re-evaluate after the repair; if a deployment gap remains, investigate distribution shift and implementation differences rather than assuming the scaler was the sole cause.",
      },
      difficulty: 3,
      targets: ["leak:transfer-scaling"],
    },
  ],
};
