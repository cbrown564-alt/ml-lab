import type { ExperimentSpec } from "@/lib/experiment/spec";
import type { Point } from "@/lib/models/linear-regression";
import fixtures from "@/lib/models/fixtures/loss-functions.json";

/**
 * Loss-functions experiment spec. One dataset carries the lesson: the same points
 * fit three ways depending on the *judge* (the loss). The chosen loss is lab state,
 * not a spec param (it's a three-way choice, not a number), so the spec supplies the
 * data and the framing; the lab fits under squared / absolute / Huber and draws the
 * penalty each judge assigns. Datasets are the committed scipy-verified fixtures.
 */

const fixturePoints = (name: string): Point[] => {
  const c = fixtures.cases.find((c) => c.name === name);
  if (!c) throw new Error(`loss fixture dataset missing: ${name}`);
  return c.points as Point[];
};

export const lossFunctionsExperiment: ExperimentSpec = {
  id: "loss-functions",
  title: "Choose the judge",
  params: [],
  datasets: [
    {
      id: "with-outliers",
      label: "A few rogue points",
      points: fixturePoints("with-outliers"),
      editable: true,
    },
    {
      id: "clean",
      label: "Honest data",
      points: fixturePoints("clean"),
      editable: true,
    },
  ],
  scenarios: [
    {
      id: "meet-the-judges",
      title: "Meet the three judges",
      prompt:
        "The same points, three ways to score a miss. Switch the loss and watch the line move: squared error chases the rogue points up the right edge, while absolute error and Huber hold the trend the bulk of the data votes for. The line didn't change its mind — you changed its judge.",
      datasetId: "with-outliers",
    },
    {
      id: "honest-agreement",
      title: "When the judges agree",
      prompt:
        "On clean data with no rogues, all three judges return nearly the same line — the choice of loss barely matters. The disagreement only shows up when something extreme is at stake. Drag a point far off the trend and watch the squared-error line, alone, lunge after it.",
      datasetId: "clean",
    },
  ],
};
