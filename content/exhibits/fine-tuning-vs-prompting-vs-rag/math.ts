import type { MathDrawerContent } from "@/lib/narrative/math";
import { adaptationPinned } from "./experiment";

export const adaptationMath: MathDrawerContent = {
  nodeId: "fine-tuning-vs-prompting-vs-rag",
  invitation:
    "No new loss functions here — just where each lever sits relative to the frozen pretrained stack you built in the transformer exhibit.",
  sections: [
    {
      id: "fine-tune",
      heading: "Fine-tuning",
      blocks: [
        {
          kind: "prose",
          text: "Minimise task loss on domain labels while starting from pretrained weights θ₀. Deployment serves θ* — knowledge is parametric until the next training run.",
          highlights: [{ text: "θ*", hue: "param" }],
        },
      ],
    },
    {
      id: "prompt",
      heading: "Prompting",
      blocks: [
        {
          kind: "equation",
          lines: ["P(y | x) = P_θ(y | prompt ⊕ x)"],
          caption: "Same θ as pretraining — only the input string changes.",
          highlights: [{ text: "prompt ⊕ x", hue: "truth" }],
        },
      ],
    },
    {
      id: "rag",
      heading: "RAG",
      blocks: [
        {
          kind: "equation",
          lines: ["P(y | x) = P_θ(y | x ⊕ Retrieve(x, index))"],
          caption: `On the reset ticket, RAG domain fit pins at ${adaptationPinned.resetProcedureRagDomain.toFixed(
            2,
          )} with freshness above 0.9 when the index is current.`,
          highlights: [{ text: "Retrieve(x, index)", hue: "prediction" }],
        },
      ],
    },
  ],
  mathNodeIds: ["the-transformer", "embeddings"],
};
