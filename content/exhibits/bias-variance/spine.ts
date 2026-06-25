import type { Spine } from "@/lib/exhibit/spine";

/**
 * Bias–variance spine: the degree the fit takes at each beat — stiff line (1),
 * frantic wiggle (12), the sweet spot (4). The committed prediction sits on the
 * underfit beat: training error only falls, so commit what the test error does
 * before stepping on to watch the U appear.
 */
export type BiasVarianceFrame = { degree: number };

export const biasVarianceSpine: Spine<BiasVarianceFrame> = [
  {
    sectionId: "hook",
    frame: { degree: 1 },
    terms: [
      { phrase: "the points you trained on", hue: "truth" },
      { phrase: "points you held back", hue: "neutral" },
    ],
  },
  {
    sectionId: "underfit",
    frame: { degree: 1 },
    terms: [{ phrase: "bias", hue: "error" }],
    predict: {
      prompt:
        "As you crank the degree up, the training error keeps falling toward zero. What does the test error — on points the model never saw — do?",
      options: [
        {
          label: "Falls too, just more slowly — more flexibility is always better",
          feedback:
            "It falls at first, but only at first. Once the model has enough flexibility to catch the real shape, the extra capacity starts chasing noise and test error turns back up. Step on and watch.",
        },
        {
          label: "Drops, bottoms out, then climbs again — a U",
          correct: true,
          feedback:
            "Exactly. Too stiff is bias, too flexible is variance, and validation error is often lowest in between. Step on and watch the U appear.",
        },
        {
          label: "Stays flat — test error doesn't care about degree",
          feedback:
            "It cares a great deal — that's the whole tradeoff. Step on and watch test error fall, then climb as the curve starts memorising noise.",
        },
      ],
    },
  },
  {
    sectionId: "overfit",
    frame: { degree: 12 },
    terms: [
      { phrase: "the training error keeps dropping", hue: "neutral" },
      { phrase: "memorised the sample", hue: "error" },
    ],
  },
  {
    sectionId: "the-sweet-spot",
    frame: { degree: 4 },
    terms: [
      { phrase: "Training error only ever falls", hue: "neutral" },
      { phrase: "test error", hue: "error" },
      { phrase: "Lowest in the middle", hue: "prediction" },
    ],
  },
  {
    sectionId: "decomposition",
    frame: { degree: 4 },
    terms: [
      { phrase: "bias²", hue: "error" },
      { phrase: "variance", hue: "param" },
    ],
  },
];
