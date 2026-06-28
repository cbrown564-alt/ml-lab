import type { Spine } from "@/lib/exhibit/spine";

/**
 * Decision-tree spine: each beat asserts a tree depth, and the Story graphic grows the
 * tree diagram and subdivides the plane in lockstep (object constancy — the same points,
 * progressively carved). The hook shows the failed straight line over the data; depth
 * 1→2→3 builds the staircase; the deep frame is the memorized, jagged overfit. The
 * committed prediction sits on which-question — commit whether a tree grown until every
 * box is pure generalizes better or worse, before grow-too-far reveals it gets worse.
 */
export type DecisionTreeFrame = {
  /** Tree depth to show: 0 = raw points, 1 = first cut, up through the deep overfit.
   *  Drives both the tree diagram and the plane's staircase. */
  depth: number;
  /** Overlay the straight line logistic regression would draw — the boundary that fails. */
  showLine?: boolean;
};

export const decisionTreesSpine: Spine<DecisionTreeFrame> = [
  {
    sectionId: "hook",
    frame: { depth: 0, showLine: true },
    terms: [
      { phrase: "a straight line", hue: "prediction" },
      { phrase: "twenty questions", hue: "param" },
      { phrase: "one straight cut", hue: "param" },
    ],
  },
  {
    sectionId: "one-cut",
    frame: { depth: 1 },
    terms: [
      { phrase: "one cut that best sorts the two classes apart", hue: "param" },
      { phrase: "two leaves, two boxes", hue: "neutral" },
    ],
  },
  {
    sectionId: "the-staircase",
    frame: { depth: 2 },
    terms: [
      { phrase: "a staircase", hue: "prediction" },
      { phrase: "bends to the curve", hue: "prediction" },
    ],
    predict: {
      prompt:
        "This shallow tree separates the arcs cleanly. Imagine you keep asking questions until every training point sits in a pure box — the tree gets 100% of the training data right. On fresh data it has never seen, will it do better, the same, or worse than this shallow one?",
      options: [
        {
          label:
            "Worse — the deepest cuts wrap single stray points, so the tree memorizes flukes instead of the shape",
          correct: true,
          feedback:
            "Right. A perfectly pure tree has drawn a box around every noisy point that crossed the boundary. Those boxes describe this exact sample, not the underlying arcs — so on new points they misfire, and the held-out score sinks below this shallow tree's.",
        },
        {
          label:
            "Better — a model that is right about every training point has clearly learned the most",
          feedback:
            "This is the trap. 100% training accuracy measures memorization, not understanding. The extra cuts fit the noise in this sample; the only score that matters is on data the tree has never seen, and there a deep tree does worse than this shallow one.",
        },
        {
          label:
            "The same — once the boundary separates the classes, extra cuts can't change the test score",
          feedback:
            "Extra cuts keep changing the boundary — each one carves a new box around a stray point. That moves predictions near those points, and on held-out data the gap to training only widens. The shallow tree here is the sweet spot.",
        },
      ],
    },
  },
  {
    sectionId: "which-question",
    frame: { depth: 3 },
    terms: [
      { phrase: "Gini impurity", hue: "error" },
      { phrase: "perfectly pure", hue: "truth" },
      { phrase: "the biggest gain in purity", hue: "param" },
    ],
  },
  {
    sectionId: "grow-too-far",
    frame: { depth: 8 },
    terms: [
      { phrase: "a tiny box around each stray point", hue: "error" },
      { phrase: "overfitting you can see", hue: "error" },
      { phrase: "complexity knob", hue: "param" },
    ],
  },
];
