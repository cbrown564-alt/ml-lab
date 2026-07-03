import type { ConceptCheck } from "@/lib/assessment/schema";
import { attentionPinned } from "./experiment";

export const attentionCheck: ConceptCheck = {
  nodeId: "attention",
  items: [
    {
      id: "what-is-attention",
      kind: "choice",
      prompt: "What does self-attention compute for each token?",
      options: [
        {
          label:
            "A softmax-weighted mix of value vectors — which keys to read depends on the query",
          correct: true,
          feedback:
            "Right. Each position asks a query, scores every key, normalises, and blends values — content-dependent routing.",
        },
        {
          label: "The three tokens immediately to the left — a fixed context window",
          feedback:
            "Fixed windows are convolutions or n-grams. Attention compares against the whole sequence with weights that change per query.",
        },
        {
          label: "The single nearest neighbour in embedding space — hard retrieval",
          feedback:
            "Attention mixes several values with fractional weights. Nearest-neighbour retrieval is a different (hard) operation.",
        },
      ],
      difficulty: 2,
      targets: ["attention:definition"],
    },
    {
      id: "qkv-roles",
      kind: "choice",
      prompt: "In Q/K/V attention, which part carries the payload that gets mixed?",
      options: [
        {
          label: "Value vectors — queries and keys only decide the weights",
          correct: true,
          feedback:
            "Exactly. Scores come from query–key similarity; the weighted sum uses values.",
        },
        {
          label: "Key vectors — they are copied directly into the output",
          feedback:
            "Keys label positions for scoring. Values are what the weights blend.",
        },
        {
          label: "Query vectors — they replace the token embedding outright",
          feedback:
            "Queries ask the question. The output is a mixture of values, then usually added through a residual path.",
        },
      ],
      difficulty: 2,
      targets: ["attention:qkv"],
    },
    {
      id: "multi-head-predict",
      kind: "predict",
      setup: "Compare the syntax and local heads on sat in Run it.",
      prompt: "Which head should peak on cat as subject?",
      options: [
        {
          label: "Syntax — role-based routing sends sat to its subject",
          correct: true,
          feedback:
            "Right. Local peaks near the diagonal; syntax sends sat→cat on the fixture.",
        },
        {
          label: "Local — only neighbours matter for verbs",
          feedback:
            "Local listens to sat and neighbours. Syntax is the head with the cat peak for sat.",
        },
        {
          label: "Both heads must be identical or the block is broken",
          feedback:
            "Multi-head attention intentionally runs different lookups in parallel — identical heads waste capacity.",
        },
      ],
      verify: "Toggle heads with query sat and read the top weight in Run it.",
      difficulty: 2,
      targets: ["attention:multi-head"],
    },
    {
      id: "break-uniform",
      kind: "experiment-task",
      prompt:
        "Break it: trigger Uniform routing and watch every weight flatten to 1/6 — then repair to Learned logits.",
      taskEvent: "attention:uniform",
      feedback:
        "Without score diversity, attention cannot focus — the contextual vector becomes an unweighted average.",
      difficulty: 1,
      targets: ["attention:break"],
    },
    {
      id: "transfer-long-context",
      kind: "transfer",
      scenario:
        "A summarisation model must connect a claim in the first paragraph to evidence in paragraph twelve. An engineer disables multi-head attention and replaces it with a fixed tri-gram window to save compute.",
      prompt:
        "Predict what breaks, propose a fix, and name one diagnostic you would run on attention maps. Answer in your own words.",
      open: {
        placeholder: "e.g. the window cannot … so I would … and inspect …",
        answer:
          "A fixed tri-gram window cannot route from paragraph twelve back to paragraph one — the claim and evidence fall outside each other's window, so the model must guess or copy local n-grams instead of binding distant dependencies. That is exactly what content-dependent attention is for: queries can peak on far keys when scores warrant it. I would restore learned attention (or a sparse/global variant designed for long range), and diagnose with attention entropy and manual peak inspection on held-out long documents — checking whether claim tokens still assign mass to evidence tokens after the change.",
      },
      difficulty: 3,
      targets: ["attention:transfer"],
    },
  ],
};
