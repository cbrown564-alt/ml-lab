import type { Spine } from "@/lib/exhibit/spine";

/**
 * Train/test spine: which stage the spread graphic shows — one split, then the lottery
 * of many splits scattering, then cross-validation pinning the estimate down. The
 * committed prediction sits on the-lottery beat: commit what reshuffling does to the
 * test error before stepping on to watch it scatter.
 */
export type TrainTestFrame = { stage: "split" | "lottery" | "cv" };

export const trainTestGeneralizationSpine: Spine<TrainTestFrame> = [
  {
    sectionId: "training-flatters",
    frame: { stage: "split" },
    terms: [
      { phrase: "the training error is low", hue: "neutral" },
      { phrase: "higher and honest", hue: "prediction" },
      { phrase: "the model's optimism", hue: "error" },
    ],
  },
  {
    sectionId: "the-lottery",
    frame: { stage: "lottery" },
    terms: [
      { phrase: "a coin toss", hue: "prediction" },
      { phrase: "a different validation error", hue: "error" },
    ],
    predict: {
      prompt:
        "One split gave a particular validation error. You reshuffle to a new random split — same model, same data, different held-out points. What does the validation error do?",
      options: [
        {
          label: "It jumps around — with a small holdout, which points you validate on swings the score",
          correct: true,
          feedback:
            "Right. A single split is one noisy sample of the model's skill. Reshuffle and the score scatters — sometimes a lot. Step on and watch the spread.",
        },
        {
          label: "It stays the same — the model didn't change, so its error can't either",
          feedback:
            "The model is fixed, but the validation error depends on which points it's measured against, and that changed. Step on and watch it jump.",
        },
        {
          label: "It always goes up — a new split is harder than the first",
          feedback:
            "There's no reason a new split is harder; it's a coin toss. The error scatters both ways around the truth. Step on and see.",
        },
      ],
    },
  },
  {
    sectionId: "cross-validation",
    frame: { stage: "cv" },
    terms: [
      { phrase: "k folds", hue: "truth" },
      { phrase: "the luck of any one split washes out", hue: "truth" },
      { phrase: "barely moves", hue: "truth" },
    ],
  },
  {
    sectionId: "in-practice",
    frame: { stage: "cv" },
    terms: [
      { phrase: "sealed until the very end", hue: "error" },
      { phrase: "a discipline", hue: "prediction" },
    ],
  },
];
