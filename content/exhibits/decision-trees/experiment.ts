import type { ParamDef } from "@/lib/experiment/spec";
import { buildTree, type TreeNode, type TreePoint } from "@/lib/models/decision-tree";
import fixtures from "@/lib/models/fixtures/decision-tree.json";

/**
 * Decision-tree experiment data. Two interleaving moons with honest overlap (the
 * scikit-learn-verified fixture, shared across the whole trees cluster), plus the one
 * knob that matters: tree depth. The lab grows the tree live as the learner drags depth,
 * and reads train vs held-out accuracy off the same fixture the model is verified against.
 */
export const treePoints = fixtures.train as TreePoint[];
export const treeTestPoints = fixtures.test as TreePoint[];
export const treeDomain = fixtures.domain as [number, number];

/** The maximum depth a fully grown tree reaches on this data — the slider's ceiling.
 * Beyond it the tree can't split further, so deeper rows just repeat this one. */
export const treeMaxDepth = fixtures.fullyGrown.actualDepth as number;

/** scikit-learn's train/test accuracy by depth — the overfitting curve, drawn honestly.
 * Clamped to the depth the tree actually reaches (deeper rows are duplicates). */
export const treeAccuracyByDepth = (
  fixtures.byDepth as {
    depth: number;
    trainAccuracy: number;
    testAccuracy: number;
    leaves: number;
  }[]
).filter((r) => r.depth <= treeMaxDepth);

export const depthParam: ParamDef = {
  id: "depth",
  label: "Tree depth",
  hint: "How many yes/no questions deep the tree may go — its complexity knob.",
  min: 1,
  max: treeMaxDepth,
  step: 1,
  default: 2,
};

/** The trees at every depth, built once at module load — so dragging the depth knob (or
 * stepping a Story beat) is a lookup, not a refit, keeping interaction off the 100ms red
 * line. Index d holds the tree grown to maxDepth d; index 0 mirrors depth 1. */
export const treesByDepth: TreeNode[] = (() => {
  const out: TreeNode[] = [buildTree(treePoints, { maxDepth: 1 })];
  for (let d = 1; d <= treeMaxDepth; d++) out.push(buildTree(treePoints, { maxDepth: d }));
  return out;
})();

export const treeAtDepth = (d: number): TreeNode =>
  treesByDepth[Math.max(0, Math.min(treeMaxDepth, d))];

export const decisionTreeScenario = {
  id: "two-moons",
  title: "Two arcs, no straight line",
  prompt:
    "Two interleaving crescents — class 0 in amber, class 1 in blue — that no straight line can separate. Drag Tree depth to add questions: each one cuts a box in two, and the staircase of cuts bends to the arcs. Watch the field harden into boxes as you go deeper — and watch the held-out score peak, then fall, as the boxes start wrapping single noisy points.",
};
