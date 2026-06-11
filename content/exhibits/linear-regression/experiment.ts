import type { ExperimentSpec } from "@/lib/experiment/spec";
import type { Point } from "@/lib/models/linear-regression";
import fixtures from "@/lib/models/fixtures/linear-regression.json";

/**
 * Linear-regression experiment spec. Datasets come from the same committed
 * scikit-learn fixtures the model tests run against — what the learner
 * manipulates is literally the data the implementation is verified on.
 */

const fixturePoints = (name: string): Point[] => {
  const c = fixtures.cases.find((c) => c.name === name);
  if (!c) throw new Error(`fixture dataset missing: ${name}`);
  return c.points;
};

export const linearRegressionExperiment: ExperimentSpec = {
  id: "linear-regression",
  title: "Fit a line",
  params: [],
  datasets: [
    {
      id: "clean-linear",
      label: "Sensible data",
      points: fixturePoints("clean-linear"),
      editable: true,
    },
    {
      id: "with-outliers",
      label: "Two rogue points",
      points: fixturePoints("with-outliers"),
      editable: true,
    },
  ],
  scenarios: [
    {
      id: "first-fit",
      title: "Meet the line of best fit",
      prompt:
        "Drag any point and watch the line refit instantly. The dashed red segments are residuals — the mistakes the line is making. The fit you see is the one that makes the squared residuals as small as possible.",
      datasetId: "clean-linear",
    },
    {
      id: "tyranny-of-the-outlier",
      title: "The tyranny of the outlier",
      prompt:
        "Two rogue points have wandered in. Drag one of them further out and watch how violently the line chases it. Squared error doesn't just notice big mistakes — it obsesses over them. Predict first: how far must one point stray to drag the line completely off the trend?",
      datasetId: "with-outliers",
      failure: true,
    },
  ],
};
