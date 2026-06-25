import type { Spine } from "@/lib/exhibit/spine";

/**
 * Feature scaling's story spine: which version of the input the surface shows at
 * each beat — raw (the stretched trough) until the reveal, then standardised (the
 * round bowl). The committed prediction sits on the-bowl beat: commit what
 * standardising will do to the surface before stepping on to watch it round out.
 */
export type FeatureScalingFrame = {
  scaling: "raw" | "standardised";
};

export const featureScalingSpine: Spine<FeatureScalingFrame> = [
  {
    sectionId: "hook",
    frame: { scaling: "raw" },
    terms: [{ phrase: "the surface", hue: "error" }],
  },
  {
    sectionId: "the-bowl",
    frame: { scaling: "raw" },
    terms: [
      { phrase: "the condition number", hue: "error" },
      { phrase: "steep one way and nearly flat the other", hue: "param" },
    ],
    predict: {
      prompt:
        "Standardise the input — subtract its mean, divide by its spread. Same data, new units. What happens to that long, thin bowl?",
      options: [
        {
          label: "It rounds out — equal steepness in every direction",
          correct: true,
          feedback:
            "Right. Centring kills the tilt, unit variance equalises the steepness, and the condition number drops near 1. Step on and watch the trough become a bowl.",
        },
        {
          label: "Nothing — it's the same data, so it's the same surface",
          feedback:
            "The data is the same, but the surface is drawn over the parameters, and rescaling the input rescales the curvature. Step on and watch it change shape.",
        },
        {
          label: "It stretches further — smaller numbers, narrower valley",
          feedback:
            "The opposite: equalising the input's spread equalises the curvature, so the valley widens into a round bowl. Step on and see.",
        },
      ],
    },
  },
  {
    sectionId: "the-crawl",
    frame: { scaling: "raw" },
    terms: [
      { phrase: "zig-zags", hue: "param" },
      { phrase: "a hundred steps", hue: "param" },
    ],
  },
  {
    sectionId: "standardise",
    frame: { scaling: "standardised" },
    terms: [
      { phrase: "a bowl", hue: "neutral" },
      { phrase: "often improves conditioning", hue: "error" },
      { phrase: "a few strides", hue: "param" },
    ],
  },
  {
    sectionId: "everywhere",
    frame: { scaling: "standardised" },
    terms: [{ phrase: "Standardising", hue: "prediction" }],
  },
];
