import type { Spine } from "@/lib/exhibit/spine";
import type { LossKind } from "@/lib/models/loss-functions";

/**
 * Loss functions' story spine: which dataset and which judge the graphic shows at
 * each beat, and whether all three verdicts are drawn at once (showAll) or one is
 * emphasised. The committed prediction sits on the penalty-shapes beat — commit
 * which line a far point pulls hardest, then step on and watch it tilt.
 */
export type LossFunctionsFrame = {
  scenarioId: string;
  judge: LossKind;
  /** Draw all three fitted lines, the chosen one emphasised. */
  showAll: boolean;
};

export const lossFunctionsSpine: Spine<LossFunctionsFrame> = [
  {
    sectionId: "hook",
    frame: { scenarioId: "meet-the-judges", judge: "squared", showAll: true },
    terms: [
      { phrase: "a loss function", hue: "error" },
      { phrase: "the line", hue: "prediction" },
    ],
  },
  {
    sectionId: "penalty-shapes",
    frame: { scenarioId: "meet-the-judges", judge: "squared", showAll: true },
    terms: [
      { phrase: "Squared error", hue: "error" },
      { phrase: "Absolute error", hue: "param" },
      { phrase: "Huber", hue: "prediction" },
    ],
    predict: {
      prompt:
        "Given those shapes — squared rockets up, absolute and Huber stay gentle — which line will a single far-off point pull hardest?",
      options: [
        {
          label: "The squared-error line — its penalty for a far miss is enormous",
          correct: true,
          feedback:
            "Right. The square of a big miss dwarfs everything else, so the squared line lunges to reduce it. Step on and watch it tilt off the trend.",
        },
        {
          label: "The absolute-error line — it treats every point the same",
          feedback:
            "A far point's influence grows linearly rather than quadratically — so the absolute-error line won't lunge the way squared error does. Step on and see which line actually moves.",
        },
        {
          label: "All three move the same — it's the same data",
          feedback:
            "Same data, but not the same judge. The shapes differ in the tail, so the lines diverge out there. Step on and watch them split.",
        },
      ],
    },
  },
  {
    sectionId: "the-vote",
    frame: { scenarioId: "meet-the-judges", judge: "squared", showAll: false },
    terms: [
      { phrase: "squared error", hue: "error" },
      { phrase: "the squared-error line", hue: "prediction" },
    ],
  },
  {
    sectionId: "robust-judges",
    frame: { scenarioId: "meet-the-judges", judge: "huber", showAll: true },
    terms: [
      { phrase: "absolute error or Huber", hue: "param" },
      { phrase: "the trend", hue: "prediction" },
    ],
  },
  {
    sectionId: "choosing",
    frame: { scenarioId: "meet-the-judges", judge: "huber", showAll: true },
    terms: [{ phrase: "Huber", hue: "prediction" }],
  },
];
