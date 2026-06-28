import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Random forests as the cure for the single tree's high variance — picking up exactly
 * where decision-trees ended (resample the data, the tree changes its mind). The forest
 * embraces that disagreement: many decorrelated trees, averaged, whose independent errors
 * cancel. The surprise the hands discover: adding trees, unlike adding depth, can never
 * overfit. The maths (variance ~ 1/B, decorrelation) arrives in Run it.
 */
export const randomForestsNarrative: ExhibitNarrative = {
  nodeId: "random-forests",
  hook: [
    "You ended the last node watching a single tree change its mind — resample the data and its cuts jumped, the whole boundary lurching, even as its accuracy held. That instability looked like a flaw to fix. What if it's the raw material?",
    "A random forest embraces the disagreement. Grow not one tree but hundreds, each on its own random resample of the data and free to ask different questions, then let them vote. Any one tree is still jagged and overfit — but their mistakes point in different directions, so the average cancels the noise and keeps the signal. The wisdom of a crowd of weak, disagreeing experts.",
  ],
  story: [
    {
      id: "a-crowd",
      heading: "Many trees, each different",
      paragraphs: [
        "Start the crowd. Each tree gets its own bootstrap sample — the same size as the data, drawn with replacement — so every tree sees a slightly different slice. And at each split a tree may only choose from a random subset of the features, so even on identical data they would carve differently. Two sources of disagreement, on purpose.",
        "On its own, any one of these trees is a poor model: grown deep, it overfits its particular resample, its boundary a private jagged staircase. You would never ship one. The trick is not to ship one.",
      ],
    },
    {
      id: "the-vote",
      heading: "Average the votes",
      paragraphs: [
        "Now average. For any point, ask every tree its probability of class 1 and take the mean. Where the trees agree, the average is confident; where their jagged edges disagree, the mean blurs them into a smooth, gentle transition. A hundred overfit staircases blend into one clean curve.",
        "Watch the boundary as the crowd grows: one tree is jagged, ten are smoother, a hundred is a clean arc that follows the moons better than any single tree could. And the field stops twitching when you resample — because the crowd's average barely moves even though every member jumps.",
      ],
    },
    {
      id: "wisdom-of-crowds",
      heading: "Why averaging works",
      paragraphs: [
        "This is the wisdom of crowds, made precise. Averaging many estimates of the same thing cancels their independent errors — the more estimators, and the less their errors agree, the more noise washes out. That is the whole reason for the bootstrap and the random features: they make the trees disagree, and disagreement is what averaging needs to bite on.",
        "Crucially, averaging shrinks variance, not bias. Each deep tree is low-bias (it can fit any shape) but high-variance (it overfits its sample); the forest keeps the low bias and averages the variance away. Identical trees would average to themselves and gain nothing — the randomness is not a nuisance, it is the mechanism.",
      ],
    },
    {
      id: "more-is-safe",
      heading: "More trees never overfit",
      paragraphs: [
        "Here is the part that surprises anyone who just met overfitting. With a single tree, depth was a dial you could overshoot — too deep, and the held-out score fell. The number of trees is not that kind of dial. Adding trees only makes the average steadier; it cannot make the forest fit the noise harder. The held-out curve climbs and then flattens — never a U.",
        "So you grow as many trees as you can afford and stop when the gain stops paying for the compute. The complexity that can overfit still lives inside each tree — its depth — but the count of trees is a free, safe knob. A single tree's gift and curse were the same thing; the forest keeps the gift and spends a crowd to bury the curse.",
      ],
    },
  ],
  fieldNotes: [
    "Random forests are the workhorse practitioners reach for first on tabular data: strong out of the box, few knobs to botch, and a built-in honesty check — because each tree skips the points its bootstrap left out, those 'out-of-bag' points give a free held-out estimate without a separate validation split.",
    "The price is the tree's best feature: legibility. One shallow tree is a recitable chain of questions; a vote across hundreds is a black box. When a decision must be explained — credit, medicine — that tradeoff, not accuracy, often decides whether a forest is even allowed.",
  ],
};
