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
      setup: "You suspect a pipeline has a subtle leak somewhere, but everything looks fine in cross-validation.",
      prompt: "What's the most reliable way to catch a hidden leak?",
      options: [
        {
          label: "Keep one test set sealed until the very end; if its score is far below CV, there's a leak",
          correct: true,
          feedback:
            "Right. A truly untouched holdout, scored once, is the gold standard — a big gap between CV and the sealed-set score is the surest sign information leaked into training.",
        },
        {
          label: "Re-run cross-validation a few more times and average the scores",
          feedback:
            "Averaging a leaky CV just gives a stable wrong answer. The leak inflates every run; only data the pipeline never touched can expose it.",
        },
        {
          label: "Add regularisation until the CV score drops to something believable",
          feedback:
            "That hides the symptom without finding the cause. Regularisation can't undo a leak; a sealed holdout reveals whether one exists.",
        },
      ],
      verify: "Conceptually: a sealed test set scored once is the most reliable leak detector.",
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
      prompt: "From what the leak taught you, what went wrong, and how should they fix it?",
      options: [
        {
          label:
            "The scaler saw the test rows, leaking their statistics — fit the scaler on the training split only (e.g. inside a Pipeline) and re-evaluate",
          correct: true,
          feedback:
            "That's the transfer: preprocessing fit on all the data is the same leak as selection on all the data. The validation score was optimistic; fitting the scaler on train alone gives the honest one.",
        },
        {
          label: "Standardisation is the problem — remove it and the model will generalise",
          feedback:
            "Scaling isn't the issue; doing it before the split is. Fit the scaler on training rows only and keep it — the transform is fine, its timing was the leak.",
        },
        {
          label: "The validation score is correct; the new data must just be different",
          feedback:
            "The gap is the leak's signature, not distribution shift. The full-data scaler made validation optimistic; a train-only scaler closes the gap honestly.",
        },
      ],
      difficulty: 3,
      targets: ["leak:transfer-scaling"],
    },
  ],
};
