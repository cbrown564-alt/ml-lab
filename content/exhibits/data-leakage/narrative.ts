import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Data leakage as the "too good to be true" score: on data with no signal at all, a
 * leaky pipeline manufactures confident skill, and a correct one reveals the truth.
 * Concrete throughout — the feature-selection trap — with the taxonomy of leaks in
 * the field notes.
 */
export const dataLeakageNarrative: ExhibitNarrative = {
  nodeId: "data-leakage",
  hook: [
    "Here is the most dangerous number in machine learning: a validation score that looks great and is a lie. The model passes every check, ships, and falls apart in production — not because the maths was wrong, but because information from the test set sneaked into training through a side channel. That side channel is data leakage, and it is the single most common way a model that 'works' in a notebook fails in the world.",
    "To see it clearly we'll rig the cruellest possible case: data with no signal whatsoever. If a score climbs above zero here, it can only be a leak.",
  ],
  story: [
    {
      id: "the-setup",
      heading: "Nothing to predict",
      paragraphs: [
        "Seventy-two features, sixty-four rows, every number drawn from pure noise — and a target drawn from pure noise too, with no relationship to any feature. The honest answer to 'how well can you predict the target?' is: not at all. Any model's out-of-sample R² should sit at zero. There is no signal to find.",
      ],
    },
    {
      id: "the-leak",
      heading: "A score from nowhere",
      paragraphs: [
        "Now the usual pipeline: with so many features, keep only the promising ten — the ten most correlated with the target. Then cross-validate a regression on those. The score comes back R² ≈ 0.41: the model appears to explain almost half the variance. On noise. The held-out points line up along the diagonal as if the model could really predict them.",
        "The leak is the *order* of operations. The ten features were chosen using the whole dataset — including the rows that would later serve as each test fold. The selection peeked at the answers, so 'held-out' points weren't really held out at all.",
      ],
    },
    {
      id: "the-fix",
      heading: "Move the selection inside the fold",
      paragraphs: [
        "The fix is small and absolute: every step that learns from the data — feature selection, scaling, imputation, encoding — must happen inside the cross-validation loop, fitted on each fold's training rows only. Do that, and the same procedure on the same data returns R² ≈ 0: the diagonal dissolves into a shapeless cloud. The skill was never in the data; it was in the leak.",
      ],
    },
    {
      id: "everywhere",
      heading: "The many doors a leak walks through",
      paragraphs: [
        "Feature selection is just one door. Scaling or imputing on the full dataset leaks the test set's statistics. A feature computed from the future — tomorrow's price, a value only known after the outcome — leaks the target directly. Duplicate or near-duplicate rows split across train and test leak by memorisation. Shuffling a time series leaks the future into the past. The tell is always the same: a score too good to be true, and a fit between the model's checks and a true, untouched holdout.",
      ],
    },
  ],
  fieldNotes: [
    "The discipline that prevents nearly all of it: split first, then fit every learned transform on the training split alone and apply it to the rest. In scikit-learn, put preprocessing and the estimator in a single Pipeline and cross-validate the Pipeline — the fold boundaries are respected automatically.",
    "Keep one final test set sealed until the very end, used exactly once. If the sealed-set score is far worse than your cross-validation score, you have a leak — that gap is the most reliable leak detector there is.",
    "About these numbers: this noise dataset was seeded so the leak is vivid (leaky R² ≈ 0.41, honest ≈ 0). The exact magnitude shifts with the data — a different draw might leak 0.3 or 0.5 — but the direction never does: peeking selection inflates the score, in-fold selection reports the truth. The mechanism is the lesson, not the decimal.",
  ],
};
