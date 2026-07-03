import type { MathDrawerContent } from "@/lib/narrative/math";
import { attentionValueDim } from "@/lib/models/attention";
import { attentionPinned } from "./experiment";

export const attentionMath: MathDrawerContent = {
  nodeId: "attention",
  invitation:
    "Six tokens and two heads here — but the same softmax mixture scales to long contexts, many heads, and the full transformer block.",
  sections: [
    {
      id: "scaled-dot-product",
      heading: "Scaled dot-product attention",
      blocks: [
        {
          kind: "equation",
          lines: ["Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V"],
          caption: `Each row softmaxes over keys so weights sum to 1, then multiplies the ${attentionValueDim}-D value matrix.`,
          highlights: [
            { text: "QKᵀ", hue: "param" },
            { text: "√d_k", hue: "truth" },
            { text: "softmax", hue: "prediction" },
          ],
        },
      ],
    },
    {
      id: "pinned-syntax",
      heading: "Committed syntax routes",
      blocks: [
        {
          kind: "prose",
          text: `On the syntax head, sat→cat weight = ${attentionPinned.satToCat.weight.toFixed(
            3,
          )} and on→mat = ${attentionPinned.onToMat.weight.toFixed(
            3,
          )}. Those peaks are baked into the fixture logits — not post-hoc labels.`,
          highlights: [
            { text: "sat→cat", hue: "param" },
            { text: "on→mat", hue: "prediction" },
          ],
        },
      ],
    },
    {
      id: "multi-head",
      heading: "Multi-head",
      blocks: [
        {
          kind: "equation",
          lines: ["MultiHead(Q, K, V) = Concat(head₁, …, head_h) · W_O"],
          caption:
            "Each head runs the same attention recipe on projected Q/K/V; the model learns different routing patterns per head.",
          highlights: [{ text: "Concat", hue: "truth" }],
        },
      ],
    },
  ],
  mathNodeIds: ["embeddings"],
};
