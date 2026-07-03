import type { FailureGallery } from "@/lib/failure/schema";

export const adaptationFailures: FailureGallery = {
  nodeId: "fine-tuning-vs-prompting-vs-rag",
  intro:
    "Adaptation fails when the lever does not match how fast facts move — stale weights, truncated prompts, or retrieval that cites the wrong chunk.",
  cards: [
    {
      id: "stale-finetune",
      primitive: "distribution-shift",
      title: "Fine-tune on Monday, wrong answer on Friday",
      trigger: "Deploy a fine-tuned model and never retrain after docs change.",
      symptom:
        "Domain fit collapses on new pricing or reset steps — the model confidently repeats outdated parametric memory.",
      diagnosis:
        "Weights encode a snapshot. Without retraining, fine-tuning cannot track volatile facts.",
      repair:
        "Retrain on a schedule, or pair a stable fine-tune with RAG for fast-moving facts.",
      boundary:
        "Stable style fine-tunes still help — just do not expect them to replace a changelog.",
    },
    {
      id: "prompt-manual-overflow",
      primitive: "underfitting",
      title: "Prompt stuffing hits the context wall",
      trigger: "Paste the entire product manual into the system prompt.",
      symptom:
        "Middle sections truncate silently — answers miss the policy paragraph auditors asked about.",
      diagnosis:
        "Prompts compete for the same context window as the user message and retrieved evidence.",
      repair:
        "Summarise behaviour in the prompt; put facts in retrieval or a fine-tune, not raw megabytes of text.",
      boundary:
        "Long-context models raise the ceiling; they do not remove the cost of stuffing noise.",
    },
    {
      id: "rag-wrong-chunk",
      primitive: "spurious-features",
      title: "RAG cites confidently from the wrong page",
      trigger: "Retrieve on brittle embeddings without domain tuning or evaluation.",
      symptom:
        "Answer includes a citation — to an unrelated FAQ — and users trust it because it looks sourced.",
      diagnosis:
        "Generation is only as good as retrieval. Wrong neighbours poison the prompt.",
      repair:
        "Evaluate recall@k on ticket-shaped queries, hybrid search, rerankers, and human review of neighbour lists.",
      boundary:
        "RAG reduces hallucination frequency; it does not guarantee correctness without retrieval quality.",
    },
  ],
};
