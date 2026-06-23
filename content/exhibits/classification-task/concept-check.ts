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
      prompt: "On the fraud data, a do-nothing model scored 95% accuracy. Why is that accuracy meaningless?",
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
          label: "Catching as many true cancers as possible (few false negatives), accepting more false alarms (lower precision)",
          correct: true,
          feedback:
            "Right. Recall is the share of real positives caught; maximising it means missing few cancers, at the cost of more false positives (follow-up tests on healthy people) — the right trade when a miss is deadly.",
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
            "½ is only optimal when the two errors cost the same and the classes are balanced. Neither holds here, so each deployment needs its own threshold.",
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
        "You've reproduced the single most common way a classifier 'works' on paper and fails in the world. The confusion matrix and recall are the antidote — never trust accuracy alone on skewed classes.",
      difficulty: 1,
      targets: ["cls:break"],
    },
    {
      id: "transfer-metric",
      kind: "transfer",
      scenario:
        "A team ships a model to flag defective parts on an assembly line. 2% of parts are defective. They report 97% accuracy and call it a success; QA later finds defective parts are still shipping at the old rate.",
      prompt: "From the imbalance trap, what's wrong, and what should they have reported?",
      options: [
        {
          label:
            "97% accuracy just reflects the 98% good parts — they should report recall on defects (and precision), which is likely near zero",
          correct: true,
          feedback:
            "That's the transfer: with 2% defective, predicting 'good' always scores 98%. The headline accuracy hid that the model catches almost no defects — recall on the defective class is the number that matters.",
        },
        {
          label: "The model needs higher accuracy — retrain until it exceeds 99%",
          feedback:
            "Chasing accuracy chases the majority. They could hit 99% by flagging nothing and still ship every defect. Recall on defects, not accuracy, is the target.",
        },
        {
          label: "Accuracy is fine; the real issue is the 2% defect rate being too high",
          feedback:
            "The defect rate is the problem to detect, not the metric's flaw. The reporting error is using accuracy on imbalanced classes — recall would have exposed the failure before shipping.",
        },
      ],
      difficulty: 3,
      targets: ["cls:transfer-imbalance"],
    },
  ],
};
