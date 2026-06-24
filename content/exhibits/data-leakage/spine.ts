import type { Spine } from "@/lib/exhibit/spine";

/**
 * Data-leakage spine: which scoring the graphic shows at each beat — the leaky
 * pipeline (a confident, false R²) until the reveal, then the honest one (the score
 * collapses to ~0). The committed prediction sits on the-leak beat: commit what the
 * honest cross-validation will report before stepping on to watch it collapse.
 */
export type DataLeakageFrame = { mode: "leaky" | "honest" };

export const dataLeakageSpine: Spine<DataLeakageFrame> = [
  {
    sectionId: "the-setup",
    frame: { mode: "leaky" },
    terms: [{ phrase: "pure noise", hue: "neutral" }],
  },
  {
    sectionId: "the-leak",
    frame: { mode: "leaky" },
    terms: [
      { phrase: "R² ≈ 0.41", hue: "error" },
      { phrase: "the order of operations", hue: "param" },
    ],
    predict: {
      prompt:
        "The leaky pipeline reports R² ≈ 0.41 on data with no signal. Redo it correctly — select the features inside each fold, on training rows only. What does the honest cross-validation report?",
      options: [
        {
          label: "About the same — the features really were the best ten",
          feedback:
            "They were the best ten only because selection saw the test folds. Pick them on training rows alone and they're no better than any other noise. Step on and watch the score collapse.",
        },
        {
          label: "It collapses to about zero — there was never any signal",
          correct: true,
          feedback:
            "Exactly. The 0.41 measured the peek, not skill. With selection inside the fold, R² falls to ~0 — the truth. Step on and see the diagonal dissolve.",
        },
        {
          label: "It goes hugely negative — honest CV always undershoots",
          feedback:
            "It lands scattered around zero — some folds dip negative, others poke just positive, and the average is near nil. Honest CV isn't biased here; it simply reports the real (absent) signal. Step on and see.",
        },
      ],
    },
  },
  {
    sectionId: "the-fix",
    frame: { mode: "honest" },
    terms: [
      { phrase: "inside the cross-validation loop", hue: "prediction" },
      { phrase: "R² ≈ 0", hue: "neutral" },
      { phrase: "a shapeless cloud", hue: "neutral" },
    ],
  },
  {
    sectionId: "everywhere",
    frame: { mode: "honest" },
    terms: [
      { phrase: "too good to be true", hue: "error" },
      { phrase: "a true, untouched holdout", hue: "prediction" },
    ],
  },
];
