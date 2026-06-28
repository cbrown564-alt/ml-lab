import type { Spine } from "@/lib/exhibit/spine";

/**
 * Random-forest spine: each beat asserts a forest size, and the graphic grows the crowd
 * and re-averages its vote in lockstep — one jagged tree → a smooth, steady boundary. The
 * committed prediction sits on the-vote: commit whether adding more TREES can overfit the
 * way adding depth did, before more-is-safe reveals the curve only flattens, never a U.
 */
export type RandomForestFrame = {
  /** How many trees are averaged at this beat — 1 (one jagged tree) up to the full crowd. */
  nTrees: number;
};

export const randomForestsSpine: Spine<RandomForestFrame> = [
  {
    sectionId: "hook",
    frame: { nTrees: 1 },
    terms: [
      { phrase: "change its mind", hue: "error" },
      { phrase: "let them vote", hue: "prediction" },
      { phrase: "the average cancels the noise", hue: "prediction" },
    ],
  },
  {
    sectionId: "a-crowd",
    frame: { nTrees: 4 },
    terms: [
      { phrase: "its own bootstrap sample", hue: "param" },
      { phrase: "a random subset of the features", hue: "param" },
      { phrase: "a private jagged staircase", hue: "error" },
    ],
  },
  {
    sectionId: "the-vote",
    frame: { nTrees: 14 },
    terms: [
      { phrase: "take the mean", hue: "prediction" },
      { phrase: "one clean curve", hue: "prediction" },
      { phrase: "barely moves", hue: "truth" },
    ],
    predict: {
      prompt:
        "Cranking a single tree's depth overfit it — too deep, and the held-out score fell. You're about to crank the NUMBER of trees instead. Will adding more and more trees overfit the forest the same way?",
      options: [
        {
          label:
            "No — more trees only steady the average; the count isn't a complexity knob the way depth is",
          correct: true,
          feedback:
            "Right. Averaging more estimates can only reduce variance, never add the capacity to fit noise. The held-out curve climbs and then plateaus — it never makes the systematic U a too-deep tree does (small wiggles are just test-set noise). The thing that can still overfit is each tree's depth, not how many trees you average.",
        },
        {
          label:
            "Yes — more trees means more total complexity, so eventually the forest overfits like a deep tree did",
          feedback:
            "This conflates two different knobs. A forest's capacity to fit noise lives in each tree (its depth), not in the count. Adding trees averages the same kind of model more times — that shrinks variance and can't manufacture new capacity. No systematic U appears — only test-set jiggle.",
        },
        {
          label:
            "Only if the trees are deep — then averaging many deep trees compounds their overfitting",
          feedback:
            "The opposite: deep trees overfit individually, and averaging many of them is exactly what cancels that overfitting. Depth raises each tree's variance; the crowd averages it away. More trees never compound it — they bury it.",
        },
      ],
    },
  },
  {
    sectionId: "wisdom-of-crowds",
    frame: { nTrees: 30 },
    terms: [
      { phrase: "cancels their independent errors", hue: "prediction" },
      { phrase: "shrinks variance, not bias", hue: "param" },
      { phrase: "the randomness is not a nuisance, it is the mechanism", hue: "param" },
    ],
  },
  {
    sectionId: "more-is-safe",
    frame: { nTrees: 60 },
    terms: [
      { phrase: "never the systematic U", hue: "truth" },
      { phrase: "a free, safe knob", hue: "param" },
    ],
  },
];
