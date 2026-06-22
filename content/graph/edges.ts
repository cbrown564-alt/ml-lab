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
  { from: "the-gradient", to: "gradient-descent", type: "mathematical_basis", strength: "soft" },
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
];
