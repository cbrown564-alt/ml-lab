import type { Spine } from "@/lib/exhibit/spine";

/**
 * Regularisation spine: the penalty λ the fit takes at each beat — none (the
 * overfit wiggle) until the reveal, then a reining penalty. The committed
 * prediction sits on the-overfit beat: commit what turning λ up does to the wiggle
 * before stepping on to watch it relax.
 */
export type RegularizationFrame = { lambda: number };

export const overfittingRegularizationSpine: Spine<RegularizationFrame> = [
  {
    sectionId: "hook",
    frame: { lambda: 1e-4 },
    terms: [{ phrase: "Regularisation", hue: "param" }],
  },
  {
    sectionId: "the-overfit",
    frame: { lambda: 1e-4 },
    terms: [
      { phrase: "huge positive and negative values", hue: "error" },
      { phrase: "Training error is near zero", hue: "neutral" },
    ],
    predict: {
      prompt:
        "This degree-12 model is overfitting. Turn the penalty λ up — what happens to the frantic wiggle?",
      options: [
        {
          label: "It relaxes toward the smooth shape — the big weights shrink",
          correct: true,
          feedback:
            "Right. The penalty makes the giant coefficients pay their way; they can't, so they shrink and the curve smooths. Step on and watch it relax.",
        },
        {
          label: "Nothing — the degree is still 12, so it's still a wiggle",
          feedback:
            "The degree is unchanged, but the penalty shrinks the weights that draw the wiggles, so the curve smooths anyway. Step on and see.",
        },
        {
          label: "It gets wigglier — more pressure, more flexing",
          feedback:
            "The opposite — the penalty pushes weights toward zero, which *removes* wiggle. Step on and watch the curve calm down.",
        },
      ],
    },
  },
  {
    sectionId: "the-penalty",
    frame: { lambda: 0.3 },
    terms: [
      { phrase: "λ·Σwⱼ²", hue: "param" },
      { phrase: "they shrink", hue: "param" },
      { phrase: "the smooth shape", hue: "prediction" },
    ],
  },
  {
    sectionId: "the-sweet-spot",
    frame: { lambda: 0.3 },
    terms: [
      { phrase: "another U", hue: "error" },
      { phrase: "underfit", hue: "error" },
    ],
  },
  {
    sectionId: "two-flavours",
    frame: { lambda: 0.3 },
    terms: [
      { phrase: "L2, ridge", hue: "param" },
      { phrase: "L1, lasso", hue: "prediction" },
      { phrase: "added bias", hue: "error" },
    ],
  },
];
