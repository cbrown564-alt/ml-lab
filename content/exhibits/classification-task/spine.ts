import type { Spine } from "@/lib/exhibit/spine";

/**
 * Classification-task spine: the decision threshold each beat asserts — ½ to
 * introduce it, raised to reveal the precision↑/recall↓ trade, then both extremes to
 * show the full range. The committed prediction sits on the-threshold beat: commit
 * what raising the threshold does to recall before stepping on to watch it fall.
 */
export type ClassificationFrame = { threshold: number };

export const classificationTaskSpine: Spine<ClassificationFrame> = [
  {
    sectionId: "the-threshold",
    frame: { threshold: 0.5 },
    terms: [
      { phrase: "a threshold", hue: "neutral" },
      { phrase: "½ is a choice, not a law", hue: "error" },
    ],
    predict: {
      prompt:
        "Raise the threshold so the model only calls a point positive when it's very sure. What happens to recall — the share of actual positives it catches?",
      options: [
        {
          label: "Recall falls — being choosier means missing the borderline true cases",
          correct: true,
          feedback:
            "Right. A higher bar lets fewer positives through, so you miss the marginal true ones — recall drops even as precision climbs. Step on and watch the false negatives pile up.",
        },
        {
          label: "Recall rises — a stricter threshold makes the model more careful and correct",
          feedback:
            "Carefulness raises precision, not recall. By demanding more certainty you reject borderline true positives too, so recall falls. Step on and see.",
        },
        {
          label: "Recall is unchanged — the threshold only affects accuracy",
          feedback:
            "Recall is exactly what the threshold moves: raise it and actual positives below the line become false negatives. Step on and watch recall drop.",
        },
      ],
    },
  },
  {
    sectionId: "the-tradeoff",
    frame: { threshold: 0.85 },
    terms: [
      { phrase: "precision often rises", hue: "prediction" },
      { phrase: "recall falls", hue: "param" },
      { phrase: "in opposition", hue: "error" },
    ],
  },
  {
    sectionId: "the-matrix",
    frame: { threshold: 0.5 },
    terms: [
      { phrase: "the confusion matrix", hue: "neutral" },
      { phrase: "a single accuracy", hue: "error" },
    ],
  },
  {
    sectionId: "choosing",
    frame: { threshold: 0.15 },
    terms: [
      { phrase: "what a mistake costs", hue: "error" },
      { phrase: "your problem's values", hue: "prediction" },
    ],
  },
];
