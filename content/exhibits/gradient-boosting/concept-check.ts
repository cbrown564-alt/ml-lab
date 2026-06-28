import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Gradient-boosting concept check. The misconceptions: that boosting is a forest-like
 * ensemble where more trees is safe, that each tree predicts the labels (it fits the
 * residual gradient), and that a smaller learning rate is simply worse. The open transfer
 * applies the forest-vs-boosting distinction to a teammate proposing the forest's fix.
 */
export const gradientBoostingCheck: ConceptCheck = {
  nodeId: "gradient-boosting",
  items: [
    {
      id: "more-rounds-overfit",
      kind: "choice",
      prompt:
        "You're told 'random forests never overfit from adding trees.' Your gradient-boosting model is overfitting, and a colleague suggests it just needs more rounds. Why is that backwards?",
      options: [
        {
          label:
            "Boosting's trees are sequential — each fits the previous ones' residuals — so more rounds keep driving training loss down and eventually fit noise; the held-out loss makes a U, the opposite of a forest's independent averaged trees",
          correct: true,
          feedback:
            "Right. The forest's safety comes from averaging independent trees, which only cancels variance. Boosting is descent: more rounds keep cutting training loss past the point where held-out loss bottoms, so they start fitting noise. More rounds is exactly the wrong move.",
        },
        {
          label: "It isn't backwards — boosting is an ensemble of trees, so like a forest, more trees always help or plateau",
          feedback:
            "The two ensembles are near-opposites. A forest averages independent trees (more is safe); boosting adds dependent trees in sequence, each reducing training loss further, so past the optimum more rounds overfit. The held-out loss turns back up.",
        },
        {
          label: "More rounds would help if the learning rate were higher — the real problem is that the steps are too small",
          feedback:
            "A bigger learning rate would overshoot faster, not fix the overfitting. The issue isn't step size being too small; it's that the model has already taken more good steps than it should, and more rounds only take it further past the held-out minimum.",
        },
      ],
      difficulty: 2,
      targets: ["boost:more-overfit"],
    },
    {
      id: "what-each-tree-fits",
      kind: "choice",
      prompt: "In gradient boosting, what is each new tree actually trained to predict?",
      options: [
        {
          label:
            "The residuals — where the current ensemble is too high or too low, which is the negative gradient of the loss — not the class labels directly",
          correct: true,
          feedback:
            "Exactly. Each tree is fit to y − p, the negative gradient of the log-loss, then added with a small step. That's what makes boosting gradient descent in function space — the tree points the prediction downhill on the loss.",
        },
        {
          label: "The class labels, like every other classifier — the trees just vote the way a forest's do",
          feedback:
            "A forest's trees each predict the label and vote. Boosting's trees predict the leftover error of the ensemble so far, and are summed, not voted. Fitting the residual, not the label, is the whole mechanism.",
        },
        {
          label: "A random subset of the data, the way a forest draws a bootstrap sample for each tree",
          feedback:
            "That's bagging's randomness, not boosting. A boosting tree sees the same data each round; what changes is its target — the current residuals — so each tree corrects the last.",
        },
      ],
      difficulty: 2,
      targets: ["boost:residual"],
    },
    {
      id: "learning-rate",
      kind: "choice",
      prompt:
        "Lowering the learning rate from 0.3 to 0.05 makes a single boosting round barely change the model. Why might that give a BETTER final model?",
      options: [
        {
          label:
            "Smaller steps overshoot less, so you can add many more rounds before the held-out loss turns up — a small rate with many rounds (and early stopping) usually generalizes better than big steps",
          correct: true,
          feedback:
            "Right. Shrinkage is regularization: cautious steps approach the optimum slowly without leaping past it, so the held-out minimum is lower and later. Small learning rate, many rounds, early stopping is the standard winning recipe.",
        },
        {
          label: "It doesn't — a smaller learning rate always means a worse model, since each tree contributes less",
          feedback:
            "Each tree contributes less per round, but you take more rounds. The slower, more careful descent reaches a better held-out minimum than a few big steps that overshoot — less per step, better in total.",
        },
        {
          label: "It makes each tree deeper, so it fits the data better in every round",
          feedback:
            "The learning rate scales a tree's contribution; it has nothing to do with tree depth. Depth is a separate knob. A lower rate means smaller steps, not bigger trees.",
        },
      ],
      difficulty: 3,
      targets: ["boost:lr"],
    },
    {
      id: "overfit-by-rounds",
      kind: "experiment-task",
      prompt:
        "Break it on purpose: drag Boosting rounds well past the held-out loss's low point. Watch the training loss sink toward zero while the held-out loss bottoms out and then climbs back up.",
      taskEvent: "gradient-boosting:overfit-by-rounds",
      feedback:
        "You watched descent overshoot. Boosting kept cutting the training loss until the new trees were fitting noise — the held-out U is overfitting, the same wall as a too-deep tree, reached this time by taking too many good steps.",
      difficulty: 1,
      targets: ["boost:break"],
    },
    {
      id: "transfer-training-accuracy",
      kind: "transfer",
      scenario:
        "A teammate's gradient-boosting churn model reaches 99.6% accuracy on the training data after 800 rounds. They're thrilled — they call it the best model they've built and want to ship it today. They never tracked a validation curve, and they note that the held-out ACCURACY is about the same as their old 40-round model, which they take as further proof it's solid.",
      prompt:
        "Should that 99.6% training accuracy reassure you? What would you check before shipping, and why — specifically for a boosted model? Write it in your own words.",
      open: {
        placeholder:
          "e.g. for boosting, high training accuracy means … the overfit hides in … so I'd check … and roll back to …",
        answer:
          "No — for a boosting model that high training accuracy is a warning, not a triumph. Boosting is gradient descent on the loss, so given enough rounds it drives the TRAINING loss to zero and training accuracy to ~100% by adding trees that fit the training noise — 99.6% after 800 rounds is exactly what an overfit booster looks like, not evidence of quality. The tell is that boosting's overfit hides in the LOSS, not the accuracy: training log-loss collapses while held-out log-loss bottoms early and then climbs, often while held-out ACCURACY barely moves — which is precisely the 'same accuracy as the 40-round model' they're treating as reassurance. So the flat held-out accuracy actually argues that the 760 extra rounds bought nothing but over-confidence. What I'd check: plot the held-out (validation) log-loss across rounds, find where it bottomed, and roll back to that many rounds with early stopping — probably much closer to 40 than 800 — and consider a smaller learning rate. Training accuracy is meaningless here because a booster can always reach 100%; only the held-out loss curve tells you where to stop.",
      },
      difficulty: 3,
      targets: ["boost:transfer"],
    },
  ],
};
