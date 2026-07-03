import type { ConceptCheck } from "@/lib/assessment/schema";

export const adaptationCheck: ConceptCheck = {
  nodeId: "fine-tuning-vs-prompting-vs-rag",
  items: [
    {
      id: "what-changes",
      kind: "choice",
      prompt: "What does fine-tuning change that prompting does not?",
      options: [
        {
          label: "The model weights — learned parameters updated on domain data",
          correct: true,
          feedback:
            "Right. Prompting edits the input; fine-tuning edits θ.",
        },
        {
          label: "Only the tokenizer vocabulary",
          feedback:
            "Tokenizers can be extended, but fine-tuning is about weight updates on top of a pretrained stack.",
        },
        {
          label: "The retrieval index at inference time",
          feedback:
            "That is RAG. Fine-tuning happens offline in training.",
        },
      ],
      difficulty: 2,
      targets: ["adaptation:fine-tune"],
    },
    {
      id: "rag-role",
      kind: "choice",
      prompt: "What problem does RAG solve that prompting alone struggles with?",
      options: [
        {
          label: "Fresh factual evidence beyond what fits in a static prompt",
          correct: true,
          feedback:
            "Exactly — refresh the index when docs change; keep base weights frozen.",
        },
        {
          label: "Training the model from scratch without GPUs",
          feedback:
            "RAG still uses a pretrained model; it adds retrieval, not pretraining.",
        },
        {
          label: "Removing the need for any prompt at all",
          feedback:
            "RAG prompts the model with retrieved chunks — instructions still matter.",
        },
      ],
      difficulty: 2,
      targets: ["adaptation:rag"],
    },
    {
      id: "weekly-docs-predict",
      kind: "predict",
      setup: "Docs and pricing change every week; auditors want citations.",
      prompt: "Which lever should lead?",
      options: [
        {
          label: "RAG with a refreshed doc index",
          correct: true,
          feedback:
            "Right. Retrieval tracks weekly edits without a full retrain.",
        },
        {
          label: "One fine-tune at the start of the quarter",
          feedback:
            "Break it: stale fine-tune — domain fit drops after the next edit.",
        },
        {
          label: "Paste each week's PDF into the system prompt",
          feedback:
            "Context limits and silent truncation make this brittle for large manuals.",
        },
      ],
      verify: "Toggle to the pricing ticket in Run it and compare freshness scores across strategies.",
      difficulty: 2,
      targets: ["adaptation:choose"],
    },
    {
      id: "break-stale-finetune",
      kind: "experiment-task",
      prompt:
        "Break it: trigger Stale fine-tune after a doc update and watch domain fit fall — then compare RAG on the same ticket.",
      taskEvent: "adaptation:stale-finetune",
      feedback:
        "Parametric memory frozen at deploy time cannot track a changelog by itself.",
      difficulty: 1,
      targets: ["adaptation:break"],
    },
    {
      id: "transfer-mix",
      kind: "transfer",
      scenario:
        "A legal team wants formal tone (stable) but must quote the latest compliance PDF (changes monthly). Engineering proposes only prompt engineering to save cost.",
      prompt:
        "Recommend a lever mix, justify it, and name one metric per lever you would monitor. Answer in your own words.",
      open: {
        placeholder: "e.g. fine-tune for …, RAG for …, monitor …",
        answer:
          "Use a light fine-tune or preference pass for stable formal tone and vocabulary, plus RAG over the compliance index for quotes that must track monthly PDF edits — prompting alone sets behaviour but cannot reliably store volatile legal text. I would monitor domain-fit evals on tone for the fine-tune, recall@k and citation accuracy on compliance questions for RAG, and prompt-regression tests for instruction following. Prompt-only saves upfront cost but fails freshness and audit requirements when the PDF changes.",
      },
      difficulty: 3,
      targets: ["adaptation:transfer"],
    },
  ],
};
