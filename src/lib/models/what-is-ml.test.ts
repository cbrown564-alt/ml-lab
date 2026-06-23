import { describe, expect, it } from "vitest";
import { accuracy, fitLogistic } from "@/lib/models/logistic";
import { biasedTrainingSet, bestRuleAccuracy, whatIsMlData } from "@content/exhibits/what-is-ml/experiment";

/**
 * The exhibit's whole claim, grounded: a hand-written single-feature threshold tops out,
 * but a rule learned from the labelled examples (which weighs both features) does clearly
 * better. The gap is what "learning the rule from data" buys you.
 */
describe("what-is-ml: hand rule vs learned rule", () => {
  it("the best single-feature threshold rule is limited", () => {
    const best = bestRuleAccuracy(whatIsMlData);
    expect(best.acc).toBeLessThan(0.85); // one feature can't capture a tilted boundary
    expect(best.acc).toBeGreaterThan(0.6); // but it's better than a coin flip
  });

  it("a rule learned from the examples clearly beats the best hand rule", () => {
    const best = bestRuleAccuracy(whatIsMlData);
    const learned = accuracy(whatIsMlData, fitLogistic(whatIsMlData));
    expect(learned).toBeGreaterThan(best.acc + 0.08);
    expect(learned).toBeGreaterThan(0.9); // weighing both features nails the tilted rule
  });

  it("garbage in, garbage out — biased labels yield a rule that fails the true population", () => {
    const clean = accuracy(whatIsMlData, fitLogistic(biasedTrainingSet(0)));
    const biased = accuracy(whatIsMlData, fitLogistic(biasedTrainingSet(0.8)));
    expect(clean).toBeGreaterThan(0.9); // clean labels → the real rule
    expect(biased).toBeLessThan(clean - 0.15); // the machine faithfully learns the bias
  });
});
