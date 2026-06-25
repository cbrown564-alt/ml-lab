import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Regularization concept check. The misconceptions: that more penalty is always
 * safer, that regularization changes the model's degree, and that it's a different
 * idea from bias–variance rather than the same tradeoff reached by another lever.
 */
export const overfittingRegularizationCheck: ConceptCheck = {
  nodeId: "overfitting-regularization",
  items: [
    {
      id: "what-lambda-does",
      kind: "choice",
      prompt: "Raising λ reins in an overfit degree-12 model. What is the penalty actually doing?",
      options: [
        {
          label: "Shrinking the weights toward zero, so the giant coefficients that drew the wiggles can't justify their cost",
          correct: true,
          feedback:
            "Exactly — the penalty makes complexity pay. The huge opposing weights that manufactured the wiggle get pulled down, and the curve relaxes onto the smooth shape, all without changing the degree.",
        },
        {
          label: "Lowering the polynomial degree so the model has less flexibility",
          feedback:
            "The degree never changes — it's still 12. Regularization keeps the same parameterization while reducing effective flexibility, which is what makes it a different lever from reducing the degree.",
        },
        {
          label: "Throwing away the training points that don't fit well",
          feedback:
            "It touches the weights, not the data. Every point stays; the penalty just discourages the extreme coefficients that overfitting relies on.",
        },
      ],
      difficulty: 2,
      targets: ["reg:shrinkage"],
    },
    {
      id: "more-not-safer",
      kind: "choice",
      prompt: "If a moderate penalty helped, why isn't an enormous penalty even safer?",
      options: [
        {
          label: "Past a point it crushes the weights so far the model can't fit the real shape — underfitting",
          correct: true,
          feedback:
            "Right. Too much penalty removes signal along with noise: the curve goes limp, bias takes over, and validation error climbs again. There's a best λ in the middle.",
        },
        {
          label: "An enormous penalty is safer — it just makes the model very simple",
          feedback:
            "Simple to the point of useless. A crushed model underfits as badly as a straight line; validation error climbs right back up. More penalty is not monotonically better.",
        },
        {
          label: "It would be safer, but it makes training too slow to be practical",
          feedback:
            "Speed isn't the issue — correctness is. A huge λ produces a worse model (underfit), not just a slower one to compute.",
        },
      ],
      difficulty: 2,
      targets: ["reg:over-penalise"],
    },
    {
      id: "reg-vs-degree",
      kind: "predict",
      setup: "You've met two levers against overfitting: lowering the degree (bias–variance) and raising λ (here).",
      prompt: "Compared with simply lowering the degree, what does regularization let you do?",
      options: [
        {
          label: "Keep the same feature set and degree while discouraging large coefficients — useful when the right features need a flexible model",
          correct: true,
          feedback:
            "Right. It's the same bias–variance tradeoff reached by a different door: not less capacity, but capacity on a leash — tunable continuously with λ rather than in whole degrees.",
        },
        {
          label: "Avoid the bias–variance tradeoff entirely — regularized models don't overfit",
          feedback:
            "It doesn't escape the tradeoff; it's another way to navigate it. Too little λ overfits, too much underfits — the same U, dialed by λ instead of degree.",
        },
        {
          label: "Always beat a lower-degree model — regularization is strictly better",
          feedback:
            "Neither dominates; they're two levers on the same tradeoff. Often you tune both. Regularization's edge is keeping capacity when you need it, with a continuous dial.",
        },
      ],
      verify: "Conceptually: regularization and degree are two levers on the one bias–variance U.",
      difficulty: 3,
      targets: ["reg:vs-degree"],
    },
    {
      id: "break-overpenalise",
      kind: "experiment-task",
      prompt: "Break it on purpose: crank λ all the way up until the penalty crushes the fit into an underfit.",
      taskEvent: "overfitting-regularization:over-penalised",
      feedback:
        "You've found the far wall — proof that regularization is a dial to tune, not a lever to max out. The best λ lives in the window between the two failures.",
      difficulty: 1,
      targets: ["reg:break"],
    },
    {
      id: "transfer-tune",
      kind: "transfer",
      scenario:
        "A teammate adds L2 regularization to a model that was overfitting, sets the strength to a very large value to be safe, and reports the model is now underperforming on both training and validation data.",
      prompt:
        "From what the dial taught you: what's happening, what should they do, and why might both 'remove it' and 'bigger model' be wrong here? Write it in your own words.",
      open: {
        placeholder:
          "e.g. high error on BOTH train and validation means … an enormous λ causes … so they should …",
        answer:
          "High error on both training and validation is underfitting, and cranking λ to a very large value caused it — too much penalty pulls the model too smooth, the opposite end of the dial from overfitting. The fix is to tune λ to the value that minimizes validation error (the bottom of the U), not to max it out. Removing regularization entirely would likely bring the overfit back in this scenario, and making the model bigger to fight a huge penalty is wasteful — but in a different scenario either change could be justified. Domain knowledge can guide the search, but validation or cross-validation should choose among candidate values.",
      },
      difficulty: 3,
      targets: ["reg:transfer-tune"],
    },
  ],
};
