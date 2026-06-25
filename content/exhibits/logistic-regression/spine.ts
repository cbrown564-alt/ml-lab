import type { Spine } from "@/lib/exhibit/spine";

/**
 * Logistic-regression spine: which training step (and whether the probability field
 * is shown) each beat asserts — the trained field for the sigmoid, the bare boundary
 * line for the-boundary, a half-swung boundary for training, the full field for the
 * payoff. The committed prediction sits on the-boundary: commit whether a straight
 * line could ever classify the overlap perfectly, before training reveals it can't.
 */
export type LogisticFrame = { step: number; showProb: boolean };

export const logisticRegressionSpine: Spine<LogisticFrame> = [
  {
    sectionId: "the-sigmoid",
    frame: { step: 220, showProb: true },
    terms: [
      { phrase: "the sigmoid", hue: "prediction" },
      { phrase: "confident", hue: "prediction" },
      { phrase: "probability 0.5", hue: "neutral" },
    ],
  },
  {
    sectionId: "the-boundary",
    frame: { step: 220, showProb: false },
    terms: [
      { phrase: "z = 0 is a straight line", hue: "neutral" },
      { phrase: "the decision boundary", hue: "neutral" },
    ],
    predict: {
      prompt:
        "Training will settle the boundary in the band where the two clouds overlap, leaving a few points on the wrong side. Could a different straight line classify every point correctly?",
      options: [
        {
          label: "No — the classes overlap, and no straight line can separate mingled points",
          correct: true,
          feedback:
            "Right. Where the clouds interleave, any single line puts some of each class on the wrong side. The overlap is irreducible error — the best line just minimises it.",
        },
        {
          label: "Yes — with a better learning rate the boundary would find the perfect split",
          feedback:
            "The learning rate only changes how it gets there, not where 'there' is. The overlap means no straight line separates them — a faster descent finds the same imperfect best.",
        },
        {
          label: "Yes — train it for long enough and it reaches zero errors",
          feedback:
            "More steps converge to the same boundary, errors and all. The misclassified points sit in the overlap; no amount of training moves a straight line through mingled classes.",
        },
      ],
    },
  },
  {
    sectionId: "training",
    frame: { step: 3, showProb: true },
    terms: [
      { phrase: "the log-loss", hue: "error" },
      { phrase: "swings the boundary into the gap", hue: "param" },
    ],
  },
  {
    sectionId: "probabilities",
    frame: { step: 220, showProb: true },
    terms: [
      { phrase: "an estimated probability everywhere", hue: "prediction" },
      { phrase: "the wrong side", hue: "error" },
      { phrase: "where it isn't sure", hue: "neutral" },
    ],
  },
];
