import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: a sigmoid-squashed linear score, fit by minimising the log-loss —
 * whose gradient is the same residual×feature form as ordinary least squares, which
 * is why the same gradient descent works. σ tinted prediction, the loss error-red,
 * the residual (p−y) param-purple.
 */
export const logisticRegressionMath: MathDrawerContent = {
  nodeId: "logistic-regression",
  invitation:
    "Three lines: the model is a squashed linear score, the loss punishes confident mistakes, and its gradient is the very same residual×feature form you already met in least squares.",
  sections: [
    {
      id: "the-model",
      heading: "A squashed linear score",
      blocks: [
        {
          kind: "equation",
          lines: [
            "z = b + w₁x₁ + w₂x₂",
            "P(y = 1 | x) = σ(z) = 1 / (1 + e^−z)",
          ],
          caption: "The linear score z runs over all reals; the sigmoid σ squashes it into a probability in (0, 1).",
          highlights: [{ text: "σ(z)", hue: "prediction" }],
        },
      ],
    },
    {
      id: "the-loss",
      heading: "A loss that punishes confident mistakes",
      blocks: [
        {
          kind: "equation",
          lines: ["log-loss:  L = −(1/n) Σ [ y·log p + (1−y)·log(1−p) ]"],
          caption: "Cross-entropy. A confident wrong prediction (p→0 when y=1) drives log p → −∞, so the penalty is unbounded — exactly the mistake you most want to avoid.",
          highlights: [{ text: "log-loss", hue: "error" }],
        },
        {
          kind: "prose",
          text: "Why not just minimise the error rate? Accuracy is flat and full of ties — it can't tell a barely-right answer from a confidently-right one, so it hands gradient descent a surface with no slope to follow. The log-loss is smooth and rewards calibrated confidence.",
          highlights: [{ text: "log-loss", hue: "error" }],
        },
      ],
    },
    {
      id: "the-gradient",
      heading: "The same gradient as least squares",
      blocks: [
        {
          kind: "equation",
          lines: ["∂L/∂wⱼ = (1/n) Σ (p − y)·xⱼ"],
          caption: "Prediction minus target, times the feature — averaged over the data.",
          highlights: [{ text: "(p − y)", hue: "param" }],
        },
        {
          kind: "prose",
          text: "This is the quiet elegance of logistic regression: its gradient has the identical residual×feature shape as ordinary least squares — only the prediction p is now σ(z) instead of the raw line. So the very same gradient descent from the regression cluster trains it, swinging the boundary downhill on the log-loss until (p − y) averages out.",
          highlights: [
            { text: "(p − y)", hue: "param" },
            { text: "σ(z)", hue: "prediction" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: ["the-gradient"],
};
