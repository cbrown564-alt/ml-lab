import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Classification-task failure gallery. The signature failure is accuracy on
 * imbalanced data (the live trap); the others are the threshold chosen against the
 * wrong cost, and a single headline metric hiding the matrix.
 */
export const classificationTaskFailures: FailureGallery = {
  nodeId: "classification-task",
  cards: [
    {
      id: "accuracy-on-imbalance",
      primitive: "class-imbalance",
      title: "High accuracy, zero recall",
      trigger: "Report accuracy on a dataset where one class is rare (fraud, a rare disease), or tune the threshold to maximise it.",
      symptom: "A model that predicts the majority class for everything scores ~95%+ accuracy while catching none of the rare positives — recall 0.",
      diagnosis: "Accuracy alone is inadequate here: it rewards getting the majority right, and the majority is negative, so it hides total failure on the class you actually care about.",
      repair: "Judge with recall, precision, F1, and the confusion matrix; resample or reweight during training, or move the threshold at decision time to surface the rare class.",
      boundary: "On balanced classes where both errors cost the same, accuracy is a perfectly reasonable summary — the trap is specifically imbalance.",
    },
    {
      id: "wrong-cost-threshold",
      primitive: "threshold-choice",
      title: "The threshold that ignores the cost",
      trigger: "Pick the decision threshold by maximising accuracy (or just leave it at ½), regardless of what each error costs.",
      symptom: "The deployed model makes the cheap mistake rarely and the expensive one often — e.g. missing cancers to avoid false alarms.",
      diagnosis: "The accuracy-optimal threshold treats a false negative and a false positive as equally bad; real problems rarely do. Which mistake actually costs more here?",
      repair: "Set the threshold from the cost ratio — lower it when a miss is costlier (screening), raise it when a false alarm is (blocking good transactions).",
      boundary: "When the two errors genuinely cost the same, the accuracy-optimal threshold is the right one — there's just no free lunch in pretending costs are equal when they aren't.",
    },
  ],
};
