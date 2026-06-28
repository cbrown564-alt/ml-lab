import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: boosting is gradient descent in function space. The model is an additive
 * sum of shrunken trees; each new tree is fit to the negative gradient of the log-loss
 * (the residual y − p); the learning rate is the step size. The same descent from the
 * regression cluster — only the thing being optimized is the prediction function itself.
 * Residual/gradient error-red, the step size η param-purple, the running model prediction.
 */
export const gradientBoostingMath: MathDrawerContent = {
  nodeId: "gradient-boosting",
  invitation:
    "One idea, borrowed from the regression cluster: boosting is gradient descent, run on the prediction itself. Each tree is a step against the gradient of the loss; the learning rate is the step size; and 'too many steps' overfits for the same reason it always does.",
  sections: [
    {
      id: "the-additive-model",
      heading: "A sum of shrunken trees",
      blocks: [
        {
          kind: "equation",
          lines: [
            "F_M(x) = F₀ + η·h₁(x) + η·h₂(x) + … + η·h_M(x)",
            "P(y = 1 | x) = σ( F_M(x) )",
          ],
          caption:
            "Start at the base log-odds F₀, then add M shallow trees, each scaled by the learning rate η. The squashed sum is the predicted probability — the same sigmoid as logistic regression, over a richer score.",
          highlights: [
            { text: "F_M(x)", hue: "prediction" },
            { text: "η", hue: "param" },
          ],
        },
      ],
    },
    {
      id: "the-gradient-step",
      heading: "Each tree is a gradient step",
      blocks: [
        {
          kind: "equation",
          lines: [
            "rᵢ = yᵢ − pᵢ = −∂L/∂F   (the negative gradient of the log-loss)",
            "fit hₘ to r,   then   F ← F + η·hₘ",
          ],
          caption:
            "The residual y − p is not a heuristic — it is exactly the negative gradient of the log-loss with respect to the score. Fitting a tree to it and stepping by η is one iteration of gradient descent, with the prediction function in the role of the parameter.",
          highlights: [
            { text: "rᵢ = yᵢ − pᵢ", hue: "error" },
            { text: "−∂L/∂F", hue: "error" },
            { text: "η", hue: "param" },
          ],
        },
        {
          kind: "prose",
          text: "This is why a handful of rounds already beats a single deep tree: the forest spent its trees cancelling variance, but every boosting tree marches the score straight downhill on the loss, cutting bias with each targeted step.",
          highlights: [{ text: "downhill on the loss", hue: "prediction" }],
        },
      ],
    },
    {
      id: "the-controls",
      heading: "Where descent overshoots",
      blocks: [
        {
          kind: "prose",
          text: "Gradient descent doesn't stop on its own. Keep stepping and the training loss runs to zero — the additive model fits every point, noise included — while the held-out loss bottoms out and then climbs. That U is overfitting: the round count is a complexity dial you can overshoot, the way depth was for one tree, and unlike the safe tree-count of a forest.",
          highlights: [{ text: "the round count", hue: "param" }],
        },
        {
          kind: "prose",
          text: "Three controls keep it on the signal. A smaller learning rate η takes more cautious steps (so more rounds fit before overshooting); early stopping quits at the held-out loss's minimum; and shallow trees keep each step too weak to overfit alone. Small η, many rounds, early stopping — the recipe behind every winning boosting model.",
          highlights: [
            { text: "learning rate η", hue: "param" },
            { text: "early stopping", hue: "param" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: ["the-gradient"],
};
