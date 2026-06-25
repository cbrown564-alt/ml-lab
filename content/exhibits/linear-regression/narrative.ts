import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Linear regression, told as a sequence of beats. Each story section is one
 * beat that re-frames the graphic beside it: the hook meets the line, then
 * residuals, then squares, then the outlier's tyranny, then the closed-form
 * reward (and field notes close the walk). The colour grammar and per-beat
 * framing live in `spine.ts`; the prose lives here so the narration audio has
 * one source (C3).
 */

export const linearRegressionNarrative: ExhibitNarrative = {
  nodeId: "linear-regression",
  hook: [
    "In 1885, Francis Galton plotted the heights of nearly a thousand adult children against their parents' and found something gentle and strange: tall parents had tall children, but a little shorter; short parents had short children, but a little taller. To capture how strongly one number pulls on another, he drew a straight line through the cloud — and stumbled into the most-used statistical tool of the next century.",
    "That line is now in your hands, on the right. Each gold dot is one observed point in this dataset; the blue line is a single claim about all of them at once. Grab a point and drag it — the line answers on the very next frame. The rule that decides where it lands is the rest of this story.",
  ],
  story: [
    {
      id: "the-residuals",
      heading: "How wrong is the line?",
      paragraphs: [
        "“Best” needs a judge, and the judge is error. The dashed drops between the dots and the line are now drawn: each one is a residual — how far the line missed that point, measured straight up and down, because we take x as given and put only the prediction of y on trial.",
        "Drag a point away from the crowd and watch its residual stretch. The line never honours any single point perfectly; it is the one line that keeps all of these misses, taken together, as small as it can.",
      ],
    },
    {
      id: "squared-error",
      heading: "Why the errors get squared",
      paragraphs: [
        "Switch the errors from lines to squares. Each residual becomes a literal square whose area is the penalty the line pays there, and the fit is the line that makes the total area smallest — the mean squared error in the readout.",
        "Squaring does two jobs. It ignores direction: overshooting by three is exactly as bad as undershooting by three. And it punishes large misses out of all proportion — one residual of ten contributes the same squared penalty as one hundred residuals of one: 10² = 100 × 1². That second habit is squared error's whole personality, and the next beat shows its dark side.",
      ],
    },
    {
      id: "the-outlier",
      heading: "The influence of one outlier",
      paragraphs: [
        "Two extreme points have crept into otherwise sensible data. Squared error does not merely notice them — it weights them heavily. The biggest square dwarfs every other penalty on the plot, and to shrink that one square the fitted line shifts toward the high-leverage points.",
        "Try it with your own hand: drag that high point further out and watch the MSE in the readout climb while the line tips away from the main cluster to chase it. One point in thirty, pulling the fit.",
        "This is not a bug. Squared error minimizes the total quadratic penalty, which gives large residuals disproportionate influence. Whether that is what you wanted is a different question — and it is the reason other loss functions exist.",
      ],
    },
    {
      id: "closed-form",
      heading: "What “best” actually buys you",
      paragraphs: [
        "Notice what dragging never does: it never makes the line search. Move a point and the best line is simply there, on the next frame. Choosing squared error bought something rare — the optimal slope and intercept have a closed-form solution, evaluated in a single stroke, with no trial and error at all. Read plainly, the formula beside this beat says the slope is just how much x and y move together, divided by how much x moves on its own.",
        "Most models you meet after this one come with no such formula. Their best parameters must be hunted for, downhill, one step at a time. That hunt is its own exhibit — and this line, the one you can solve outright, is exactly where it begins.",
      ],
    },
  ],
  fieldNotes: [
    "In industry, linear regression is the baseline that fancier models must beat to justify their complexity — and embarrassingly often, they don't beat it by much.",
    "In science and economics, the slope is the headline: “an extra year of schooling is associated with X% higher earnings” is a regression coefficient speaking.",
    "Its failure mode travels too: the outlier sensitivity you just saw is why analysts inspect residual plots before trusting any fitted line.",
  ],
};
