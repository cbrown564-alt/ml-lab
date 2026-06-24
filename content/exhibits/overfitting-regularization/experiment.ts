import type { ExperimentSpec } from "@/lib/experiment/spec";
import type { Point } from "@/lib/models/linear-regression";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * Overfitting & regularisation experiment spec. The model is deliberately too
 * flexible — a degree-12 polynomial that, left alone, memorises the noise. The one
 * knob is the ridge penalty λ: turn it up and the same over-powered model is reined
 * in toward a smooth fit, without ever changing its degree. λ is log-scaled (it
 * spans decades); the held-out test points are read from the fixture by the lab.
 */
export const REG_DEGREE = 12;

export const overfittingRegularizationExperiment: ExperimentSpec = {
  id: "overfitting-regularization",
  title: "Rein in the wiggle",
  params: [
    {
      id: "lambda",
      label: "Penalty λ",
      hint: "How hard to push the weights toward zero — the regularisation strength.",
      min: 1e-4,
      max: 100,
      step: 0.0001,
      default: 1e-4,
      log: true,
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
      id: "tame-it",
      title: "Tame the over-powered model",
      prompt:
        "This is a degree-12 polynomial — far too flexible for sixteen points, so at first it overfits, threading every dot and lunging in between. Now turn up the penalty λ. The model's degree never changes, but the penalty pushes its weights toward zero, and the frantic wiggle relaxes into the smooth shape underneath. Too much, though, and you've crushed it back into a flat underfit.",
      datasetId: "train",
    },
  ],
};
