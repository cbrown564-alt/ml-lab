import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Feature scaling told through the loss surface: a model that ignores units walks
 * a long, thin, tilted valley and crawls; standardising the input rounds the bowl
 * and the same walk finishes in a few confident steps. Concrete throughout; the
 * conditioning maths arrives in Run it.
 */
export const featureScalingNarrative: ExhibitNarrative = {
  nodeId: "feature-scaling",
  hook: [
    "Two features — age in years, income in dollars — and the model treats a one-dollar change as the same size as a one-year change, because to gradient descent a number is just a number. The result isn't a wrong answer; it's a model that takes thousands of steps to find an answer it should have reached in ten.",
    "Here is that slowness made visible. The same data, the same line being learned — but watch the surface the descent has to cross, and what one small change to the input does to it.",
  ],
  story: [
    {
      id: "the-bowl",
      heading: "A long, thin valley",
      paragraphs: [
        "Every spot on this map is a candidate line; the shading is how wrong it is, and descent is trying to roll to the floor. On raw, uncentred units the bowl isn't a bowl at all — it's a long, thin, tilted trough. The loss drops steeply if you change the intercept but barely moves if you change the slope, so the surface is steep one way and nearly flat the other.",
        "That mismatch in steepness has a name — the condition number — and it is the whole problem. A step big enough to make progress along the flat direction sends you flying up the steep walls.",
      ],
    },
    {
      id: "the-crawl",
      heading: "So the walk zig-zags",
      paragraphs: [
        "Caught between a steep wall and a flat floor, descent compromises: it takes a step so tiny it can't overshoot the walls, which means it barely moves along the valley. So it zig-zags — bouncing between the walls, inching toward the floor — and burns a hundred steps to cover ground a round bowl would cross in a handful. Nothing is broken. The surface is just cruel to walk.",
      ],
    },
    {
      id: "standardise",
      heading: "Round the bowl",
      paragraphs: [
        "Now standardise the input — subtract its mean, divide by its spread, so it has mean zero and unit variance. The data hasn't changed; their description has. And the trough becomes a bowl: steepness equal in every direction, condition number near one. The biggest safe step jumps an order of magnitude, the zig-zag straightens out, and the walk is over in a few strides.",
      ],
    },
    {
      id: "everywhere",
      heading: "Why it shows up everywhere",
      paragraphs: [
        "Anything that compares features by magnitude inherits this: gradient descent's conditioning, the distances behind k-nearest-neighbours and k-means, the penalty in ridge and lasso that shrinks big-unit weights less. Standardising (or min-max scaling) is the cheap first move that makes all of them behave — and one of the few preprocessing steps you do almost without thinking.",
      ],
    },
  ],
  fieldNotes: [
    "Tree-based models — decision trees, random forests, gradient boosting — split one feature at a time and never compare magnitudes, so they're immune: scaling buys them nothing. Knowing which models care is half of knowing when to bother.",
    "Fit the scaler on the training data only, then apply it to validation and test. Scaling on the whole dataset first quietly leaks the test set's distribution into training — the next exhibit's failure mode.",
  ],
};
