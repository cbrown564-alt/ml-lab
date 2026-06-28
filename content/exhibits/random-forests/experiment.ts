import type { ParamDef } from "@/lib/experiment/spec";
import { buildForest, forestAccuracy, type Forest } from "@/lib/models/random-forest";
import type { TreePoint } from "@/lib/models/decision-tree";
import treeFix from "@/lib/models/fixtures/decision-tree.json";
import forestFix from "@/lib/models/fixtures/random-forest.json";

/**
 * Random-forest experiment data — the SAME moons the decision-tree node used, so the
 * single tree's jagged staircase and the forest's smoothed vote read against the same
 * points (the cluster's vocabulary compounds). The one knob is the number of trees.
 */
export const forestPoints = treeFix.train as TreePoint[];
export const forestTestPoints = treeFix.test as TreePoint[];
export const forestDomain = treeFix.domain as [number, number];

/** scikit-learn's single-tree baseline — the deep tree the forest beats. (The forest's own
 * accuracy curve and its resample stability are now computed live from the SHOWN forest, in
 * forestAccCurve below and the RandomForestStability instrument, so the numbers on screen
 * match the rendered field rather than a separate fixture.) */
export const singleTreeBaseline = forestFix.singleTree as {
  trainAccuracy: number;
  testAccuracy: number;
};

/** The slider ceiling. Capped for live rendering (the field paints trees × grid); the
 * committed fixture goes to 100, where the curve has already flattened. */
export const FOREST_MAX = 60;
export const FOREST_SEED = 7;

/** One forest of FOREST_MAX trees, built once. The nTrees knob averages the first k of
 * them, so growing the crowd is a re-average, not a refit — a single tree added at a time. */
export const FULL_FOREST: Forest = buildForest(forestPoints, {
  nTrees: FOREST_MAX,
  maxFeatures: 1,
  seed: FOREST_SEED,
});

/** Held-out accuracy of the SHOWN forest (FULL_FOREST) at every size 1..MAX, computed
 * once. The Lab chart and the live readout both read this, so every "k trees" number on
 * screen agrees with the field being rendered. It climbs and then plateaus around 91% —
 * with small run-to-run jiggles that are 120-point test-set noise, not a systematic U. */
export const forestAccCurve = Array.from({ length: FOREST_MAX }, (_, i) => {
  const k = i + 1;
  return { nTrees: k, testAccuracy: forestAccuracy(forestTestPoints, FULL_FOREST.slice(0, k)) };
});

export const nTreesParam: ParamDef = {
  id: "nTrees",
  label: "Trees in the forest",
  hint: "How many bootstrap trees to grow and average. More only steadies the vote — it never overfits.",
  min: 1,
  max: FOREST_MAX,
  step: 1,
  default: 30,
};

export const randomForestScenario = {
  id: "two-moons-forest",
  title: "A crowd of trees, one smooth vote",
  prompt:
    "The same two moons. One tree carves a jagged, overfit staircase. Drag Trees in the forest to grow a crowd — each on its own resample of the data, each disagreeing — and watch their averaged vote smooth into a clean, steady boundary. The held-out score climbs and then flattens: more trees never hurt.",
};
