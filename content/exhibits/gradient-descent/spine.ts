import type { Spine } from "@/lib/exhibit/spine";

/**
 * Gradient descent's story spine: which scenario runs and whether the graphic
 * shows the line learning (scatter + training curve) or the loss surface it is
 * crossing, beat by beat. The fog lifts at "the-landscape"; the
 * two failure regimes each load their scenario and stay on the surface so the
 * crawl and the explosion are legible as paths on the map.
 */

export type GradientDescentFrame = {
  /** Scenario the descent loads when this beat reaches centre. */
  scenarioId: string;
  /** Which face of the graphic this beat shows. */
  view: "line" | "surface";
  /** Freeze one update and show the step microscope decomposition. */
  microscope?: boolean;
};

export const gradientDescentSpine: Spine<GradientDescentFrame> = [
  {
    sectionId: "hook",
    frame: { scenarioId: "watch-it-learn", view: "line" },
    terms: [
      { phrase: "the steepest downhill direction", hue: "param" },
      { phrase: "its loss", hue: "error" },
    ],
  },
  {
    sectionId: "the-landscape",
    frame: { scenarioId: "watch-it-learn", view: "surface" },
    terms: [
      { phrase: "the loss", hue: "error" },
      { phrase: "the valley", hue: "neutral" },
      { phrase: "the gradient", hue: "param" },
      { phrase: "the purple path", hue: "param" },
    ],
  },
  {
    sectionId: "slope-step-repeat",
    frame: { scenarioId: "watch-it-learn", view: "surface", microscope: true },
    equation: "θ ← θ − α · ∇L(θ)",
    terms: [
      { phrase: "the gradient", hue: "param" },
      { phrase: "the learning rate", hue: "param" },
      { phrase: "the loss curve", hue: "error" },
    ],
    predict: {
      prompt:
        "Bigger steps cover ground faster. So if you double a learning rate that already converges, after a few hundred steps the loss will be…",
      options: [
        {
          label: "Lower, sooner — twice the stride, half the time",
          feedback:
            "True right up until the stride crosses this surface's stability limit. Past it, every step overshoots more than it gains. Step on and meet both edges.",
        },
        {
          label: "Either far better or far worse — there's a cliff, not a dial",
          correct: true,
          feedback:
            "Right — below a critical step size it converges; above it, each step lands higher than the last and the loss explodes. You're predicting a threshold, not a slope.",
        },
        {
          label: "About the same — it converges either way",
          feedback:
            "Not quite — there's a hard edge between converging and exploding. Step on and you'll cross it.",
        },
      ],
    },
  },
  {
    sectionId: "too-timid",
    frame: { scenarioId: "too-timid", view: "surface" },
    terms: [
      { phrase: "the learning rate", hue: "param" },
      { phrase: "the dot", hue: "param" },
    ],
  },
  {
    sectionId: "over-the-edge",
    frame: { scenarioId: "over-the-edge", view: "surface" },
    terms: [
      { phrase: "the valley", hue: "neutral" },
      { phrase: "The loss", hue: "error" },
      { phrase: "divergence", hue: "error" },
    ],
  },
  {
    sectionId: "the-one-knob",
    frame: { scenarioId: "watch-it-learn", view: "line" },
    terms: [
      { phrase: "the learning rate", hue: "param" },
      { phrase: "the stride", hue: "param" },
    ],
  },
];
