import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Bias–variance concept check. The misconceptions: that lower training error is
 * always better, that overfitting means "trained too long", and that more capacity
 * is free.
 */
export const biasVarianceCheck: ConceptCheck = {
  nodeId: "bias-variance",
  items: [
    {
      id: "test-error-shape",
      kind: "choice",
      prompt: "As you raise the degree, training error falls steadily toward zero. What does the validation error do?",
      options: [
        {
          label: "Falls, bottoms out, then climbs — a U",
          correct: true,
          feedback:
            "Right. Too stiff is bias (both errors high); too flexible is variance (training low, validation high); validation error is often lowest in between in this classical setting.",
        },
        {
          label: "Falls steadily too, just more slowly than training error",
          feedback:
            "Only at first. Once the model has enough flexibility to catch the real shape, the extra capacity chases noise and validation error turns back up — often a U in this setting.",
        },
        {
          label: "Stays flat — only training error responds to capacity",
          feedback:
            "Validation error responds strongly: it often falls, then climbs as the model starts memorizing noise. That climb is the whole reason the best degree is finite.",
        },
      ],
      difficulty: 2,
      targets: ["bv:u-shape"],
    },
    {
      id: "what-is-overfitting",
      kind: "choice",
      prompt: "A degree-12 fit has near-zero training error but high validation error. What's going wrong?",
      options: [
        {
          label: "The model memorized the training sample's noise, so it generalizes poorly — high variance",
          correct: true,
          feedback:
            "Exactly. The capacity went into threading every training point, including its noise, so the fit swings wildly between them and misses unseen data.",
        },
        {
          label: "It was trained too long; stopping earlier would fix it",
          feedback:
            "There's no training loop here — the fit is solved directly. Overfitting is about model capacity relative to the data, not training duration (though early stopping is one way to limit effective capacity).",
        },
        {
          label: "The training data is wrong — the model is fitting it correctly",
          feedback:
            "The model is fitting the training data too well, noise and all. The data is fine; the model has more flexibility than the data can justify.",
        },
      ],
      difficulty: 2,
      targets: ["bv:overfitting"],
    },
    {
      id: "more-data-predict",
      kind: "predict",
      setup: "A degree-12 model overfits this small dataset badly. Imagine you could collect ten times as many points.",
      prompt: "With far more training data, the same degree-12 model would…",
      options: [
        {
          label: "Overfit far less — more data pins the curve down, shrinking variance",
          correct: true,
          feedback:
            "Right. Variance falls as data grows (the fit can't swing as far when more points constrain it), so a bigger dataset lets you afford a more flexible model before it overfits.",
        },
        {
          label: "Overfit exactly as much — degree 12 is degree 12",
          feedback:
            "Capacity interacts with data size. The same degree overfits a small sample but can be well-justified by a large one — more data shrinks variance without touching bias.",
        },
        {
          label: "Underfit instead — more data makes models too cautious",
          feedback:
            "More data doesn't add bias. It often reduces estimation variance, so the overfit eases; with the model class held fixed, it generally won't flip a flexible model into underfitting.",
        },
      ],
      verify: "Conceptually: more data shrinks the variance term, easing the overfit at fixed capacity.",
      difficulty: 3,
      targets: ["bv:more-data"],
    },
    {
      id: "break-overfit",
      kind: "experiment-task",
      prompt: "Break it on purpose: raise the degree until the model overfits — training error near zero, validation error climbing.",
      taskEvent: "bias-variance:overfit",
      feedback:
        "You've driven the model past the sweet spot into pure memorization — a model that fits training data but performs poorly on held-out data. Now you know its shape.",
      difficulty: 1,
      targets: ["bv:break"],
    },
    {
      id: "transfer-which-fix",
      kind: "transfer",
      scenario:
        "A teammate's model scores 0.99 on the training set but 0.62 on held-out data. They're about to make the model bigger and train it harder to close the gap.",
      prompt:
        "From what the U taught you: which arm are they on, what should they do instead, and why would a bigger model make it worse? Write it in your own words.",
      open: {
        placeholder:
          "e.g. a near-perfect train score with a much lower test score is the … arm, so they should … not …",
        answer:
          "A near-perfect training score with a much lower validation score is a large train–validation gap — strong evidence of overfitting (variance), though split mismatch, leakage, or distribution differences can also widen the gap. Making the model bigger and training harder moves them further up the wrong arm, widening the gap. The fix is to reduce effective capacity (a simpler model, or regularization) or get more data, so the fit captures the shape instead of the noise. Underfitting would look different — high error on both train and validation — which isn't the case here.",
      },
      difficulty: 3,
      targets: ["bv:transfer"],
    },
  ],
};
