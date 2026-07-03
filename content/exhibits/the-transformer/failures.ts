import type { FailureGallery } from "@/lib/failure/schema";
import { nextTokenPinned } from "./experiment";

export const transformerFailures: FailureGallery = {
  nodeId: "the-transformer",
  intro:
    "Transformers fail when the block stops transmitting signal — residuals removed, depth without training, or decode temperature that ignores the logits the block worked to produce.",
  cards: [
    {
      id: "no-residual-vanish",
      primitive: "underfitting",
      title: "Residuals off — updates erase the path",
      trigger: "Remove skip connections so each sublayer must carry the full representation alone.",
      symptom: `Next-token confidence on mat falls from ${nextTokenPinned.pinnedProb.toFixed(
        2,
      )} toward a flat guess — the block cannot preserve what embeddings already encoded.`,
      diagnosis:
        "Without residuals, deep stacks compound small distortions. Attention and FFN deltas overwrite instead of refine.",
      repair:
        "Restore skip connections and layer norm; monitor representation norms layer-by-layer during training.",
      boundary:
        "Some efficient variants prune residuals in distilled models — that is a deliberate trade, not the default recipe.",
    },
    {
      id: "hot-decode",
      primitive: "distribution-shift",
      title: "Temperature too high at decode",
      trigger: "Sample with temperature 2.5+ even though training optimised logits at temperature 1.",
      symptom:
        "The LM head still prefers mat, but softmax flattens — unlikely tokens look plausible and sampling turns random.",
      diagnosis:
        "Temperature rescales logits at inference only. High T is not more creative — it is less faithful to what the block output.",
      repair:
        "Match decode temperature to the regime you want: low for factual continuation, moderate for variety — not arbitrarily hot.",
      boundary:
        "Top-k and top-p are complementary filters — they trim the tail without rescaling every logit equally.",
    },
    {
      id: "context-truncation",
      primitive: "data-leakage",
      title: "Context window cuts the evidence",
      trigger: "Feed a long document but truncate to the last 512 tokens before attention runs.",
      symptom:
        "Needles stated pages earlier vanish from the hidden state — the model invents plausible continuations without the fact.",
      diagnosis:
        "Self-attention only sees tokens present in the window. Truncation is silent information loss, not model stupidity.",
      repair:
        "Chunk with retrieval, sliding windows, or models trained for longer contexts; measure recall on held-out long prompts.",
      boundary:
        "Long-context models still bound memory — the limit moves, it does not disappear.",
    },
  ],
};
