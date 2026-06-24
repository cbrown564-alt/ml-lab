import type { MathDrawerContent } from "@/lib/narrative/math";

export const linearRegressionMath: MathDrawerContent = {
  nodeId: "linear-regression",
  invitation:
    "You've felt the line snap to its optimum a hundred times by now. Here is the formula it snaps to — and the two-line argument for where that formula comes from.",
  sections: [
    {
      id: "the-loss-written-down",
      heading: "The loss, written down",
      blocks: [
        {
          kind: "prose",
          text: "The experiment scored every candidate line with mean squared error. As a function of slope w and intercept b, over n points:",
          highlights: [{ text: "mean squared error", hue: "error" }],
        },
        {
          kind: "equation",
          lines: ["L(w, b) = (1/n) · Σᵢ (w·xᵢ + b − yᵢ)²"],
          caption:
            "Each term is one penalty square from the error view — a residual, squared.",
          highlights: [
            { text: "(w·xᵢ + b − yᵢ)", hue: "error" },
            { text: "residual", hue: "error" },
          ],
        },
        {
          kind: "widget",
          widget: "penalty",
          config: { maxResidual: 8, defaultResidual: 2 },
        },
        {
          kind: "prose",
          text: "This is the exact quantity the MSE readout reports, computed by the same code our tests verify against scikit-learn. Nothing here is a different model from the one your hands trained.",
        },
      ],
    },
    {
      id: "where-the-gradient-vanishes",
      heading: "Where the gradient vanishes",
      blocks: [
        {
          kind: "prose",
          text: "As a function of w and b, L is a smooth upward-curving bowl — quadratic in both parameters. A bowl has exactly one bottom, and at the bottom the surface is flat: both partial derivatives are zero.",
        },
        {
          kind: "equation",
          lines: ["∂L/∂w = 0", "∂L/∂b = 0"],
          caption: "Two linear equations in two unknowns — solvable by hand.",
        },
        {
          kind: "prose",
          text: "Solving them gives the closed form, with x̄ and ȳ the means of the data:",
        },
        {
          kind: "equation",
          lines: [
            "w* = Σᵢ (xᵢ − x̄)(yᵢ − ȳ) / Σᵢ (xᵢ − x̄)²",
            "b* = ȳ − w*·x̄",
          ],
          highlights: [
            { text: "w*", hue: "prediction" },
            { text: "b*", hue: "prediction" },
          ],
        },
        {
          kind: "prose",
          text: "Read w* aloud: how x and y vary together, over how much x varies on its own. When you drag a point and the line snaps, this expression is being evaluated — no search, no iteration, the optimum in one stroke. One honest edge case: if every point shares the same x, the denominator is zero; the lab's implementation then returns the flat line through ȳ — the least wrong answer on offer.",
          highlights: [{ text: "w*", hue: "prediction" }],
        },
        {
          kind: "prose",
          text: "Most models you'll meet after this one offer no such stroke — set their derivatives to zero and you get equations nobody can solve directly. Then the gradient stops being a condition you solve and becomes a compass you follow, one step at a time. That is the Gradient Descent exhibit, and it starts where this section ends.",
        },
      ],
    },
  ],
  mathNodeIds: ["the-gradient"],
};
