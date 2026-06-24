import type { ExperimentSpec } from "@/lib/experiment/spec";
import type { Point } from "@/lib/models/linear-regression";
import fixtures from "@/lib/models/fixtures/linear-regression.json";

/**
 * Feature-scaling experiment spec. The dataset is the uncentred, unscaled data
 * whose loss bowl is long and thin (the same data the gradient-descent exhibit
 * zig-zags down). The lab's interaction is a Raw ↔ Standardised toggle; standardise
 * is computed in the lab, so the spec just supplies the raw points and the framing.
 */

const gdZigzag = (): Point[] => {
  const c = fixtures.cases.find((c) => c.name === "gd-zigzag");
  if (!c) throw new Error("fixture dataset missing: gd-zigzag");
  return c.points as Point[];
};

export const featureScalingExperiment: ExperimentSpec = {
  id: "feature-scaling",
  title: "Round the bowl",
  params: [],
  datasets: [
    {
      id: "uncentred",
      label: "Raw units",
      points: gdZigzag(),
      // The descent is the manipulable thing; moving points would change the
      // very conditioning we're studying.
      editable: false,
    },
  ],
  scenarios: [
    {
      id: "the-stretched-valley",
      title: "The stretched valley",
      prompt:
        "These are honest data on raw, uncentred units — and look at the loss bowl they make: long, thin, and tilted. Descent from the flat line has to zig-zag down the narrow valley, taking the tiniest steps so it doesn't fly across. Flip to Standardised and watch the same bowl round out, the step grow, and the walk go almost straight in.",
      datasetId: "uncentred",
    },
  ],
};
