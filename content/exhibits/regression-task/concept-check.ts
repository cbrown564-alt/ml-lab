import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Regression-task concept check. Misconceptions: that accuracy is a universal metric,
 * that a regression task is defined by its model rather than its target, and that
 * "off by a little" is a failure rather than the normal, scored outcome.
 */
export const regressionTaskCheck: ConceptCheck = {
  nodeId: "regression-task",
  items: [
    {
      id: "why-accuracy-arbitrary",
      kind: "choice",
      prompt: "Scoring the good model by accuracy, the number swung from a quarter to 100% as you slid the “close enough” band. Why is that damning?",
      options: [
        {
          label: "Accuracy on a continuous target depends on an arbitrary cutoff unless the tolerance is defined by the real decision before evaluation — so the score can be whatever band you pick",
          correct: true,
          feedback:
            "Right. “Correct” needs a threshold the data doesn't supply; choose it after the fact and you choose the score. A clinically or commercially meaningful tolerance can be a valid secondary metric, but it isn't a universal default.",
        },
        {
          label: "The model genuinely got better as the band widened",
          feedback:
            "The model never changed — only the ruler did. Widening the band just relabels more near-misses as “correct”; the predictions are identical. That's exactly why the metric is untrustworthy.",
        },
        {
          label: "The band should always be set as wide as possible for a fair score",
          feedback:
            "A wide band flatters every model into looking perfect — it's not fairer, it's emptier. The fix isn't a better band, it's a metric that needs none: distance.",
        },
      ],
      difficulty: 2,
      targets: ["rt:accuracy-arbitrary"],
    },
    {
      id: "what-makes-regression",
      kind: "choice",
      prompt: "What makes a supervised problem a regression task rather than a classification one?",
      options: [
        {
          label: "The target is a continuous quantity, so a prediction is scored by how far off it is, not simply right or wrong",
          correct: true,
          feedback:
            "Right. The target's type defines the task: continuous → regression → distance-based metrics; categorical → classification → error-type metrics. The model you choose comes after.",
        },
        {
          label: "Regression uses a straight line and classification uses curves",
          feedback:
            "The shape of the model isn't what defines the task — both can be linear or curved. It's the target: continuous (regression) vs categorical (classification).",
        },
        {
          label: "Regression needs more features than classification",
          feedback:
            "Feature count is unrelated. The defining difference is the kind of answer you're predicting — a number versus a label.",
        },
      ],
      difficulty: 1,
      targets: ["rt:definition"],
    },
    {
      id: "binarise-predict",
      kind: "predict",
      setup: "A team predicting exact recovery days reframes it as “recovers within a week: yes/no” to make the metric simpler.",
      prompt: "What do they lose by collapsing the continuous target into a yes/no?",
      options: [
        {
          label: "The magnitude — predicting 8 days and 30 days both become “no”, so near-misses and disasters look identical",
          correct: true,
          feedback:
            "Right. Binarising discards how-much information and makes everything hostage to the one-week cutoff. If the decision needs the number of days, keep it continuous.",
        },
        {
          label: "Nothing — yes/no carries the same information more simply",
          feedback:
            "It carries strictly less: every distinction within “yes” and within “no” is erased. 8 days and 30 days are both “no”, which the original number kept apart.",
        },
        {
          label: "Accuracy — you can no longer compute accuracy on a yes/no target",
          feedback:
            "Accuracy is exactly what you can compute on yes/no. What you lose is the magnitude the continuous target carried — and you inherit an arbitrary cutoff.",
        },
      ],
      verify: "Binarising a continuous target discards magnitude and forces an arbitrary threshold.",
      difficulty: 2,
      targets: ["rt:binarise"],
    },
    {
      id: "break-metric-mismatch",
      kind: "experiment-task",
      prompt: "Break it on purpose: score the good model by accuracy and slide the tolerance band — watch the score swing to whatever you choose — before switching to distance, which doesn't budge.",
      taskEvent: "regression-task:metric-mismatch",
      feedback:
        "You've seen why the metric has to match the target: accuracy on a continuous answer is arbitrary — any value the band allows — while distance is fixed and honest.",
      difficulty: 1,
      targets: ["rt:break"],
    },
    {
      id: "transfer-wrong-metric",
      kind: "transfer",
      scenario:
        "A house-price model is reported as “3% accurate”. Digging in, that means 3% of predictions were within $1,000 of the sale price; by average error it's off by about $9,000 on $400,000 homes.",
      prompt:
        "What's gone wrong with how this model is being judged, and what would you report instead? Write it in your own words.",
      open: {
        placeholder:
          "e.g. price is continuous, so 'accuracy within $1,000' is… the honest number is…",
        answer:
          "Price is a continuous target, so judging it right-or-wrong against a $1,000 band is the wrong frame — the '3% accurate' figure is an artifact of an arbitrarily tight threshold (widen the band and you can report any 'accuracy' you like). Regression is judged on distance, not a verdict. The more interpretable summary is the average miss — mean absolute error, ~$9,000, ideally as a percentage of price (~2% on $400k homes) — but whether that is good enough depends on the baseline and the decision the estimate supports.",
      },
      difficulty: 3,
      targets: ["rt:transfer-metric"],
    },
  ],
};
