import type { FailurePrimitive } from "@/lib/failure/schema";

/**
 * The reusable failure-primitive catalogue (docs/07-failure-taxonomy.md): the
 * lab-wide name and one-line gist for each primitive, so the same failure reads
 * the same wherever it recurs (regression's outlier is robust-loss's outlier).
 * Exhibit failure cards tag themselves with a primitive id; this supplies the
 * shared label and the cross-exhibit recognisability.
 */
export const failurePrimitives: Record<FailurePrimitive, { title: string; gist: string }> = {
  "small-samples": {
    title: "Small samples",
    gist: "Too few examples to fit the population, only this particular sample.",
  },
  outliers: {
    title: "Outliers",
    gist: "A few high-error points dominate a squared objective.",
  },
  "feature-scaling": {
    title: "Feature scaling",
    gist: "Unscaled features distort distance and curve the loss surface.",
  },
  collinearity: {
    title: "Collinearity",
    gist: "Correlated features make coefficients unidentifiable and unstable.",
  },
  overfitting: {
    title: "Overfitting",
    gist: "The model memorises noise as if it were signal.",
  },
  underfitting: {
    title: "Underfitting",
    gist: "The model is too stiff to represent the truth — high bias, both errors high.",
  },
  "data-leakage": {
    title: "Data leakage",
    gist: "Information from the answer sneaks into the features.",
  },
  "class-imbalance": {
    title: "Class imbalance",
    gist: "Accuracy flatters a model that ignores the rare class.",
  },
  "threshold-choice": {
    title: "Threshold choice",
    gist: "One cutoff turns scores into decisions — and changes the verdict.",
  },
  "distribution-shift": {
    title: "Distribution shift",
    gist: "Train and deployment data disagree.",
  },
  "spurious-features": {
    title: "Spurious features",
    gist: "The model latches onto a coincidence, not a mechanism.",
  },
  "bad-initialisation": {
    title: "Bad initialisation",
    gist: "The optimiser starts somewhere that stalls or blows up.",
  },
  "vanishing-exploding-gradients": {
    title: "Vanishing / exploding gradients",
    gist: "Step size or depth sends the update to zero or to infinity.",
  },
  "seed-sensitivity": {
    title: "Seed sensitivity",
    gist: "The result is an accident of one random seed.",
  },
  miscalibration: {
    title: "Miscalibration",
    gist: "Confident probabilities that don't match observed frequencies.",
  },
  "metric-gaming": {
    title: "Metric gaming",
    gist: "Optimising the proxy until it stops tracking the goal.",
  },
};
