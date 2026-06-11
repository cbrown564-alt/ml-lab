import type { ConceptEdge } from "@/lib/graph/schema";

/**
 * Cross-cutting edges of the knowledge graph. Validation enforces:
 * prerequisite edges form a DAG, all endpoints exist, contrasts edges
 * carry a learner-facing note.
 */
export const edges: ConceptEdge[] = [
  { from: "what-is-ml", to: "regression-task", type: "prerequisite", strength: "soft" },
  { from: "what-is-ml", to: "classification-task", type: "prerequisite", strength: "soft" },
  { from: "the-dataset", to: "linear-regression", type: "prerequisite", strength: "soft" },
  { from: "regression-task", to: "linear-regression", type: "prerequisite", strength: "hard" },
  { from: "linear-regression", to: "loss-functions", type: "sequel", strength: "soft" },
  { from: "loss-functions", to: "gradient-descent", type: "prerequisite", strength: "hard" },
  { from: "linear-regression", to: "gradient-descent", type: "prerequisite", strength: "soft" },
  { from: "the-gradient", to: "gradient-descent", type: "applies", strength: "soft" },
  { from: "linear-regression", to: "logistic-regression", type: "generalizes", strength: "hard" },
  { from: "classification-task", to: "logistic-regression", type: "prerequisite", strength: "hard" },
  {
    from: "linear-regression",
    to: "logistic-regression",
    type: "contrasts",
    strength: "soft",
    note: "Both fit a weighted sum of features — but one outputs the sum directly, the other squashes it into a probability. Seeing where they diverge is seeing what classification really asks for.",
  },
  { from: "train-test-generalization", to: "overfitting-regularization", type: "prerequisite", strength: "hard" },
  { from: "the-dataset", to: "train-test-generalization", type: "prerequisite", strength: "soft" },
  { from: "logistic-regression", to: "neural-network-fundamentals", type: "composes", strength: "soft" },
  { from: "gradient-descent", to: "neural-network-fundamentals", type: "prerequisite", strength: "hard" },
  { from: "overfitting-regularization", to: "neural-network-fundamentals", type: "prerequisite", strength: "soft" },
];
