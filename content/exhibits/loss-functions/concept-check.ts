import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Loss-functions concept check. The misconceptions: that the loss is a passive
 * scorer rather than the thing being optimised, that "robust" is free, and that the
 * three judges always disagree.
 */
export const lossFunctionsCheck: ConceptCheck = {
  nodeId: "loss-functions",
  items: [
    {
      id: "why-mse-chases",
      kind: "choice",
      prompt:
        "Three outliers pulled the squared-error line off the trend. Why does squared error react so strongly to them?",
      options: [
        {
          label: "It penalises each miss by its square, so a far point's penalty dwarfs many near ones'",
          correct: true,
          feedback:
            "Exactly — a miss twice as large costs four times as much, so a few distant points dominate the total and the line moves to appease them.",
        },
        {
          label: "It counts how many points are missed, and the outliers add to the count",
          feedback:
            "It's not a count — it sums the squared distances. One point 10 away contributes 100; ten points 1 away contribute 10 total. Size, squared, is what dominates.",
        },
        {
          label: "Outliers change the slope of the data, so any loss would follow them",
          feedback:
            "Absolute error and Huber barely move on the same points — so it isn't the data forcing it, it's how squared error weights the misses.",
        },
      ],
      difficulty: 2,
      targets: ["loss:mse-sensitivity"],
    },
    {
      id: "huber-shape",
      kind: "choice",
      prompt: "Huber loss is the usual compromise. What shape gives it the best of both?",
      options: [
        {
          label: "Quadratic near zero, linear in the tails — smooth to optimise, robust to outliers",
          correct: true,
          feedback:
            "Right. Near the fit it behaves like squared error (curved, easy to settle into); past a threshold it switches to absolute-style linear growth, so far points can't dominate.",
        },
        {
          label: "Linear near zero, quadratic in the tails — gentle up close, strict far out",
          feedback:
            "That's backwards, and it would be the worst of both: a kink at zero (hard to optimise) and exploding penalties for outliers (not robust). Huber is the other way round.",
        },
        {
          label: "Flat near zero, then a constant penalty — it just caps each miss",
          feedback:
            "A hard cap throws away gradient information entirely. Huber keeps a useful slope everywhere; it only softens from quadratic to linear past the threshold.",
        },
      ],
      difficulty: 2,
      targets: ["loss:huber"],
    },
    {
      id: "judges-agree",
      kind: "predict",
      setup:
        "Switch the bench to clean, honest data — no rogue points — and look at all three lines.",
      prompt: "On clean data, the squared, absolute, and Huber lines will be…",
      options: [
        {
          label: "Nearly identical — the choice of loss barely matters here",
          correct: true,
          feedback:
            "Right. With no extremes to argue over, all three judges read the same trend. The choice of loss only bites when something far off is at stake.",
        },
        {
          label: "Still far apart — the three losses always give different lines",
          feedback:
            "They only diverge when outliers pull squared error away. Remove the rogues and the disagreement nearly vanishes.",
        },
        {
          label: "Absolute and Huber agree, but squared error is always different",
          feedback:
            "Not on clean data — there squared error matches the other two. It's outliers, not the loss alone, that split them apart.",
        },
      ],
      verify: "Load the clean dataset and compare the three lines — they nearly coincide.",
      difficulty: 1,
      targets: ["loss:agreement"],
    },
    {
      id: "break-mse",
      kind: "experiment-task",
      prompt:
        "Break it on purpose: on honest data, drop in the rogue points while judging with squared error, and watch the line lurch off the trend.",
      taskEvent: "loss-functions:outliers-broke-mse",
      feedback:
        "You've seen the most common reason a regression's predictions go quietly wrong — a few extreme points hijacking a squared loss. Now you know its face, and the two-judge fix.",
      difficulty: 1,
      targets: ["loss:break-mse"],
    },
    {
      id: "transfer-robust",
      kind: "transfer",
      scenario:
        "A teammate's house-price model has a great average error overall, but it's wildly off on a handful of mansions — and those big misses are dragging the reported error up and skewing the fit toward them. They trained with mean squared error.",
      prompt: "From what the judges taught you, what's the most likely fix, and the one thing to check first?",
      options: [
        {
          label:
            "Switch to Huber (or absolute) loss so the few mansions stop dominating — after confirming they're genuine outliers, not a segment you must predict well",
          correct: true,
          feedback:
            "That's the transfer: squared error let the extremes hijack the fit; a robust loss reins them in. But first check the boundary — if mansions are a real segment, ignoring them is the wrong move.",
        },
        {
          label: "Train even longer with squared error so the model finally learns the mansions too",
          feedback:
            "More training won't help — squared error is doing exactly what it's designed to do, weighting those big misses heavily. The loss is the lever, not the training time.",
        },
        {
          label: "Drop the mansions from the data so the average error looks better",
          feedback:
            "Deleting inconvenient data is metric-gaming, not a fix — and if mansions matter, you've made the model blind to them. A robust loss down-weights them without discarding them.",
        },
      ],
      difficulty: 3,
      targets: ["loss:transfer-robust"],
    },
  ],
};
