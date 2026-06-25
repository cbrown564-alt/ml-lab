import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * The gradient as the one arrow that captures the local slope of a surface: assemble
 * the partial derivatives into a vector, and it points in the direction of steepest
 * ascent, perpendicular to the contour, with length equal to the slope. Negate it and
 * you have the step gradient descent takes.
 */
export const theGradientNarrative: ExhibitNarrative = {
  nodeId: "the-gradient",
  hook: [
    "Gradient descent's whole job is to go downhill. But on a surface over two variables — or a million — “downhill” isn't obvious: there are infinitely many directions to step from any point, each with its own slope. The gradient is the tool that picks the steepest one — a central tool in optimization.",
    "Here's a landscape over two variables, dark valleys to bright peaks. One arrow, at any point you choose, tells you everything about the slope there.",
  ],
  story: [
    {
      id: "partial-derivatives",
      heading: "Two questions, two slopes",
      paragraphs: [
        "Stand at a point. Ask: if I nudge only x, holding y fixed, how fast does the height change? That's the partial derivative ∂f/∂x — an ordinary one-variable derivative, just with y frozen. Ask the same about y and you get ∂f/∂y. Two numbers, the slope along each axis, measured one at a time.",
      ],
    },
    {
      id: "steepest-ascent",
      heading: "Stack them into one arrow",
      paragraphs: [
        "Now collect those two slopes into a vector: the gradient, ∇f = (∂f/∂x, ∂f/∂y). Here is the remarkable fact that makes it useful — of all the infinitely many directions you could step, this vector points in the one that climbs fastest. Steepest ascent. And its norm is the maximum local rate of increase per unit step: long where the surface is steep, short where it flattens.",
      ],
    },
    {
      id: "perpendicular",
      heading: "Always square to the contour",
      paragraphs: [
        "Watch the arrow against the shading bands — the contours, lines of equal height. At a smooth point where the gradient is nonzero, it crosses the local level curve at a right angle. It has to: along a contour the height doesn't change at all, so the direction of fastest change must be the one that leaves the contour as directly as possible — straight across it. Uphill is perpendicular to “level”.",
      ],
    },
    {
      id: "descent-and-zero",
      heading: "Flip it to go down — and zero at the top",
      paragraphs: [
        "Negate the gradient and it points the other way: −∇f is the direction of steepest descent, and that is precisely the step gradient descent takes, over and over. Drag the point onto a peak, valley, or saddle and the arrow shrinks to nothing: at a stationary point, every first-order directional derivative is zero, and the gradient is the zero vector. That vanishing gradient is what an optimizer is hunting for — a point where first-order information alone gives no descent direction. A local minimum, maximum, or saddle all qualify.",
      ],
    },
  ],
  fieldNotes: [
    "Nothing here needs two dimensions. With a million parameters the gradient is still one vector — one slope per parameter — with the same properties: steepest ascent, perpendicular to the level set, zero at an optimum. Training a neural network is, almost entirely, computing this vector (that's what backpropagation does) and stepping against it.",
    "The gradient is strictly local: it points steepest uphill from where you stand, which need not aim at the global peak. That's why descent curves as it goes, and why a surface with several hills and valleys can trap it at a local optimum — the gradient there is zero, but it isn't the best zero.",
  ],
};
