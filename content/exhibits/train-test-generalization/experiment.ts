import type { Point } from "@/lib/models/linear-regression";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * Train/test experiment data: one pooled set of points (the regression cluster's
 * train + test fixtures, combined) that the lab splits live. The model is a fixed
 * degree-6 polynomial — flexible enough that the train/test gap is real — so the only
 * thing the learner changes is the split, and how it's scored.
 */
export const pooledPoints: Point[] = [...(fixtures.train as Point[]), ...(fixtures.test as Point[])];

export const TT_DEGREE = 8;

export const trainTestScenario = {
  id: "the-split",
  title: "Score it on what it hasn't seen",
  prompt:
    "Here is one pool of points. The model is fit on the gold training points and scored on the hollow held-out ones — the only honest test. Press Reshuffle to draw a new random split and watch the test error jump around while the training error barely moves: a single split is a lottery. Then read the cross-validation score, which averages over every fold to pin the number down.",
};
