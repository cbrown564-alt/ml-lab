import type { MathDrawerContent } from "@/lib/narrative/math";
import { nextTokenPinned } from "./experiment";

export const transformerMath: MathDrawerContent = {
  nodeId: "the-transformer",
  invitation:
    "One block and six candidate tokens here — production stacks repeat the same block dozens of times over tens of thousands of vocabulary entries.",
  sections: [
    {
      id: "block",
      heading: "Transformer block",
      blocks: [
        {
          kind: "equation",
          lines: ["h' = LayerNorm(h + Attention(h))", "h'' = LayerNorm(h' + FFN(h'))"],
          caption:
            "Pre-norm variants swap the order, but the recipe is constant: mix, add residual, transform, add residual.",
          highlights: [
            { text: "Attention(h)", hue: "param" },
            { text: "+", hue: "prediction" },
            { text: "FFN", hue: "truth" },
          ],
        },
      ],
    },
    {
      id: "lm-head",
      heading: "Language-model head",
      blocks: [
        {
          kind: "equation",
          lines: ["P(w | context) = softmax(W h'' + b)"],
          caption: `Committed peak: P(mat) = ${nextTokenPinned.pinnedProb.toFixed(
            3,
          )} at temperature 1 with one block and residuals enabled.`,
          highlights: [{ text: "softmax", hue: "prediction" }],
        },
      ],
    },
    {
      id: "temperature",
      heading: "Decode temperature",
      blocks: [
        {
          kind: "prose",
          text: "At inference, logits are divided by temperature before softmax. T < 1 sharpens the peak; T > 1 flattens it — same weights, different randomness.",
          highlights: [
            { text: "T < 1", hue: "truth" },
            { text: "T > 1", hue: "error" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: ["attention", "embeddings"],
};
