import type { Spine } from "@/lib/exhibit/spine";

/**
 * The-gradient spine: where the See-it graphic places the point and whether it shows
 * the ascent or descent arrow at each beat. The committed prediction sits on the
 * perpendicular beat: commit how the arrow sits relative to the contour before stepping
 * on to see it cross the bands at a right angle.
 */
export type GradientFrame = { point: { x: number; y: number }; descent: boolean };

export const theGradientSpine: Spine<GradientFrame> = [
  {
    sectionId: "partial-derivatives",
    frame: { point: { x: -0.2, y: 1.4 }, descent: false },
    terms: [
      { phrase: "∂f/∂x", hue: "prediction" },
      { phrase: "∂f/∂y", hue: "prediction" },
    ],
  },
  {
    sectionId: "steepest-ascent",
    frame: { point: { x: -0.1, y: -0.1 }, descent: false },
    terms: [
      { phrase: "∇f = (∂f/∂x, ∂f/∂y)", hue: "prediction" },
      { phrase: "Steepest ascent", hue: "truth" },
    ],
  },
  {
    sectionId: "perpendicular",
    frame: { point: { x: 1.7, y: 1.5 }, descent: false },
    terms: [{ phrase: "a right angle", hue: "truth" }],
    predict: {
      prompt:
        "The gradient points uphill. Relative to the contour through the point — the band of equal-height neighbours — which way does the arrow point?",
      options: [
        {
          label: "Perpendicular to it — straight across the contour",
          correct: true,
          feedback:
            "Right. Along the contour the height doesn't change, so the steepest direction has to leave it as directly as possible — at a right angle. Step on and watch the arrow cross the bands square-on.",
        },
        {
          label: "Along it — following the contour line",
          feedback:
            "Along the contour the height is constant — that's the direction of *zero* slope, the opposite of steepest. The gradient runs across it, not along it. Step on and see.",
        },
        {
          label: "At 45° to it — splitting the difference",
          feedback:
            "It's exactly perpendicular, not 45°. The fastest way to gain height is to leave the level curve as directly as possible — straight across. Step on and look.",
        },
      ],
    },
  },
  {
    sectionId: "descent-and-zero",
    frame: { point: { x: 0.4, y: 0.2 }, descent: true },
    terms: [
      { phrase: "−∇f", hue: "param" },
      { phrase: "the zero vector", hue: "error" },
    ],
  },
];
