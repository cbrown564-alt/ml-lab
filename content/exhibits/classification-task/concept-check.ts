import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Classification-task concept check. The misconceptions: that accuracy is a safe
 * default, that there's a universal best threshold, and that precision and recall are
 * interchangeable.
 */
export const classificationTaskCheck: ConceptCheck = {
  nodeId: "classification-task",
  items: [
    {
      id: "why-accuracy-misleads",
      kind: "choice",
      prompt: "On the fraud data, a do-nothing model scored 95% accuracy. Why is accuracy alone inadequate here?",
      options: [
        {
          label: "95% of the points are negative, so predicting 'negative' always is right 95% of the time — and catches zero fraud",
          correct: true,
          feedback:
            "Right. Accuracy rewards the majority, and the majority is negative. A model that never fires matches the base rate while having zero recall — total failure on the class that matters.",
        },
        {
          label: "The accuracy was computed wrong; on imbalanced data you divide differently",
          feedback:
            "The arithmetic is fine — 57 of 60 correct really is 95%. The problem is what accuracy measures, not how it's computed: it can't see that all 3 misses are the important class.",
        },
        {
          label: "95% is actually a good score; the model just needs a little fine-tuning",
          feedback:
            "It's a terrible model dressed as a good score — it catches no fraud at all. The lesson is that accuracy hid that; recall (0) exposes it.",
        },
      ],
      difficulty: 2,
      targets: ["cls:imbalance"],
    },
    {
      id: "precision-vs-recall",
      kind: "choice",
      prompt: "A cancer screening test should be tuned for high recall. What does that prioritise, and at what cost?",
      options: [
        {
          label: "Prioritize high recall (sensitivity) while setting an acceptable limit on false positives — a missed cancer is worse than a follow-up test on a healthy person",
          correct: true,
          feedback:
            "Right. Recall is the share of real positives caught; for screening you want few missed cancers, accepting more false positives — as long as the downstream testing pathway can support that operating point.",
        },
        {
          label: "Making sure every positive prediction is correct, even if some cancers are missed",
          feedback:
            "That's precision, the opposite priority. For screening you'd rather a false alarm than a missed cancer, so you push recall up and tolerate lower precision.",
        },
        {
          label: "Maximising overall accuracy across both classes",
          feedback:
            "Accuracy is exactly the wrong target here — on rare disease it's dominated by the healthy majority. Screening optimises recall, accepting the precision cost.",
        },
      ],
      difficulty: 2,
      targets: ["cls:precision-recall"],
    },
    {
      id: "no-universal-threshold",
      kind: "predict",
      setup: "Two deployments of the same classifier: a cancer screen, and a spam filter that must never bin a real email.",
      prompt: "Should both use the same decision threshold?",
      options: [
        {
          label: "No — the screen lowers it (catch every case), the spam filter raises it (never lose a real email)",
          correct: true,
          feedback:
            "Right. The threshold encodes which error you can afford. A missed cancer is catastrophic, so lower it; a lost real email is unacceptable, so raise it. Same model, opposite thresholds.",
        },
        {
          label: "Yes — the optimal threshold is a property of the model, so it transfers",
          feedback:
            "The threshold isn't the model's property — it's your problem's. The same probabilities want different cutoffs depending on which mistake costs more.",
        },
        {
          label: "Yes — ½ is always optimal because it's unbiased",
          feedback:
            "A threshold of 0.5 is natural only when the score is a well-calibrated probability and the two error costs are treated as equal. Many deployments do not satisfy those assumptions.",
        },
      ],
      verify: "Conceptually: the threshold is set by the cost of each error, which differs by deployment.",
      difficulty: 3,
      targets: ["cls:threshold"],
    },
    {
      id: "break-imbalance",
      kind: "experiment-task",
      prompt: "Break it on purpose: on the imbalanced data, find a threshold where accuracy is ~95% but recall is zero — the model that does nothing and looks great.",
      taskEvent: "classification-task:accuracy-trap",
      feedback:
        "You've reproduced a common trap: a classifier that looks strong on accuracy and fails on the class that matters. The confusion matrix and recall are the antidote — don't trust accuracy alone on skewed classes.",
      difficulty: 1,
      targets: ["cls:break"],
    },
    {
      id: "transfer-metric",
      kind: "transfer",
      scenario:
        "A team ships a model to flag defective parts on an assembly line. 2% of parts are defective. They report 97% accuracy and call it a success; QA later finds defective parts are still shipping at the old rate.",
      prompt:
        "From the imbalance trap: what's wrong with '97% accuracy', what should they have reported, and why won't 'just get higher accuracy' fix it? Write it in your own words.",
      open: {
        placeholder:
          "e.g. with 2% defective, predicting 'good' always scores … so accuracy hides … they should report …",
        answer:
          "With only 2% of parts defective, a model that predicts 'good' every time already scores 98% — so 97% accuracy reflects the majority class, not skill at catching defects. Accuracy alone does not reveal recall. Report the confusion matrix, defective-class recall, and precision before deciding whether the model catches defects. Chasing higher accuracy favors the majority — you can hit 98% by flagging nothing while still shipping every defect. Using accuracy alone on imbalanced classes is the problem.",
      },
      difficulty: 3,
      targets: ["cls:transfer-imbalance"],
    },
  ],
};
