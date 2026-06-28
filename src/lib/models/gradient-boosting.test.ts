import { describe, expect, it } from "vitest";
import {
  boosterAccuracy,
  boosterLogLoss,
  fitBooster,
} from "@/lib/models/gradient-boosting";
import type { TreePoint } from "@/lib/models/decision-tree";
import gbFix from "@/lib/models/fixtures/gradient-boosting.json";
import treeFix from "@/lib/models/fixtures/decision-tree.json";

/**
 * Gradient boosting, verified against scikit-learn's GradientBoostingClassifier on the
 * shared moons. The contract: a few shallow trees already cut the bias a single deep tree
 * couldn't, training log-loss falls monotonically toward zero, and — the opposite of a
 * forest — the TEST log-loss bottoms early and then climbs, because the sequential trees
 * eventually fit the noise. Behavioural tolerances (both implementations descend the same
 * loss but differ in split/leaf details).
 */
const train = treeFix.train as TreePoint[];
const test = treeFix.test as TreePoint[];
const B = fitBooster(train, { nRounds: 200, maxDepth: gbFix.generator.maxDepth, lr: gbFix.generator.learningRate });

describe("gradient boosting vs scikit-learn", () => {
  it("cuts bias fast — a few shallow trees beat a single deep tree", () => {
    // The single fully-grown tree managed 0.867 on held-out; boosting passes it in a
    // handful of depth-2 rounds.
    expect(boosterAccuracy(test, B, 10)).toBeGreaterThan(treeFix.fullyGrown.testAccuracy);
  });

  it("drives training log-loss monotonically toward zero", () => {
    const losses = [1, 2, 5, 10, 20, 40, 80].map((r) => boosterLogLoss(train, B, r));
    for (let i = 1; i < losses.length; i++) expect(losses[i]).toBeLessThan(losses[i - 1]);
    expect(losses[losses.length - 1]).toBeLessThan(0.1);
  });

  it("overfits: the test log-loss bottoms early and then climbs (a U)", () => {
    const early = boosterLogLoss(test, B, 5);
    const mid = boosterLogLoss(test, B, 20);
    const late = boosterLogLoss(test, B, 200);
    expect(mid).toBeLessThan(early); // it improves at first…
    expect(late).toBeGreaterThan(mid); // …then over-confidence on noise makes it worse
    // sklearn's committed curve shows the same U.
    const lls = gbFix.byRounds.map((r) => r.testLogLoss);
    const minLL = Math.min(...lls);
    expect(lls[lls.length - 1]).toBeGreaterThan(minLL);
    expect(lls[0]).toBeGreaterThan(minLL);
  });

  it("reaches scikit-learn's test accuracy near the peak", () => {
    const ref = gbFix.byRounds.find((r) => r.rounds === 40)!.testAccuracy;
    expect(Math.abs(boosterAccuracy(test, B, 40) - ref)).toBeLessThan(0.06);
  });
});
