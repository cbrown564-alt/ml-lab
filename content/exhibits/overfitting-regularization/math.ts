import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: regularisation adds a penalty on weight size to the objective, so
 * the closed form gains λ on the diagonal — every weight is shrunk. λ and its
 * penalty tinted param-purple (the knob); the bias it buys, error-red.
 */
export const overfittingRegularizationMath: MathDrawerContent = {
  nodeId: "overfitting-regularization",
  invitation:
    "Regularisation is one extra term in the objective — and for ridge it has a closed form that shows exactly how the weights get shrunk.",
  sections: [
    {
      id: "the-objective",
      heading: "Penalise the weights",
      blocks: [
        {
          kind: "equation",
          lines: [
            "minimise:  Σᵢ (yᵢ − ŷᵢ)²  +  λ Σⱼ wⱼ²        (ridge / L2)",
            "ŵ = (XᵀX + λI)⁻¹ Xᵀy     — λ on the diagonal shrinks every weight",
            "L1 / lasso:   …  +  λ Σⱼ |wⱼ|     → drives useless weights to exactly 0",
          ],
          caption: "The data term pulls the fit to the points; the penalty pulls the weights to zero; λ sets the balance.",
          highlights: [
            { text: "λ Σⱼ wⱼ²", hue: "param" },
            { text: "λI", hue: "param" },
            { text: "λ Σⱼ |wⱼ|", hue: "prediction" },
          ],
        },
      ],
    },
    {
      id: "shrinkage",
      heading: "Why λ on the diagonal shrinks",
      blocks: [
        {
          kind: "prose",
          text: "Without a penalty, an over-flexible fit drives its weights to huge opposing values to thread the noise — and XᵀX can be nearly singular, so those weights are barely pinned down. Adding λI lifts the whole diagonal, which both stabilises the inverse and pulls every weight toward zero in proportion to λ. The wiggle, which lived in those giant coefficients, goes with them.",
          highlights: [{ text: "λI", hue: "param" }],
        },
        {
          kind: "prose",
          text: "This is the bias–variance tradeoff again, dialled by λ instead of degree: a small λ leaves variance high (still overfitting), a large λ adds bias (the weights are crushed, the fit underfits), and the best λ is the U's floor. You've kept the model's capacity but put it on a leash.",
          highlights: [
            { text: "bias", hue: "error" },
            { text: "variance", hue: "param" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: [],
};
