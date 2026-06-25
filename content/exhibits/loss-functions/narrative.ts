import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Loss functions: the loss is the judge, and the judge decides the verdict.
 * The arc moves from "a model needs a number to shrink" → the three penalty
 * shapes → how squared error lets a few far points rule → how robust judges hold
 * the bulk → how to choose. Concrete throughout; the maths arrives in Run it.
 */
export const lossFunctionsNarrative: ExhibitNarrative = {
  nodeId: "loss-functions",
  hook: [
    "A model fits by shrinking one number: a score of how wrong it currently is. But “wrong” is a choice, not a fact. Miss a house price by $10k — is that ten times as bad as missing by $1k, or a hundred times? Your answer is a loss function, and it quietly decides what your model will sacrifice to look good.",
    "Here is one cloud of points and three different judges scoring the same misses. Watch the line they each declare “best” — and notice it is the judge, not the data, that moves it.",
  ],
  story: [
    {
      id: "penalty-shapes",
      heading: "Three ways to score a miss",
      paragraphs: [
        "Every loss takes a residual — how far a point sits from the line — and turns it into a penalty. Squared error charges the square of the miss: a point twice as far off pays four times as much. Absolute error grows linearly with the size of the miss. Huber is a diplomat — squared for the small misses it treats as honest noise, then linear once a miss is large enough to look like an outlier.",
        "Look at the tails. Squared error's curve rockets upward; the others rise in a straight line. That single difference in shape is the whole story of how each judge behaves when something extreme is on the table.",
      ],
    },
    {
      id: "the-vote",
      heading: "Squared error lets the loud ones rule",
      paragraphs: [
        "Because squared error punishes a big miss so ferociously, the line will do almost anything to avoid one. A handful of rogue points up the right edge, each paying a giant squared penalty, can outvote the dozens of honest points below — and the squared-error line tilts up off the trend to appease them. It is not broken; it is doing exactly what you asked, minimising the square.",
      ],
    },
    {
      id: "robust-judges",
      heading: "The robust judges hold the line",
      paragraphs: [
        "Switch the judge to absolute error or Huber and the same rogue points lose their outsized power. Out in the tail their penalty grows only one-for-one, so a far point's influence grows linearly rather than quadratically. The line settles back onto the trend the bulk of the data actually supports. Same points, same misses — a less outlier-sensitive loss, a fit closer to the main trend.",
      ],
    },
    {
      id: "choosing",
      heading: "So which judge?",
      paragraphs: [
        "It depends on what your outliers are. If the extremes are noise — a fat-fingered entry, a sensor glitch — a robust loss protects you. If the extremes are the signal — the fraud, the rare failure you exist to catch — emphasizing large errors may be appropriate when their cost is genuinely disproportionate. Huber is the common compromise: trust small misses, distrust large ones, and set the crossover where “large” begins.",
      ],
    },
  ],
  fieldNotes: [
    "Mean-squared error is the default in almost every regression library because it is smooth, has a convenient statistical interpretation under Gaussian noise, and gives a closed-form solution for ordinary least-squares regression — not because it is always the right judge. Reaching for a robust loss is one of the first moves a practitioner makes when a fit looks hostage to a few points.",
    "The same idea reappears everywhere a model is trained: cross-entropy for classifiers, pinball loss for quantiles, the Huber-like clipping inside reinforcement learning. Choosing the loss is choosing what the model is allowed to ignore.",
  ],
};
