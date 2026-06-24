import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: the loss surface's curvature is the Hessian, its stretch is the
 * condition number κ, and the stable step is hostage to κ — so standardising,
 * which sends κ → 1, is what frees the step up. κ tinted error-red (the cost),
 * η param-purple (the step).
 */
export const featureScalingMath: MathDrawerContent = {
  nodeId: "feature-scaling",
  invitation:
    "The zig-zag has a number behind it. The bowl's curvature is a 2×2 matrix; its lopsidedness is the condition number; and the largest safe step is its hostage.",
  sections: [
    {
      id: "curvature",
      heading: "The curvature is a matrix",
      blocks: [
        {
          kind: "equation",
          lines: [
            "H = (2/n) · [ Σxᵢ²   Σxᵢ ]",
            "            [ Σxᵢ    n   ]",
            "κ = λ_max / λ_min      (1 = round bowl, large = long thin valley)",
          ],
          caption: "The Hessian of the (slope, intercept) loss, and its condition number κ.",
          highlights: [{ text: "κ", hue: "error" }],
        },
      ],
    },
    {
      id: "standardise-rounds",
      heading: "Standardising sends κ → 1",
      blocks: [
        {
          kind: "prose",
          text: "Centre x and its mean Σxᵢ becomes 0, killing the off-diagonal tilt; scale it to unit variance and Σxᵢ² becomes n, equalising the diagonal. The Hessian collapses to H = 2·I — a perfectly round bowl, κ = 1, the same curvature in every direction.",
          highlights: [{ text: "κ = 1", hue: "error" }],
        },
        {
          kind: "equation",
          lines: ["standardise:  Σxᵢ = 0,  Σxᵢ² = n   ⟹   H = 2·I,   κ = 1"],
          highlights: [{ text: "κ = 1", hue: "error" }],
        },
      ],
    },
    {
      id: "step-hostage",
      heading: "Why the step is hostage to κ",
      blocks: [
        {
          kind: "prose",
          text: "Descent is stable only while the step η stays under 2/λ_max — set by the steepest direction. But progress along the shallow direction goes as η·λ_min. So the number of steps to the floor scales with κ = λ_max/λ_min: a bowl ten times more stretched takes ten times as long. Round the bowl and you raise the ceiling on η and shrink the journey at once.",
          highlights: [
            { text: "η", hue: "param" },
            { text: "κ = λ_max/λ_min", hue: "error" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: ["the-gradient"],
};
