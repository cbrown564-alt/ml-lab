import type { FailureGallery } from "@/lib/failure/schema";

/**
 * PCA's two main traps in this exhibit: letting units dominate the covariance matrix,
 * and treating explained variance as if it meant semantic importance for every task.
 */
export const pcaFailures: FailureGallery = {
  nodeId: "pca",
  intro:
    "PCA fails in two different ways here: one geometric, one conceptual. First the axes can be warped by units; then the variance bookkeeping can be over-interpreted.",
  cards: [
    {
      id: "scaling-ignored",
      primitive: "feature-scaling",
      title: "Ignoring scale before PCA",
      trigger:
        "Run PCA on raw features whose units have very different spreads — dollars beside percentages, milliseconds beside counts.",
      symptom:
        "PC1 points almost entirely along the biggest-unit feature, and the explained-variance bar claims one axis captures nearly everything.",
      diagnosis:
        "PCA is reading the covariance matrix you gave it. If one feature's numeric scale dwarfs the others, that feature contributes most of the variance before correlation structure even gets a vote.",
      repair:
        "Center and usually standardize the features first, then fit PCA to the scaled data so the components reflect shared structure instead of arbitrary units.",
      boundary:
        "If the original units themselves are the meaning — for example physical energy or variance in a common unit — standardizing can throw away signal you intentionally wanted to preserve.",
    },
    {
      id: "variance-misread",
      primitive: "metric-mismatch",
      title: "Reading explained variance as importance",
      trigger:
        "Treat the highest-variance component as 'the most important feature' for any downstream task and discard low-variance components automatically.",
      symptom:
        "Compression looks excellent, yet a classifier, regressor, or scientific interpretation gets worse because a low-variance direction carried the signal you actually cared about.",
      diagnosis:
        "Explained variance measures squared reconstruction error, not predictive usefulness, fairness, or causal meaning. PCA optimizes geometry of the cloud, not the objective of every later model.",
      repair:
        "Use explained variance to reason about compression, then validate the retained components against the downstream task you truly care about.",
      boundary:
        "For plain visualization or denoising, explained variance can be exactly the right objective. The mismatch appears when you silently swap 'compresses well' for 'matters most'.",
    },
  ],
};
