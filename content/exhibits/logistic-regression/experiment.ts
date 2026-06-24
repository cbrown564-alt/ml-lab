import type { LabeledPoint } from "@/lib/models/logistic";
import fixtures from "@/lib/models/fixtures/logistic.json";

/**
 * Logistic-regression experiment data. Two classes in a 2-D plane with honest
 * overlap (the scipy-verified fixture). The lab's interaction is training — running
 * gradient descent on the log-loss and watching the boundary swing into place — so
 * the spec just supplies the points and the framing.
 */
export const logisticPoints = fixtures.points as LabeledPoint[];

export const logisticRegressionScenario = {
  id: "two-blobs",
  title: "Two classes, one line",
  prompt:
    "Two clouds of points — class 0 in amber, class 1 in blue — with a band of overlap where they mingle. Press Train and watch gradient descent swing a line into the gap until it separates them as cleanly as the overlap allows. The shaded field is the model's confidence: deep colour where it's sure, pale at the boundary where it's only guessing.",
};
