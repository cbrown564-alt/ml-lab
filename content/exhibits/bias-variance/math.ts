import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: the expected test error decomposes into bias², variance, and
 * irreducible noise. Complexity moves error between the first two; their sum is the
 * U. bias² tinted error-red (the stiffness cost), variance param-purple (the
 * flexibility cost).
 */
export const biasVarianceMath: MathDrawerContent = {
  nodeId: "bias-variance",
  invitation:
    "The U-shape isn't a coincidence — it's algebra. The error you'd see on average, over fresh training sets, splits into exactly three pieces, and the degree trades the first two against each other.",
  sections: [
    {
      id: "the-decomposition",
      heading: "Error splits in three",
      blocks: [
        {
          kind: "equation",
          lines: [
            "E[(y − f̂(x))²]  =  bias² + variance + σ²",
            "bias = E[f̂] − f        variance = E[(f̂ − E[f̂])²]",
          ],
          caption: "Expectation over the noise and the random training sample.",
          highlights: [
            { text: "bias²", hue: "error" },
            { text: "variance", hue: "param" },
            { text: "σ²", hue: "neutral" },
          ],
        },
      ],
    },
    {
      id: "the-tradeoff",
      heading: "Complexity trades one for the other",
      blocks: [
        {
          kind: "prose",
          text: "bias is how far the model's average prediction sits from the truth f — a stiff model is biased everywhere it can't bend. variance is how much the fit jitters when you resample the training data — a flexible model swings wildly to chase each new sample's noise. Raise the degree and bias falls but variance rises; the total, their sum plus the irreducible σ², is smallest in the middle. That middle is the U's floor.",
          highlights: [
            { text: "bias", hue: "error" },
            { text: "variance", hue: "param" },
            { text: "σ²", hue: "neutral" },
          ],
        },
        {
          kind: "prose",
          text: "More training data shrinks variance (the fit can't swing as far when more points pin it down) without touching bias — which is exactly why a bigger dataset lets you afford a more flexible model before it overfits.",
        },
      ],
    },
  ],
  mathNodeIds: [],
};
