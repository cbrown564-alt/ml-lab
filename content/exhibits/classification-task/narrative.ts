import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * The classification task: a probability isn't a decision until you pick a threshold,
 * and where you put it trades precision against recall. Accuracy alone hides the
 * trade. The confusion matrix and the metrics arrive on screen, driven by the slider.
 */
export const classificationTaskNarrative: ExhibitNarrative = {
  nodeId: "classification-task",
  hook: [
    "A classifier hands you a score; some models provide an estimated probability: this email is 0.73 spam, this scan is 0.12 tumor. But a score isn't an action — at some point you have to decide. Drawing that line is its own task, separate from training the model, and it's where much of the real-world judgment lives.",
    "Here are the classifier's probabilities, fixed. Everything you change now is the decision, not the model — and watch how much rides on it.",
  ],
  story: [
    {
      id: "the-threshold",
      heading: "A probability isn't a decision",
      paragraphs: [
        "Every point has a predicted score (or estimated probability) of being class 1. To act, you choose a threshold: call it class 1 above the line, class 0 below. Set it at ½ and you've made the obvious choice — but ½ is a choice, not a law. Slide the line and every point near it flips its verdict, even though the model never moved.",
      ],
    },
    {
      id: "the-tradeoff",
      heading: "Precision and recall pull apart",
      paragraphs: [
        "Raise the threshold and you only call a point positive when you're very sure. Your positive calls get more reliable — precision often rises — but you also miss the borderline true cases, so recall falls. Lower the threshold and it reverses: you catch nearly every positive (high recall) at the cost of false alarms (low precision). Changing the threshold usually trades one against the other, and the threshold is the dial between them.",
      ],
    },
    {
      id: "the-matrix",
      heading: "Four outcomes, not one number",
      paragraphs: [
        "Every decision lands in one of four boxes: a true positive (caught it), a false positive (false alarm), a false negative (missed it), or a true negative (correctly cleared). That's the confusion matrix, and precision and recall are just two different ways of reading it — precision down a column, recall across a row. Accuracy compresses all four into one number and can hide the distinctions that matter.",
      ],
    },
    {
      id: "choosing",
      heading: "Which mistake can you afford?",
      paragraphs: [
        "There is no universal right threshold — it depends on what a mistake costs, prevalence, probability calibration, operational capacity, and downstream consequences. Screening for a deadly but treatable disease, a missed case (false negative) is far worse than a false alarm, so you lower the threshold and accept the false positives. Flagging fraud on legitimate purchases, the reverse. The model gives you the scores; choosing the threshold is where your problem's values enter the math.",
      ],
    },
  ],
  fieldNotes: [
    "Accuracy alone is inadequate on imbalanced data: if 99% of transactions are legitimate, a model that flags nothing scores 99% accuracy and catches zero fraud. Precision, recall, and the confusion matrix expose what that single number hides — look at them on skewed classes.",
    "To compare classifiers without committing to a threshold, sweep it: the ROC curve (true-positive vs false-positive rate) and its area, AUC, summarise performance across every threshold at once. Pick the operating point afterward, from the cost of each error.",
  ],
};
