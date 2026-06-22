import type { ExperimentSpec } from "@/lib/experiment/spec";
import type { Point } from "@/lib/models/linear-regression";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * Data-leakage experiment spec. The data is a matrix of pure-noise features and a
 * pure-noise target (loaded directly by the lab), so the spec mostly carries the
 * framing; the one interaction is a Leaky ↔ Honest toggle on where feature selection
 * happens. The token dataset is just the target values, for type-shape consistency.
 */
export const dataLeakageExperiment: ExperimentSpec = {
  id: "data-leakage",
  title: "Spot the leak",
  params: [],
  datasets: [
    {
      id: "noise",
      label: "Noise target",
      points: (fixtures.y as number[]).map((v, i) => ({ x: i, y: v })) as Point[],
      editable: false,
    },
  ],
  scenarios: [
    {
      id: "the-leak",
      title: "Manufactured skill",
      prompt:
        "Seventy-two random features, a random target — there is genuinely nothing to predict here. Yet pick the ten features most correlated with the target using all the data, then cross-validate, and the score comes back confidently positive. Flip the toggle to select inside each fold instead, and watch that 'skill' evaporate. Same data, same model — the only difference is whether the selection was allowed to peek at the test folds.",
      datasetId: "noise",
    },
  ],
};
