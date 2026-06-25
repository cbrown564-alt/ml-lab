import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Overfitting & regularization: a too-flexible model memorizes noise, and instead
 * of cutting its capacity you penalize it — push its weights toward zero until the
 * wiggle relaxes onto the smooth truth. The bias regularization buys, and the L2/L1
 * flavors, arrive in Run it. Companion to bias–variance (the other lever).
 */
export const overfittingRegularizationNarrative: ExhibitNarrative = {
  nodeId: "overfitting-regularization",
  hook: [
    "Next door we tamed overfitting by making the model simpler — fewer degrees, less rope to hang itself with. But often you can't, or don't want to, throw away capacity: the right features might need a flexible model, and most of it behaves. Regularization is the gentler lever. Keep the over-powered model; just make it pay for complexity.",
    "Here is a degree-12 polynomial — wildly too flexible for sixteen points — overfitting badly. Watch what one penalty does to it, without ever touching its degree.",
  ],
  story: [
    {
      id: "the-overfit",
      heading: "An over-powered model, memorizing",
      paragraphs: [
        "With no penalty, the degree-12 curve does what it often does with too few points: it tracks the training points closely and reaches near-zero training error, lunging between them, its weights swinging to huge positive and negative values to manufacture the wiggles. Training error is near zero; the held-out points it ignores entirely. The capacity is real, and right now it's all being spent on noise.",
      ],
    },
    {
      id: "the-penalty",
      heading: "Make complexity pay",
      paragraphs: [
        "Regularization adds one term to the objective: a penalty on the size of the weights, λ·Σwⱼ². Now the fit has to balance two pressures — match the data, and keep the weights small — and λ sets the exchange rate. Turn it up and the only weights worth keeping are the ones that earn their cost. The giant coefficients that drew the wiggles can't justify themselves, so they shrink, and the curve relaxes onto the smooth shape the data actually supports. Same degree, gentler model — the same parameterization with reduced effective flexibility.",
      ],
    },
    {
      id: "the-sweet-spot",
      heading: "Just enough, then too much",
      paragraphs: [
        "There's a best λ, and it's another U. Too little and you've barely touched the overfit. Too much and the penalty dominates the data — the weights are crushed toward zero, the curve goes limp, and you've underfit just as badly as a straight line. Validation error is often lowest in between, where the penalty has bought generalization without strangling the signal.",
      ],
    },
    {
      id: "two-flavours",
      heading: "Ridge, lasso, and the bias they add",
      paragraphs: [
        "Penalizing the squared weights (L2, ridge) shrinks them all smoothly; penalizing their absolute size (L1, lasso) can drive some coefficients to zero, which can act as feature selection — though with correlated features, which ones shrink to zero is not always obvious. Either way you've deliberately added bias — the fit no longer chases the data as hard — in exchange for less variance. It's the bias–variance tradeoff again, reached by a different door: not less capacity, but capacity held on a leash.",
      ],
    },
  ],
  fieldNotes: [
    "Regularization is why scaling matters here too: ridge penalizes every weight equally, so a feature on a huge scale gets an unfairly tiny weight to start with and is barely penalized. Standardize first, or the penalty is applied to the wrong things.",
    "Weight decay in neural networks corresponds closely to L2 regularization under common SGD setups; the equivalence is not universal across optimizers. Dropout and early stopping are other regularization methods, and the `alpha`/`C`/`lambda` knob is one of the first hyperparameters anyone tunes.",
  ],
};
