import { describe, expect, it } from "vitest";
import {
  boundaryRoughness,
  buildForest,
  forestAccuracy,
  forestProba,
} from "@/lib/models/random-forest";
import { buildTree, predictProbaTree, type TreePoint } from "@/lib/models/decision-tree";
import forestFix from "@/lib/models/fixtures/random-forest.json";
import treeFix from "@/lib/models/fixtures/decision-tree.json";

/**
 * The random forest, verified against scikit-learn's RandomForestClassifier on the shared
 * moons data. Both are random, so the contract is behavioural: a big forest reaches
 * sklearn's test accuracy and beats the single high-variance tree, more trees help and
 * steady, and the averaged boundary is smoother than one tree's staircase.
 */
const train = treeFix.train as TreePoint[];
const test = treeFix.test as TreePoint[];
const domain = treeFix.domain as [number, number];
const SK_RF_100 = forestFix.byTrees.find((r) => r.nTrees === 100)!.testAccuracy;

describe("random forest vs scikit-learn", () => {
  it("a 100-tree forest reaches sklearn's test accuracy and beats a single tree", () => {
    const forest = buildForest(train, { nTrees: 100, maxFeatures: 1, seed: 7 });
    const acc = forestAccuracy(test, forest);
    // Beats the single fully-grown tree (the high-variance baseline) …
    expect(acc).toBeGreaterThan(forestFix.singleTree.testAccuracy);
    // … and lands near sklearn's forest (both are random — behavioural tolerance).
    expect(Math.abs(acc - SK_RF_100)).toBeLessThan(0.06);
  });

  it("more trees raise and steady the held-out score (variance reduction)", () => {
    const one = forestAccuracy(test, buildForest(train, { nTrees: 1, maxFeatures: 1, seed: 7 }));
    const many = forestAccuracy(test, buildForest(train, { nTrees: 100, maxFeatures: 1, seed: 7 }));
    expect(many).toBeGreaterThanOrEqual(one);
    // sklearn's own trend, committed: the 100-tree forest beats the 1-tree forest.
    const byTrees = forestFix.byTrees;
    expect(byTrees[byTrees.length - 1].testAccuracy).toBeGreaterThan(byTrees[0].testAccuracy);
  });

  it("the forest smooths the boundary a single deep tree leaves jagged", () => {
    const single = buildTree(train); // fully grown — the jagged staircase
    const forest = buildForest(train, { nTrees: 100, maxFeatures: 1, seed: 7 });
    const rSingle = boundaryRoughness((x1, x2) => predictProbaTree(single, x1, x2), domain);
    const rForest = boundaryRoughness((x1, x2) => forestProba(forest, x1, x2), domain);
    expect(rForest).toBeLessThan(rSingle);
  });

  it("its vote is more stable across resamples than a single tree's (sklearn fixture)", () => {
    expect(forestFix.stability.forestTestStd).toBeLessThan(forestFix.stability.singleTreeTestStd);
  });
});
