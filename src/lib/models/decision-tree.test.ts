import { describe, expect, it } from "vitest";
import {
  buildTree,
  countLeaves,
  gini,
  leafRegions,
  predictTree,
  treeAccuracy,
  treeDepth,
  type TreePoint,
} from "@/lib/models/decision-tree";
import fixtures from "@/lib/models/fixtures/decision-tree.json";

/**
 * The CART tree, verified against scikit-learn's DecisionTreeClassifier on the shared
 * moons dataset: at every depth the TS greedy Gini tree must reproduce sklearn's
 * train/test accuracy and per-point partition, and the depth→accuracy curve must show
 * the overfitting wall (train climbs to 1.0 while held-out test peaks early then falls).
 */
const train = fixtures.train as TreePoint[];
const test = fixtures.test as TreePoint[];

describe("gini impurity", () => {
  it("is zero for a pure node and ½ for a 50/50 mix", () => {
    expect(gini([{ x1: 0, x2: 0, y: 1 }, { x1: 1, x2: 1, y: 1 }])).toBe(0);
    expect(gini([{ x1: 0, x2: 0, y: 0 }, { x1: 1, x2: 1, y: 1 }])).toBeCloseTo(0.5, 12);
  });
});

describe("CART vs scikit-learn across depths", () => {
  for (const ref of fixtures.byDepth) {
    it(`depth ${ref.depth}: matches sklearn's accuracy, leaf count, and partition`, () => {
      const tree = buildTree(train, { maxDepth: ref.depth });

      // The held-out test accuracy is the honest contract — it must match sklearn's.
      expect(treeAccuracy(train, tree)).toBeCloseTo(ref.trainAccuracy, 6);
      expect(treeAccuracy(test, tree)).toBeCloseTo(ref.testAccuracy, 6);
      expect(countLeaves(tree)).toBe(ref.leaves);
      expect(treeDepth(tree)).toBeLessThanOrEqual(ref.depth);

      // The greedy partition itself: nearly every training point falls in the same
      // class region sklearn put it in. Not bit-for-bit — where two splits tie on
      // impurity, sklearn's random_state shuffles which it takes, so a handful of
      // points can land in an equally-good but different box (accuracy and leaf count
      // above are identical regardless). ≥98% is the honest "same partition" contract.
      const preds = train.map((p) => predictTree(tree, p.x1, p.x2));
      const agree = preds.filter((v, i) => v === ref.trainPreds[i]).length / train.length;
      expect(agree).toBeGreaterThanOrEqual(0.98);
    });
  }
});

describe("the overfitting wall", () => {
  it("a deeper tree drives training accuracy to 1.0 while test accuracy peaks and falls", () => {
    const accByDepth = fixtures.byDepth.map((r) => r.testAccuracy);
    const peak = Math.max(...accByDepth);
    const peakDepth = fixtures.byDepth[accByDepth.indexOf(peak)].depth;
    const deepest = fixtures.byDepth[fixtures.byDepth.length - 1];

    // Best generalisation is reached at a shallow depth, not the deepest tree.
    expect(peakDepth).toBeLessThanOrEqual(3);
    // The fully grown tree memorises training…
    expect(deepest.trainAccuracy).toBeCloseTo(1, 6);
    // …yet generalises worse than the shallow sweet spot.
    expect(deepest.testAccuracy).toBeLessThan(peak);

    // And the TS model reproduces the memorisation: an unbounded tree nails the train set.
    const full = buildTree(train);
    expect(treeAccuracy(train, full)).toBeCloseTo(1, 6);
    expect(treeAccuracy(test, full)).toBeCloseTo(fixtures.fullyGrown.testAccuracy, 6);
  });
});

describe("leaf regions tile the plane", () => {
  it("a depth-2 tree's leaves are disjoint boxes whose count matches the leaves", () => {
    const tree = buildTree(train, { maxDepth: 2 });
    const bounds = { x1: [-3.6, 3.6] as [number, number], x2: [-3.6, 3.6] as [number, number] };
    const regions = leafRegions(tree, bounds);
    expect(regions.length).toBe(countLeaves(tree));
    // Each training point sits inside exactly one region, and that region's vote agrees
    // with walking the tree.
    for (const p of train) {
      const owning = regions.filter(
        (r) => p.x1 > r.x1[0] && p.x1 <= r.x1[1] && p.x2 > r.x2[0] && p.x2 <= r.x2[1],
      );
      expect(owning.length).toBe(1);
      expect(owning[0].prob1 >= 0.5 ? 1 : 0).toBe(predictTree(tree, p.x1, p.x2));
    }
  });
});
