import type { ConceptEdge } from "@/lib/graph/schema";

/**
 * Cross-cutting edges of the knowledge graph, typed with the pedagogical
 * vocabulary (docs/03-data-model.md): each edge carries a learner-facing
 * meaning, not just a structural link. Validation enforces: `requires` edges
 * form a DAG, all endpoints exist, `often_confused_with` edges carry a note.
 */
export const edges: ConceptEdge[] = [
  { from: "what-is-ml", to: "regression-task", type: "requires", strength: "soft" },
  { from: "what-is-ml", to: "classification-task", type: "requires", strength: "soft" },
  { from: "the-dataset", to: "linear-regression", type: "requires", strength: "soft" },
  { from: "regression-task", to: "linear-regression", type: "requires", strength: "hard" },
  // Seeing the line raises the question loss functions answer; then descent needs them.
  { from: "linear-regression", to: "loss-functions", type: "requires", strength: "soft" },
  { from: "loss-functions", to: "gradient-descent", type: "requires", strength: "hard" },
  { from: "linear-regression", to: "gradient-descent", type: "requires", strength: "soft" },
  // The gradient is the maths that makes both mechanisms legible.
  {
    from: "the-gradient",
    to: "gradient-descent",
    type: "mathematical_basis",
    strength: "soft",
    note: "Descent is this hunt automated: step against −∇f until the gradient vanishes. The local-optimum trap and the vanishing-gradient stall you met here are exactly the failures descent inherits.",
  },
  // The OLS closed form is the gradient-vanishes condition, solved — the
  // linear-regression math wing leans on the same math node.
  { from: "the-gradient", to: "linear-regression", type: "mathematical_basis", strength: "soft" },
  // Logistic regression is linear regression generalised to a probability/decision.
  { from: "linear-regression", to: "logistic-regression", type: "generalises", strength: "hard" },
  { from: "classification-task", to: "logistic-regression", type: "requires", strength: "hard" },
  {
    from: "linear-regression",
    to: "logistic-regression",
    type: "often_confused_with",
    strength: "soft",
    note: "Both fit a weighted sum of features — but one outputs the sum directly, the other squashes it into a probability. Seeing where they diverge is seeing what classification really asks for.",
  },
  { from: "train-test-generalization", to: "overfitting-regularization", type: "requires", strength: "hard" },
  { from: "the-dataset", to: "train-test-generalization", type: "requires", strength: "soft" },
  // A logistic unit is the building block a neural network is assembled from.
  { from: "logistic-regression", to: "neural-network-fundamentals", type: "used_inside", strength: "soft" },
  { from: "gradient-descent", to: "neural-network-fundamentals", type: "requires", strength: "hard" },
  { from: "overfitting-regularization", to: "neural-network-fundamentals", type: "requires", strength: "soft" },
  // Regression cluster, breadth-first scale-out: data-prep + generalisation.
  { from: "the-dataset", to: "feature-scaling", type: "requires", strength: "soft" },
  { from: "gradient-descent", to: "feature-scaling", type: "requires", strength: "soft" },
  { from: "train-test-generalization", to: "bias-variance", type: "requires", strength: "hard" },
  { from: "linear-regression", to: "bias-variance", type: "requires", strength: "soft" },
  { from: "bias-variance", to: "overfitting-regularization", type: "requires", strength: "soft" },
  { from: "train-test-generalization", to: "data-leakage", type: "requires", strength: "hard" },
  // Trees cluster opens here: a classifier that bends on its own, where the depth knob
  // is the overfitting wall made literal (a box around every noisy point).
  { from: "classification-task", to: "decision-trees", type: "requires", strength: "hard" },
  { from: "overfitting-regularization", to: "decision-trees", type: "requires", strength: "soft" },
  {
    from: "logistic-regression",
    to: "decision-trees",
    type: "alternative_to",
    strength: "soft",
    note: "Two ways to split a plane: logistic regression searches for one straight boundary; a tree carves the plane into axis-aligned boxes with a cascade of yes/no cuts. The line needs you to engineer x₁² to bend; the tree bends on its own — at the price of a jagged boundary that overfits if you let it grow.",
  },
  // Ensembles: the random forest is the cure for the single tree's high variance.
  { from: "decision-trees", to: "random-forests", type: "requires", strength: "hard" },
  { from: "bias-variance", to: "random-forests", type: "requires", strength: "soft" },
  // Boosting: the other way to build a forest — sequential, bias-reducing, and it IS
  // gradient descent run in the space of functions.
  { from: "decision-trees", to: "gradient-boosting", type: "requires", strength: "hard" },
  {
    from: "the-gradient",
    to: "gradient-boosting",
    type: "mathematical_basis",
    strength: "soft",
    note: "The residual y − p that each tree is fit to is exactly the negative gradient of the log-loss. Boosting is the gradient hunt you met here, run in the space of functions: each tree is a step against −∇, the learning rate is the step size.",
  },
  {
    from: "random-forests",
    to: "gradient-boosting",
    type: "often_confused_with",
    strength: "soft",
    note: "Both are forests of trees, and they are near-opposites. A random forest grows trees independently in parallel and averages them to cut variance — more trees is always safe. Boosting grows shallow trees in sequence, each fixing the last's residuals, to cut bias — and more trees can overshoot into the noise.",
  },
];
