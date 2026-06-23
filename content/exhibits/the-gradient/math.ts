import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: the gradient is the vector of partials; the directional derivative
 * ∇f·u is maximised along it (steepest ascent, by Cauchy–Schwarz); it's perpendicular
 * to the level set because the height is constant along a contour. ∇f tinted
 * prediction, its length truth, the descent step param.
 */
export const theGradientMath: MathDrawerContent = {
  nodeId: "the-gradient",
  invitation:
    "Three short steps turn “the arrow points uphill” into a fact: the gradient is the vector of partials, the directional slope is a dot product with it, and that dot product is biggest when you point along it.",
  sections: [
    {
      id: "the-vector",
      heading: "The vector of partials",
      blocks: [
        {
          kind: "equation",
          lines: ["∇f = (∂f/∂x, ∂f/∂y)"],
          caption: "Each component is an ordinary derivative — the slope along one axis, the others held fixed.",
          highlights: [{ text: "∇f", hue: "prediction" }],
        },
      ],
    },
    {
      id: "steepest",
      heading: "Why it's the steepest direction",
      blocks: [
        {
          kind: "equation",
          lines: [
            "slope in a unit direction u:   D_u f = ∇f · u",
            "∇f · u  ≤  |∇f|        (equality when u points along ∇f)",
          ],
          caption: "The directional derivative is the dot product with the gradient; Cauchy–Schwarz caps it at |∇f|, hit exactly when you step along the gradient.",
          highlights: [
            { text: "∇f · u", hue: "prediction" },
            { text: "|∇f|", hue: "truth" },
          ],
        },
        {
          kind: "prose",
          text: "So the gradient direction is the steepest ascent, and its length |∇f| is that steepest slope. Along a contour the height is constant, so the directional derivative there is zero — meaning ∇f · (the contour's tangent) = 0, which is exactly the statement that ∇f is perpendicular to the contour.",
          highlights: [{ text: "|∇f|", hue: "truth" }],
        },
      ],
    },
    {
      id: "descent",
      heading: "Which is why descent subtracts it",
      blocks: [
        {
          kind: "equation",
          lines: ["gradient descent:   x ← x − η ∇f"],
          caption: "Steepest ascent is +∇f, so steepest descent is −∇f; the learning rate η sets how far to step.",
          highlights: [{ text: "− η ∇f", hue: "param" }],
        },
        {
          kind: "prose",
          text: "Everything generalises untouched to a million dimensions: ∇f is still one vector with one component per variable, still points steepest uphill, still vanishes at an optimum. Computing it efficiently for a deep network is what backpropagation does.",
          highlights: [{ text: "∇f", hue: "prediction" }],
        },
      ],
    },
  ],
  mathNodeIds: ["gradient-descent"],
};
