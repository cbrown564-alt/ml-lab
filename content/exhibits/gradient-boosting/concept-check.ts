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
      id: "transfer-forest-logic",
      kind: "transfer",
      scenario:
        "A teammate's gradient-boosting model for predicting customer churn scores beautifully on the training data but disappoints in production. They've read that 'random forests don't overfit — you just add more trees,' and their plan is to add ten times more boosting rounds to make it even stronger.",
      prompt:
        "Will that help? Explain what's going wrong and what you'd actually change — in your own words.",
      open: {
        placeholder:
          "e.g. a forest and boosting differ because … so more rounds would … the real fixes are …",
        answer:
          "No — more rounds will make it worse. The teammate is applying a forest's logic to boosting, and the two are opposites. A random forest averages independent trees, so more trees only cancel variance and never overfit. Boosting grows trees in sequence, each fitting the previous ones' residuals — it is gradient descent on the loss — so more rounds keep driving the TRAINING loss toward zero, and past the point where the held-out loss bottoms out, the new trees fit noise that production data doesn't share. Ten times more rounds pushes it further down the overfitting U. The real fixes are the boosting controls: lower the learning rate so each step is more cautious (then you can afford more rounds), use early stopping — track a validation loss and stop at its minimum, which is likely far FEWER rounds than they have now — and keep the trees shallow. And if the churn data is noisy, a random forest may simply be the safer model here, since averaging dilutes the hard cases boosting would chase.",
      },
      difficulty: 3,
      targets: ["boost:transfer"],
    },
  ],
};
