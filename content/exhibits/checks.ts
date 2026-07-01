import type { ConceptCheck } from "@/lib/assessment/schema";
import { biasVarianceCheck } from "./bias-variance/concept-check";
import { classificationTaskCheck } from "./classification-task/concept-check";
import { dataLeakageCheck } from "./data-leakage/concept-check";
import { featureScalingCheck } from "./feature-scaling/concept-check";
import { gradientDescentCheck } from "./gradient-descent/concept-check";
import { kMeansCheck } from "./k-means/concept-check";
import { linearRegressionCheck } from "./linear-regression/concept-check";
import { logisticRegressionCheck } from "./logistic-regression/concept-check";
import { lossFunctionsCheck } from "./loss-functions/concept-check";
import { neuralNetworkFundamentalsCheck } from "./neural-network-fundamentals/concept-check";
import { overfittingRegularizationCheck } from "./overfitting-regularization/concept-check";
import { pcaCheck } from "./pca/concept-check";
import { regressionTaskCheck } from "./regression-task/concept-check";
import { theDatasetCheck } from "./the-dataset/concept-check";
import { theGradientCheck } from "./the-gradient/concept-check";
import { trainTestGeneralizationCheck } from "./train-test-generalization/concept-check";
import { whatIsMlCheck } from "./what-is-ml/concept-check";

/**
 * Concept-check registry — node id → its `ConceptCheck` (parallels `audio.ts`
 * and `index.ts`). The review system's assessment-form gate (docs/08 §1c) and
 * the `/review` UI both need to load a node's checks by id without hand-importing
 * each module; this is the single place that fan-in lives.
 */
export const conceptChecks: Record<string, ConceptCheck> = {
  "bias-variance": biasVarianceCheck,
  "classification-task": classificationTaskCheck,
  "data-leakage": dataLeakageCheck,
  "feature-scaling": featureScalingCheck,
  "gradient-descent": gradientDescentCheck,
  "k-means": kMeansCheck,
  "linear-regression": linearRegressionCheck,
  "logistic-regression": logisticRegressionCheck,
  "loss-functions": lossFunctionsCheck,
  "neural-network-fundamentals": neuralNetworkFundamentalsCheck,
  "overfitting-regularization": overfittingRegularizationCheck,
  pca: pcaCheck,
  "regression-task": regressionTaskCheck,
  "the-dataset": theDatasetCheck,
  "the-gradient": theGradientCheck,
  "train-test-generalization": trainTestGeneralizationCheck,
  "what-is-ml": whatIsMlCheck,
};
