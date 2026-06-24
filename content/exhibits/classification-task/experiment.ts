/**
 * Classification-task framing. The exhibit reuses the logistic classifier's
 * probabilities (the same two-blob fixture) and makes the *decision* the object of
 * study: a threshold turns probabilities into classes, and where you put it trades
 * precision against recall. The data + fitted model are loaded by the lab.
 */
export const classificationTaskScenario = {
  id: "the-threshold",
  title: "Where do you draw the line?",
  prompt:
    "The classifier gives every point a probability of being class 1. To actually decide, you pick a threshold — predict class 1 above it, class 0 below. Drag the threshold and watch the confusion matrix re-count: raise it and you make fewer, surer positive calls (precision up, recall down); lower it and you catch more positives but let false alarms through. There is no single right line — only the trade your problem can afford.",
};
