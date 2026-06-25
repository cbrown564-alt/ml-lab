import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Logistic regression as linear regression's closest cousin: the same linear score,
 * bent through the sigmoid into a probability and split by one line. The maths
 * (log-loss + its gradient) arrives in Run it.
 */
export const logisticRegressionNarrative: ExhibitNarrative = {
  nodeId: "logistic-regression",
  hook: [
    "Linear regression draws a line through data to predict a number. But often the answer isn't a number — it's a which-one: spam or not, benign or malignant, click or no click. You need a model that outputs a class, and, better, an estimated probability of that class.",
    "Logistic regression is that model — and it's linear regression's closest cousin. The same linear score, bent through one function into a probability, and split by one line.",
  ],
  story: [
    {
      id: "the-sigmoid",
      heading: "A linear score, squashed",
      paragraphs: [
        "Start with the familiar: a linear score z = b + w₁x₁ + w₂x₂, a number running from minus to plus infinity. That can't be a probability. So pass it through the sigmoid, σ(z) = 1 / (1 + e^−z), which squashes any number into the open interval (0, 1). Now it reads as P(class 1).",
        "The shape does the work: far from the boundary the score is large and σ saturates near 0 or 1 — the model is confident. At z = 0 the model assigns probability 0.5, its point of maximum uncertainty. The further a point sits from the dividing line, the surer the model.",
      ],
    },
    {
      id: "the-boundary",
      heading: "One line splits the plane",
      paragraphs: [
        "Where is the model 50/50? Where z = 0 — and z = 0 is a straight line in the feature plane. At a 0.5 threshold, that line is the decision boundary: on one side the score is positive and the model predicts class 1, on the other it predicts class 0. With linear features, logistic regression decides with that single straight boundary.",
      ],
    },
    {
      id: "training",
      heading: "Gradient descent finds the line",
      paragraphs: [
        "Which line? With a suitable optimizer and learning rate, training searches for the boundary that minimizes log-loss — punishing a confident wrong answer far more than a hesitant one. Gradient descent, the same walk from the regression cluster, swings the boundary into the gap between the classes until moving it further would only make the fit worse.",
      ],
    },
    {
      id: "probabilities",
      heading: "Confidence, not just a verdict",
      paragraphs: [
        "The payoff is the shaded field: not a hard label but an estimated probability everywhere. Deep color far from the line where the model is sure; pale near the boundary where the classes mingle and it's barely guessing. Where the two clouds overlap, a few points sit on the wrong side — and a linear boundary cannot separate all overlapping or curved cases. The model is as honest as the data allows, and it shows where it isn't sure.",
      ],
    },
  ],
  fieldNotes: [
    "Train on log-loss, not accuracy: accuracy is flat and full of ties (it can't tell a barely-right answer from a confidently-right one), so it gives gradient descent nothing to descend. Log-loss is smooth and rewards well-calibrated confidence when calibration holds — then report the metric or set of metrics that matches the decision.",
    "The boundary is straight because the score is linear in the features. For a curved boundary, add features (x₁², x₁x₂, …) or reach for a model that bends — logistic regression draws the best straight line, no more.",
  ],
};
