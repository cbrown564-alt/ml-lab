import type { Spine } from "@/lib/exhibit/spine";

export type AttentionFrame = {
  headId: string;
  queryIndex: number;
  highlightKeyIndex?: number;
  showAllRows?: boolean;
};

export const attentionSpine: Spine<AttentionFrame> = [
  {
    sectionId: "hook",
    frame: { headId: "syntax", queryIndex: 2, highlightKeyIndex: 1 },
    terms: [
      { phrase: "query row", hue: "param" },
      { phrase: "softmax weights", hue: "prediction" },
      { phrase: "content-dependent", hue: "truth" },
    ],
  },
  {
    sectionId: "qkv",
    frame: { headId: "syntax", queryIndex: 3, highlightKeyIndex: 5 },
    terms: [
      { phrase: "Query", hue: "param" },
      { phrase: "Key", hue: "truth" },
      { phrase: "Value", hue: "prediction" },
    ],
  },
  {
    sectionId: "softmax-mix",
    frame: { headId: "syntax", queryIndex: 2, highlightKeyIndex: 1 },
    terms: [
      { phrase: "scores / √d_k", hue: "param" },
      { phrase: "weights sum to 1", hue: "truth" },
      { phrase: "weighted values", hue: "prediction" },
    ],
  },
  {
    sectionId: "multi-head",
    frame: { headId: "local", queryIndex: 2, showAllRows: true },
    terms: [
      { phrase: "parallel heads", hue: "param" },
      { phrase: "syntax vs local", hue: "prediction" },
      { phrase: "concat / mix", hue: "truth" },
    ],
    predict: {
      prompt:
        "On the syntax head, the verb sat sends most of its weight to cat — the subject. On the local head, sat listens mainly to itself and immediate neighbours. What does that split suggest about why transformers use multiple heads?",
      options: [
        {
          label:
            "Different heads can specialise — one routes by role, another by position — then the model merges their mixes",
          correct: true,
          feedback:
            "Right. Multi-head attention is several content-dependent lookups in parallel, not one averaged pattern forced on every token.",
        },
        {
          label:
            "Multiple heads always produce identical weight matrices — they are just for speed",
          feedback:
            "Toggle heads in Run it: syntax peaks on cat for sat while local peaks near the diagonal. Same sentence, different routing.",
        },
        {
          label:
            "Only the last token is allowed to issue queries in self-attention",
          feedback:
            "Every row is a query in self-attention. Each token asks who to read from the same sequence.",
        },
      ],
    },
  },
  {
    sectionId: "bridge",
    frame: { headId: "syntax", queryIndex: 3, highlightKeyIndex: 5 },
    terms: [
      { phrase: "embedding geometry", hue: "param" },
      { phrase: "context vector", hue: "prediction" },
      { phrase: "transformer block", hue: "truth" },
    ],
  },
];
