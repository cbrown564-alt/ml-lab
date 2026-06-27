import { AudioManifestSchema, type AudioManifest } from "@/lib/narrative/audio";
import biasVariance from "./bias-variance/audio-manifest.json";
import classificationTask from "./classification-task/audio-manifest.json";
import dataLeakage from "./data-leakage/audio-manifest.json";
import featureScaling from "./feature-scaling/audio-manifest.json";
import gradientDescent from "./gradient-descent/audio-manifest.json";
import linearRegression from "./linear-regression/audio-manifest.json";
import logisticRegression from "./logistic-regression/audio-manifest.json";
import lossFunctions from "./loss-functions/audio-manifest.json";
import neuralNetworkFundamentals from "./neural-network-fundamentals/audio-manifest.json";
import overfittingRegularization from "./overfitting-regularization/audio-manifest.json";
import regressionTask from "./regression-task/audio-manifest.json";
import theDataset from "./the-dataset/audio-manifest.json";
import theGradient from "./the-gradient/audio-manifest.json";
import trainTestGeneralization from "./train-test-generalization/audio-manifest.json";
import whatIsMl from "./what-is-ml/audio-manifest.json";

/**
 * Narration manifests by node (docs/06, B4). Parsed at module load so a
 * malformed manifest is a build error, never a broken player (C3).
 */
export const audioManifests: Record<string, AudioManifest> = Object.fromEntries(
  [
    whatIsMl,
    theDataset,
    regressionTask,
    classificationTask,
    linearRegression,
    lossFunctions,
    gradientDescent,
    theGradient,
    featureScaling,
    logisticRegression,
    trainTestGeneralization,
    biasVariance,
    overfittingRegularization,
    dataLeakage,
    neuralNetworkFundamentals,
  ].map((m) => {
    const parsed = AudioManifestSchema.parse(m);
    return [parsed.nodeId, parsed];
  }),
);
