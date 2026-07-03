import type { ExhibitNarrative } from "@/lib/narrative/schema";

export const transformerNarrative: ExhibitNarrative = {
  nodeId: "the-transformer",
  hook: [
    'A language model reads "The cat sat on the" and asks one question: what token comes next? That is the whole training objective at the token level — predict the next symbol given everything so far. Transformers answer with a repeating block: self-attention mixes the sequence, feed-forward layers transform each position, residuals keep the signal path open, and a language-model head turns the final hidden state into logits over the vocabulary.',
    "You already saw attention as routing. The transformer wraps that routing inside a block you can stack — same recipe, deeper network, richer representations — then softmaxes into a next-token distribution.",
  ],
  story: [
    {
      id: "attention-inside",
      heading: "Attention inside the block",
      paragraphs: [
        "Each block starts from token embeddings and runs self-attention — the heatmap you just left, now as one sublayer inside a larger machine. On the prefix, the final the sends strong weight to on before the LM head fires: prepositional context still matters for what noun comes next.",
        "Attention output is not the block output. It is added back to the input through a residual path, then normalised — the update is a delta on top of what was already there, not a wholesale replacement.",
      ],
    },
    {
      id: "residual-ffn",
      heading: "Residuals and feed-forward layers",
      paragraphs: [
        "The feed-forward sublayer is a small MLP applied position-wise — same weights at every token, but on different vectors. It adds capacity for nonlinear transforms after attention has mixed information.",
        "Another residual wraps the FFN output. Those skip connections are why deep stacks train at all: gradients and signal can flow around a sublayer that might otherwise erase what embeddings already encoded.",
      ],
    },
    {
      id: "next-token-predict",
      heading: "Next-token prediction",
      paragraphs: [
        "After the block (or a stack of blocks), a language-model head projects the last hidden state into vocabulary logits. Softmax turns logits into probabilities — mat leads on the committed fixture because the block wrote syntactic context into that state.",
        "Training repeats this for every token in a corpus: shift the window one step, predict the next symbol, backprop through attention and FFN weights. Generation at inference is the same head, sampled one token at a time.",
      ],
    },
    {
      id: "stack-depth",
      heading: "Stack the same block",
      paragraphs: [
        "GPT-style models do not invent a new architecture per layer — they repeat the block. Depth buys compositional representations: early layers might track syntax; later layers fuse broader context. Here, a second block boosts mat slightly without changing the lesson.",
        "The practical fork comes next: once a stack like this is pretrained, you can fine-tune weights, steer with prompts, or attach retrieval. First you need the block itself — attention, residuals, FFN, next-token head.",
      ],
    },
  ],
  fieldNotes: [
    "Real models add positional encodings, causal masks for decoding, multi-head attention, and many more blocks than two. The exhibit keeps the block legible on six candidate tokens.",
    "Temperature, top-k, and top-p decoding live at inference time — they reshape the same logits you see here without retraining the block.",
  ],
};
