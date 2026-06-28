import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Gradient boosting as the forest's near-opposite, and as gradient descent in disguise.
 * Where bagging averages independent trees to cut variance, boosting grows shallow trees
 * in sequence, each fit to the residual the ensemble still gets wrong — the negative
 * gradient of the log-loss. The twist the hands discover: this descent is so effective it
 * can overshoot, driving training loss to zero while held-out loss turns back up. The
 * maths (the additive model, the gradient step) arrives in Run it.
 */
export const gradientBoostingNarrative: ExhibitNarrative = {
  nodeId: "gradient-boosting",
  hook: [
    "A random forest grew hundreds of trees independently and averaged them — and adding more trees was always safe. Here is a different way to build a forest, and almost everything about it is reversed.",
    "Gradient boosting grows shallow trees in sequence, not in parallel. Each new tree looks at the mistakes the ensemble has made so far and is trained to fix exactly those. The trees aren't independent voters; they're a relay team, each handing its leftover errors to the next. It is often the most accurate thing you can run on tabular data — and, unlike the forest, it can overshoot.",
  ],
  story: [
    {
      id: "the-residual",
      heading: "Learn from the leftovers",
      paragraphs: [
        "Start with the dumbest model: predict the base rate everywhere. It is wrong by some amount at every point — those gaps are the residuals. Now fit a small tree not to the labels, but to those residuals: where is the current model too low, where too high? Add a shrunken slice of that tree to the prediction, and the residuals shrink.",
        "Repeat. Each round, recompute what is still wrong and fit a new shallow tree to it. The ensemble is a running sum — base rate, plus a little of tree one, plus a little of tree two — and each term chips away at the error the earlier terms left behind. Shallow trees, stumps almost, but dozens of them, each one aimed.",
      ],
    },
    {
      id: "gradient-descent-in-disguise",
      heading: "It's gradient descent",
      paragraphs: [
        "This is not a metaphor: boosting is gradient descent, run in the space of functions. The residual y − p is exactly the negative gradient of the log-loss with respect to the prediction. Each tree is a step in the direction that most reduces the loss, and the learning rate is the step size — the same dial from the regression cluster. You already know this engine; boosting just lets the model itself be the thing you descend on.",
        "So the loss falls round by round, the way it rolled downhill before. A few rounds already beat a single deep tree: where the forest needed a crowd to cancel variance, boosting cuts bias directly, repairing the model's systematic mistakes one targeted tree at a time.",
      ],
    },
    {
      id: "the-overshoot",
      heading: "Descending past the signal",
      paragraphs: [
        "But descent does not know when to stop. Keep boosting and the training loss marches toward zero — the ensemble eventually fits every point, the noise included. The held-out loss tells the real story: it falls at first, bottoms out, and then climbs again, as the later trees chase flukes that aren't in new data. The number of rounds is a dial you can overshoot, exactly like a single tree's depth — and exactly unlike a forest's tree count.",
        "Watch the two loss curves split: training sinking toward zero, held-out turning back up. The gap between them is overfitting, the same wall as everywhere — only here you walked into it by taking one good step too many.",
      ],
    },
    {
      id: "the-controls",
      heading: "Two knobs, used gently",
      paragraphs: [
        "So boosting is governed, not unleashed. Take smaller steps — a lower learning rate — and each tree corrects more cautiously, so you can add many trees before overshooting; a small rate with many rounds is the standard recipe. And stop early: watch the held-out loss and quit when it bottoms, before the climb. The trees are kept shallow on purpose, so no single step can overfit on its own.",
        "Tuned this way — small steps, early stopping, shallow trees — gradient boosting is the model that wins competitions and powers a great deal of production ranking and risk scoring. Power, and the discipline to aim it: that is the whole node.",
      ],
    },
  ],
  fieldNotes: [
    "Forest or boosting? A random forest is the safer default — hard to misconfigure, parallel, and more trees never hurt. Boosting usually wins on accuracy but demands tuning (learning rate, rounds, depth) and early stopping. The rule of thumb: reach for a forest first, reach for boosting when the last few points of accuracy are worth the care.",
    "The library names you'll meet — XGBoost, LightGBM, CatBoost — are all gradient boosting with engineering wrapped around this exact loop: clever split-finding, regularised leaves, and built-in early stopping. The idea you just built is the whole idea; they make it fast and safe at scale.",
  ],
};
