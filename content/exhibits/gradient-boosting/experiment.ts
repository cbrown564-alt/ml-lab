import type { ParamDef } from "@/lib/experiment/spec";
import type { TreePoint } from "@/lib/models/decision-tree";
import { fitBooster, type Booster } from "@/lib/models/gradient-boosting";
import treeFix from "@/lib/models/fixtures/decision-tree.json";
import gbFix from "@/lib/models/fixtures/gradient-boosting.json";

/**
 * Gradient-boosting experiment data — the SAME moons the tree and forest nodes used, so
 * the single tree's overfit, the forest's smooth average, and boosting's sequential
 * descent all read against the same points. The one knob is the number of rounds; the
 * payoff is the pair of loss curves it drives apart.
 */
export const boostPoints = treeFix.train as TreePoint[];
export const boostTestPoints = treeFix.test as TreePoint[];
export const boostDomain = treeFix.domain as [number, number];

/** scikit-learn's committed curve: train log-loss → 0 while held-out log-loss bottoms and
 * then climbs (the overfitting U), with accuracy alongside. */
export const boostByRounds = gbFix.byRounds as {
  rounds: number;
  trainAccuracy: number;
  testAccuracy: number;
  trainLogLoss: number;
  testLogLoss: number;
}[];
export const boostPeak = gbFix.peak as { round: number; testAccuracy: number };

export const BOOST_MAX = 200;
export const BOOST_LR = gbFix.generator.learningRate as number; // 0.3
export const BOOST_DEPTH = gbFix.generator.maxDepth as number; // 2

/** One 200-round booster, fit once. The rounds knob reads its first k trees, so adding a
 * round is a re-sum, not a refit — the sequence is already grown. */
export const FULL_BOOSTER: Booster = fitBooster(boostPoints, {
  nRounds: BOOST_MAX,
  maxDepth: BOOST_DEPTH,
  lr: BOOST_LR,
});

/** The held-out loss bottoms here — the round to stop at. */
export const bestRound = (() => {
  let best = boostByRounds[0];
  for (const r of boostByRounds) if (r.testLogLoss < best.testLogLoss) best = r;
  return best.rounds;
})();

export const roundsParam: ParamDef = {
  id: "rounds",
  label: "Boosting rounds",
  hint: "How many trees to add in sequence. Past the held-out loss's low point, more rounds overfit.",
  min: 1,
  max: BOOST_MAX,
  step: 1,
  default: 30,
};

export const gradientBoostingScenario = {
  id: "two-moons-boosted",
  title: "Shallow trees, one after another",
  prompt:
    "The same two moons. Drag Boosting rounds to add shallow trees one at a time — each fit to the errors the ensemble still makes. Watch the boundary sharpen as the training loss sinks toward zero. But keep an eye on the held-out loss curve: it bottoms out, then turns back up. Boosting descends so well it can descend right past the signal into the noise.",
};
