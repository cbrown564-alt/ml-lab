import type { Spine } from "@/lib/exhibit/spine";

/**
 * Linear regression's story spine: which scenario and error view the graphic
 * takes at each beat, the key terms coloured to match the canvas, and the
 * equation composed beside the figure when it is the point.
 */

export type LinearRegressionFrame = {
  /** Scenario the graphic loads when this beat reaches centre. */
  scenarioId: string;
  /** How the errors are drawn at this beat. */
  errorView: "lines" | "squares" | "hidden";
};

export const linearRegressionSpine: Spine<LinearRegressionFrame> = [
  {
    sectionId: "hook",
    frame: { scenarioId: "first-fit", errorView: "hidden" },
    terms: [
      { phrase: "gold dot", hue: "truth" },
      { phrase: "the blue line", hue: "prediction" },
    ],
  },
  {
    sectionId: "the-residuals",
    frame: { scenarioId: "first-fit", errorView: "lines" },
    terms: [
      { phrase: "residual", hue: "error" },
      { phrase: "the line", hue: "prediction" },
    ],
  },
  {
    sectionId: "squared-error",
    frame: { scenarioId: "first-fit", errorView: "squares" },
    equation: "L(w, b) = (1/n) · Σ (w·xᵢ + b − yᵢ)²",
    terms: [
      { phrase: "squares", hue: "error" },
      { phrase: "squared error", hue: "error" },
      { phrase: "the penalty", hue: "error" },
    ],
  },
  {
    sectionId: "the-outlier",
    frame: { scenarioId: "tyranny-of-the-outlier", errorView: "squares" },
    terms: [
      { phrase: "Two rogue points", hue: "error" },
      { phrase: "The biggest square", hue: "error" },
      { phrase: "the outliers", hue: "error" },
    ],
  },
  {
    sectionId: "closed-form",
    frame: { scenarioId: "first-fit", errorView: "hidden" },
    equation: "w* = Σ (xᵢ − x̄)(yᵢ − ȳ) / Σ (xᵢ − x̄)²",
    terms: [
      { phrase: "the best line", hue: "prediction" },
      { phrase: "downhill", hue: "param" },
    ],
  },
];
