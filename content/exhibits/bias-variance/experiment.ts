import type { ExperimentSpec } from "@/lib/experiment/spec";
import type { Point } from "@/lib/models/linear-regression";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * Bias–variance experiment spec. One control — the polynomial degree — sweeps the
 * model from too-simple (high bias, underfits) to too-flexible (high variance,
 * overfits). The training points are the spec's dataset; the held-out test points
 * (the only honest score) are read straight from the fixture by the lab. Both come
 * from a smooth target + noise, so the U-shaped test error is real, not staged.
 */
export const biasVarianceExperiment: ExperimentSpec = {
  id: "bias-variance",
  title: "Find the sweet spot",
  params: [
    {
      id: "degree",
      label: "Polynomial degree",
      hint: "How wiggly the model is allowed to be — its capacity.",
      min: 1,
      max: 12,
      step: 1,
      default: 1,
    },
  ],
  datasets: [
    {
      id: "train",
      label: "Training data",
      points: fixtures.train as Point[],
      editable: false,
    },
  ],
  scenarios: [
    {
      id: "the-tradeoff",
      title: "The bias–variance tradeoff",
      prompt:
        "Sweep the degree from 1 upward. At low degree the model is too stiff to follow the curve — it underfits, and both training and test error are high (that's bias). Crank it up and the curve wriggles through every training point — training error vanishes, but it has memorised the noise, so test error climbs (that's variance). The honest score, on data it never saw, is lowest somewhere in the middle.",
      datasetId: "train",
    },
  ],
};
