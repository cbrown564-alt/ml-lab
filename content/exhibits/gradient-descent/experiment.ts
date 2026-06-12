import type { ExperimentSpec } from "@/lib/experiment/spec";
import type { Point } from "@/lib/models/linear-regression";
import fixtures from "@/lib/models/fixtures/linear-regression.json";

/**
 * Gradient-descent experiment spec. One dataset, one knob: every scenario
 * runs on the same loss surface so the learning rate is the only variable —
 * the lesson is what step size does to the same downhill walk. Scenario
 * learning rates are claims, and experiment.test.ts holds them to account.
 */

const fixturePoints = (name: string): Point[] => {
  const c = fixtures.cases.find((c) => c.name === name);
  if (!c) throw new Error(`fixture dataset missing: ${name}`);
  return c.points;
};

export const gradientDescentExperiment: ExperimentSpec = {
  id: "gradient-descent",
  title: "Roll downhill",
  params: [
    {
      id: "learningRate",
      label: "Learning rate",
      hint: "How big a step to take down the gradient each iteration.",
      min: 1e-6,
      max: 2,
      step: 0.001,
      default: 0.02,
      log: true,
    },
  ],
  datasets: [
    {
      id: "clean-linear",
      label: "Sensible data",
      points: fixturePoints("clean-linear"),
      // The descent is the manipulable thing here, not the data — moving
      // points mid-run would silently change the loss surface underfoot.
      editable: false,
    },
  ],
  scenarios: [
    {
      id: "watch-it-learn",
      title: "Watch it learn",
      prompt:
        "The flat line knows nothing. Press play and watch it learn: each step reads the slope of the loss surface and walks downhill. The dashed line is the destination — the least-squares fit. Watch the loss fall by whole powers of ten, then crawl as the surface flattens near the bottom.",
      datasetId: "clean-linear",
      params: { learningRate: 0.02 },
    },
    {
      id: "too-timid",
      title: "Too timid",
      prompt:
        "Same hill, tiny steps. The gradient still points the right way — but at this learning rate the line will take thousands of steps to get anywhere. Undertraining isn't a broken model; it's an unfinished walk. Nudge the learning rate up mid-run and watch it wake up.",
      datasetId: "clean-linear",
      params: { learningRate: 1e-6 },
    },
    {
      id: "over-the-edge",
      title: "Over the edge",
      prompt:
        "Bigger steps learn faster — so why not huge ones? Predict first: what happens with a learning rate of 1? Press play. Each step now overshoots the valley and lands higher up the far wall than where it started. The loss doesn't just fail to fall; it explodes.",
      datasetId: "clean-linear",
      params: { learningRate: 1.0 },
      failure: true,
    },
  ],
};
