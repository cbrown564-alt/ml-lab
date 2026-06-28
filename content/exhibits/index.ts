/**
 * Exhibit registry — which graph nodes have a live exhibit route. This is
 * deliberately separate from a node's `status`: status is a quality claim
 * that only advances through acceptance review (docs/06), while this is the
 * plain fact of whether a door exists to walk through.
 */
export const liveExhibits: Record<string, { href: string }> = {
  "linear-regression": { href: "/exhibits/linear-regression" },
  "gradient-descent": { href: "/exhibits/gradient-descent" },
  "loss-functions": { href: "/exhibits/loss-functions" },
  "feature-scaling": { href: "/exhibits/feature-scaling" },
  "bias-variance": { href: "/exhibits/bias-variance" },
  "overfitting-regularization": { href: "/exhibits/overfitting-regularization" },
  "data-leakage": { href: "/exhibits/data-leakage" },
  "logistic-regression": { href: "/exhibits/logistic-regression" },
  "classification-task": { href: "/exhibits/classification-task" },
  "train-test-generalization": { href: "/exhibits/train-test-generalization" },
  "the-gradient": { href: "/exhibits/the-gradient" },
  "regression-task": { href: "/exhibits/regression-task" },
  "neural-network-fundamentals": { href: "/exhibits/neural-network-fundamentals" },
  "what-is-ml": { href: "/exhibits/what-is-ml" },
  "the-dataset": { href: "/exhibits/the-dataset" },
  "decision-trees": { href: "/exhibits/decision-trees" },
  "random-forests": { href: "/exhibits/random-forests" },
  "gradient-boosting": { href: "/exhibits/gradient-boosting" },
};

export const isLive = (nodeId: string): boolean => nodeId in liveExhibits;
