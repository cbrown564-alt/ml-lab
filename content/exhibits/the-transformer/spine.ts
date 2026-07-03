import type { Spine } from "@/lib/exhibit/spine";

export type TransformerFrame = {
  blockCount: number;
  temperature: number;
  stageId: string;
  showAttention?: boolean;
};

export const transformerSpine: Spine<TransformerFrame> = [
  {
    sectionId: "hook",
    frame: { blockCount: 1, temperature: 1, stageId: "head" },
    terms: [
      { phrase: "next-token", hue: "prediction" },
      { phrase: "transformer block", hue: "param" },
      { phrase: "softmax", hue: "truth" },
    ],
  },
  {
    sectionId: "attention-inside",
    frame: { blockCount: 1, temperature: 1, stageId: "attn", showAttention: true },
    terms: [
      { phrase: "self-attention", hue: "param" },
      { phrase: "context mix", hue: "prediction" },
      { phrase: "residual path", hue: "truth" },
    ],
  },
  {
    sectionId: "residual-ffn",
    frame: { blockCount: 1, temperature: 1, stageId: "ffn-residual" },
    terms: [
      { phrase: "Add & norm", hue: "param" },
      { phrase: "feed-forward", hue: "prediction" },
      { phrase: "skip connection", hue: "truth" },
    ],
  },
  {
    sectionId: "next-token-predict",
    frame: { blockCount: 1, temperature: 1, stageId: "head" },
    terms: [
      { phrase: "LM head", hue: "param" },
      { phrase: "vocabulary logits", hue: "truth" },
      { phrase: "mat", hue: "prediction" },
    ],
    predict: {
      prompt:
        'After "The cat sat on the", the committed model assigns the highest probability to mat — not rug or another copy of sat. What is the transformer doing that a bag-of-words model cannot?',
      options: [
        {
          label:
            "It routes context with attention, updates vectors through residuals and FFN layers, then scores vocabulary candidates — order and syntax matter",
          correct: true,
          feedback:
            "Right. The prefix is a sequence, not a multiset. Attention binds on to mat; the block writes that into the hidden state before the LM head fires.",
        },
        {
          label:
            "It memorises that mat always follows the in any English sentence",
          feedback:
            "Frequency helps, but the fixture also peaks on on during the attention step — the model uses structure, not a single bigram table entry alone.",
        },
        {
          label:
            "It picks the most common word in the training corpus regardless of context",
          feedback:
            "Raise temperature in Run it — the peak flattens but context still shifted logits before softmax. A corpus-frequency rule would ignore the prefix entirely.",
        },
      ],
    },
  },
  {
    sectionId: "stack-depth",
    frame: { blockCount: 2, temperature: 1, stageId: "head" },
    terms: [
      { phrase: "repeat block", hue: "param" },
      { phrase: "deeper stack", hue: "prediction" },
      { phrase: "same recipe", hue: "truth" },
    ],
  },
];
