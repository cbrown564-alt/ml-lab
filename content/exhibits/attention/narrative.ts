import type { ExhibitNarrative } from "@/lib/narrative/schema";

export const attentionNarrative: ExhibitNarrative = {
  nodeId: "attention",
  hook: [
    "Embeddings give each token a vector, but a single fixed vector per word is not enough — what sat means here hangs on cat, and no dictionary entry knows that in advance. Attention lets every position ask a question of the whole sequence: who should I listen to right now? The answer is not a fixed window three words wide. It is a weighted mix that changes with the sentence.",
    "Mechanically, each token builds a query, compares it to every key, softmax-normalises the scores into weights, and blends value vectors. That blend becomes the contextual update — content-dependent routing instead of a hand-designed pattern.",
  ],
  story: [
    {
      id: "qkv",
      heading: "Three roles: query, key, value",
      paragraphs: [
        "Think of lookup, not magic. The query is the question ('I am sat — who explains me?'). Keys are labels on every position ('here is cat', 'here is mat'). The dot product scores how well each key answers this query. Values are the payloads to mix once the weights are chosen.",
        "On the committed sentence The cat sat on the mat, the preposition on sends most of its weight to mat — the object it attaches to. The verb sat sends most of its weight to cat — the subject doing the sitting. Different queries, different routes, same mechanism.",
      ],
    },
    {
      id: "softmax-mix",
      heading: "Softmax turns scores into a mixture",
      paragraphs: [
        "Raw dot products can be any size, so attention scales by √d_k and applies softmax row-wise. Weights become non-negative and sum to one — a proper convex combination of value vectors.",
        "That is the whole read step: not copying a single neighbour, but blending several payloads in proportions the model learned. The output vector feeds the next sublayer — layer norm, residual, feed-forward — in a transformer block.",
      ],
    },
    {
      id: "multi-head",
      heading: "Several lookups in parallel",
      paragraphs: [
        "Transformers do not stop at one routing pattern. Multi-head attention runs several Q/K/V lookups in parallel — each head can specialise. On the teaching fixture, the syntax head routes sat→cat and on→mat; the local head mostly listens to neighbours on the strip.",
        "Heads are concatenated (or projected) so the model can merge syntactic and positional cues. That is why one block can both bind subjects and respect order without hand-written rules.",
      ],
    },
    {
      id: "bridge",
      heading: "From static embeddings to contextual vectors",
      paragraphs: [
        "Embeddings place tokens in a geometry; attention rewrites those coordinates using the current sentence. The result is a context vector — still one vector per position, but now informed by whichever keys the query chose.",
        "Stack this block, add residuals, and you have the transformer — the next exhibit wires several of these layers into next-token prediction. Attention is the hinge between token tables and language-model behaviour.",
      ],
    },
  ],
  fieldNotes: [
    "This exhibit uses hand-tuned logits on six tokens so the heatmap stays legible. Production models use hundreds of dimensions and many heads — the softmax mixture story is the same.",
    "Attention weights are not guaranteed to be human-interpretable in large models — the patterns here are pedagogically clean, not a promise about every layer of GPT.",
  ],
};
