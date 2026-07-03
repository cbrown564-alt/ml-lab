import type { Spine } from "@/lib/exhibit/spine";

export type AdaptationFrame = {
  scenarioIndex: number;
  strategyId: string;
  showCompare?: boolean;
};

export const adaptationSpine: Spine<AdaptationFrame> = [
  {
    sectionId: "hook",
    frame: { scenarioIndex: 0, strategyId: "rag", showCompare: true },
    terms: [
      { phrase: "pretrained base", hue: "truth" },
      { phrase: "three levers", hue: "param" },
      { phrase: "tradeoffs", hue: "prediction" },
    ],
  },
  {
    sectionId: "fine-tuning",
    frame: { scenarioIndex: 0, strategyId: "fine-tuning" },
    terms: [
      { phrase: "update weights", hue: "param" },
      { phrase: "bakes in domain", hue: "prediction" },
      { phrase: "retrain to refresh", hue: "error" },
    ],
  },
  {
    sectionId: "prompting",
    frame: { scenarioIndex: 0, strategyId: "prompting" },
    terms: [
      { phrase: "system prompt", hue: "param" },
      { phrase: "zero weight change", hue: "truth" },
      { phrase: "context limit", hue: "error" },
    ],
  },
  {
    sectionId: "rag",
    frame: { scenarioIndex: 0, strategyId: "rag" },
    terms: [
      { phrase: "retrieve chunks", hue: "param" },
      { phrase: "fresh evidence", hue: "prediction" },
      { phrase: "citation trail", hue: "truth" },
    ],
  },
  {
    sectionId: "choose-lever",
    frame: { scenarioIndex: 1, strategyId: "rag", showCompare: true },
    terms: [
      { phrase: "doc updates weekly", hue: "param" },
      { phrase: "retrieval index", hue: "prediction" },
      { phrase: "no full retrain", hue: "truth" },
    ],
    predict: {
      prompt:
        "Pricing and reset docs change every week. You need accurate answers with citations for auditors. Which lever fits best without a full retrain each Monday?",
      options: [
        {
          label: "RAG — refresh the doc index and retrieve evidence at query time",
          correct: true,
          feedback:
            "Right. Retrieval tracks doc updates when the index is rebuilt; the base weights stay frozen.",
        },
        {
          label: "One-shot fine-tune on last week's export — deploy and forget",
          feedback:
            "Fine-tuning bakes in a snapshot. Break it with Stale fine-tune — domain fit collapses after the next doc edit.",
        },
        {
          label: "Paste the entire manual into the system prompt every time",
          feedback:
            "Prompts hit context limits and stale the moment docs change. Prompting helps behaviour, not megabytes of volatile facts.",
        },
      ],
    },
  },
];
