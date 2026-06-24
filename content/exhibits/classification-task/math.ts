import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: precision and recall are two readings of the confusion matrix, F1
 * their harmonic mean, and the cost of each error sets the optimal threshold.
 * precision tinted prediction-blue, recall param-purple.
 */
export const classificationTaskMath: MathDrawerContent = {
  nodeId: "classification-task",
  invitation:
    "Precision and recall aren't rival scores — they're the confusion matrix read two ways, down a column and across a row. And the right threshold falls straight out of what each mistake costs.",
  sections: [
    {
      id: "two-readings",
      heading: "Two readings of one matrix",
      blocks: [
        {
          kind: "equation",
          lines: [
            "precision = TP / (TP + FP)        recall = TP / (TP + FN)",
            "F1 = 2·precision·recall / (precision + recall)",
          ],
          caption: "Precision divides down the predicted-positive column; recall across the actual-positive row. F1 is their harmonic mean — high only when both are.",
          highlights: [
            { text: "precision", hue: "prediction" },
            { text: "recall", hue: "param" },
          ],
        },
      ],
    },
    {
      id: "the-cost",
      heading: "The cost picks the threshold",
      blocks: [
        {
          kind: "prose",
          text: "Raising the threshold moves points from predicted-1 to predicted-0: false positives fall, false negatives rise. If a false negative costs c_FN and a false positive costs c_FP, the best threshold is the one that minimises c_FN·FN + c_FP·FP. When a miss is far costlier than a false alarm (a treatable disease), c_FN dominates and you lower the threshold; when the reverse holds (flagging good transactions as fraud), you raise it.",
          highlights: [{ text: "false negatives rise", hue: "param" }],
        },
        {
          kind: "prose",
          text: "To compare classifiers before fixing a threshold at all, sweep it and trace the ROC curve — true-positive rate against false-positive rate — and summarise it with the area underneath, AUC. AUC is the probability that the model scores a random positive above a random negative: a threshold-free measure of how well it ranks.",
        },
      ],
    },
  ],
  mathNodeIds: [],
};
