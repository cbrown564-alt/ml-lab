import type { Spine } from "@/lib/exhibit/spine";

/**
 * Regression-task spine: the See-it graphic shows the same data as a regression problem
 * (continuous score, a residual) or a classification problem (split at the pass line,
 * coloured by class). The committed prediction sits on the contrast beat: commit how the
 * error is scored once the target is a category, before the reveal.
 */
export type RegressionTaskFrame = { mode: "anatomy" | "regression" | "classification" };

export const regressionTaskSpine: Spine<RegressionTaskFrame> = [
  {
    sectionId: "anatomy",
    frame: { mode: "anatomy" },
    terms: [
      { phrase: "features", hue: "neutral" },
      { phrase: "a continuous quantity", hue: "truth" },
    ],
  },
  {
    sectionId: "distance",
    frame: { mode: "regression" },
    terms: [
      { phrase: "the distance", hue: "error" },
      { phrase: "total of those distances", hue: "error" },
    ],
  },
  {
    sectionId: "classification-contrast",
    frame: { mode: "classification" },
    terms: [
      { phrase: "pass or fail", hue: "prediction" },
      { phrase: "error types and costs", hue: "truth" },
    ],
    predict: {
      prompt:
        "Split the scores at the pass line and the target becomes a category — pass or fail. How is a prediction's error now scored?",
      options: [
        {
          label: "Right or wrong — by accuracy",
          correct: true,
          feedback:
            "Right. With a categorical target there's no “distance” to a label — a guess simply matches or it doesn't, and accuracy counts the matches. That's classification.",
        },
        {
          label: "Still by distance — how many points off",
          feedback:
            "Distance is the regression score. Once the answer is a category, “4 points off” has no meaning — pass-vs-fail is right or wrong. The metric has to match the target's type.",
        },
        {
          label: "It can't be scored without the original numbers",
          feedback:
            "It can — you compare predicted class to true class and count agreement. That's accuracy, the natural metric once the target is categorical.",
        },
      ],
    },
  },
  {
    sectionId: "framing-first",
    frame: { mode: "regression" },
    terms: [
      { phrase: "predict a number", hue: "prediction" },
      { phrase: "evaluate the size of the errors", hue: "error" },
    ],
  },
];
