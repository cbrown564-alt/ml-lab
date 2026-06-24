import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: three objectives over the same residual r = yᵢ − ŷᵢ, and why
 * their *slopes* (how the penalty grows) decide who rules the fit. Symbols are
 * tinted to the canvas grammar — the squared miss in error-red, Huber's δ in the
 * prediction hue. The penalty widget makes r → r² a thing the reader can drag.
 */
export const lossFunctionsMath: MathDrawerContent = {
  nodeId: "loss-functions",
  invitation:
    "Each judge is one line of algebra. The behaviour you watched — squared error chasing outliers, the others holding — falls out of how each penalty grows with the miss.",
  sections: [
    {
      id: "the-objectives",
      heading: "Three objectives, one residual",
      blocks: [
        {
          kind: "equation",
          lines: [
            "L_squared  = (1/n) Σᵢ (yᵢ − ŷᵢ)²",
            "L_absolute = (1/n) Σᵢ |yᵢ − ŷᵢ|",
            "L_Huber    = (1/n) Σᵢ Hδ(yᵢ − ŷᵢ),   Hδ(r) = ½r² if |r| ≤ δ, else δ(|r| − ½δ)",
          ],
          caption: "Same miss r = yᵢ − ŷᵢ; three ways to charge for it.",
          highlights: [
            { text: "(yᵢ − ŷᵢ)²", hue: "error" },
            { text: "|yᵢ − ŷᵢ|", hue: "param" },
            { text: "δ", hue: "prediction" },
          ],
        },
      ],
    },
    {
      id: "why-squared-chases",
      heading: "Why squared error chases the far points",
      blocks: [
        {
          kind: "prose",
          text: "Differentiate and the reason is plain: the squared penalty's slope is 2r, growing without bound, so a point pulls on the fit in proportion to how far off it is. Drag the miss and watch the penalty area r² quadruple when the miss doubles — that is the leverage a single outlier wields.",
          highlights: [
            { text: "2r", hue: "error" },
            { text: "r²", hue: "error" },
          ],
        },
        { kind: "widget", widget: "penalty", config: { maxResidual: 6, defaultResidual: 2 } },
      ],
    },
    {
      id: "why-robust-hold",
      heading: "Why the robust judges hold",
      blocks: [
        {
          kind: "prose",
          text: "Absolute error has slope ±1 everywhere; Huber's slope flattens to ±δ once a miss passes the crossover. Out in the tail their pull is constant — one far point is one vote, not a veto. That bounded influence is exactly what “robust” means, and the price is a kink at zero where the slope jumps (so there's no neat closed form — we fit by reweighting instead).",
          highlights: [
            { text: "±1", hue: "param" },
            { text: "±δ", hue: "prediction" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: ["the-gradient"],
};
