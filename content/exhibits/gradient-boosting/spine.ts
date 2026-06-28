import type { Spine } from "@/lib/exhibit/spine";

/**
 * Gradient-boosting spine: each beat asserts a number of rounds, and the graphic grows the
 * sequence and re-sums the running model in lockstep — a vague base rate sharpening into a
 * clean boundary, then contorting as it overshoots. The committed prediction sits on
 * gradient-descent-in-disguise: commit whether adding more rounds keeps helping (as a
 * forest's trees do), before the-overshoot reveals the held-out loss turning back up.
 */
export type GradientBoostingFrame = {
  /** Boosting rounds summed at this beat — 1 up to the overfit tail. */
  rounds: number;
};

export const gradientBoostingSpine: Spine<GradientBoostingFrame> = [
  {
    sectionId: "hook",
    frame: { rounds: 1 },
    terms: [
      { phrase: "reversed", hue: "neutral" },
      { phrase: "a relay team", hue: "param" },
      { phrase: "it can overshoot", hue: "error" },
    ],
  },
  {
    sectionId: "the-residual",
    frame: { rounds: 4 },
    terms: [
      { phrase: "those gaps are the residuals", hue: "error" },
      { phrase: "fit a small tree not to the labels, but to those residuals", hue: "param" },
      { phrase: "each one aimed", hue: "prediction" },
    ],
  },
  {
    sectionId: "gradient-descent-in-disguise",
    frame: { rounds: 20 },
    terms: [
      { phrase: "the negative gradient of the log-loss", hue: "error" },
      { phrase: "the learning rate is the step size", hue: "param" },
      { phrase: "the loss falls round by round", hue: "prediction" },
    ],
    predict: {
      prompt:
        "The forest taught you that adding more trees is always safe. Boosting also adds trees one at a time, and so far the loss keeps falling. Will adding more and more boosting rounds keep helping the same way?",
      options: [
        {
          label:
            "No — each boosting tree fits the last one's leftover errors, so more rounds keep driving training loss down and eventually fit the noise; the held-out loss bottoms out and then climbs",
          correct: true,
          feedback:
            "Right. Boosting's trees are not independent like a forest's — they're a sequence that keeps reducing training error, so past a point they fit flukes. The held-out loss makes a U: down, then back up. The number of rounds is a knob you can overshoot.",
        },
        {
          label:
            "Yes — it's an ensemble of trees like a random forest, so more trees can only help or plateau, never hurt",
          feedback:
            "That is the forest's logic, and boosting is its opposite. A forest averages independent trees (more cancels variance, always safe); boosting descends sequentially, so more rounds keep cutting training loss until they fit the noise. The held-out loss turns back up.",
        },
        {
          label:
            "Only if the trees are too deep — with shallow stumps, more rounds is always safe like a forest",
          feedback:
            "Shallow trees keep each step small, but the steps accumulate. A long sequence of stumps can still fit the training noise exactly — the training loss reaches zero either way. Depth slows the overshoot; it doesn't prevent it.",
        },
      ],
    },
  },
  {
    sectionId: "the-overshoot",
    frame: { rounds: 200 },
    terms: [
      { phrase: "the training loss marches toward zero", hue: "prediction" },
      { phrase: "the held-out loss tells the real story", hue: "error" },
      { phrase: "one good step too many", hue: "error" },
    ],
  },
  {
    sectionId: "the-controls",
    frame: { rounds: 30 },
    terms: [
      { phrase: "a lower learning rate", hue: "param" },
      { phrase: "stop early", hue: "param" },
      { phrase: "kept shallow on purpose", hue: "param" },
    ],
  },
];
