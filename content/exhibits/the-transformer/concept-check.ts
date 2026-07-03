import type { ConceptCheck } from "@/lib/assessment/schema";

export const transformerCheck: ConceptCheck = {
  nodeId: "the-transformer",
  items: [
    {
      id: "block-recipe",
      kind: "choice",
      prompt: "What are the core sublayers inside one transformer block?",
      options: [
        {
          label: "Self-attention, residual adds, feed-forward MLP, layer norm — then repeat",
          correct: true,
          feedback:
            "Right. Attention mixes tokens; FFN transforms each position; residuals keep the path open.",
        },
        {
          label: "Convolution, pooling, then a dense classifier",
          feedback:
            "That is a CNN pipeline. Transformers mix sequences with attention, not spatial filters.",
        },
        {
          label: "A single recurrent hidden state updated left-to-right",
          feedback:
            "RNNs compress history into one state. Transformers keep all positions and route with attention.",
        },
      ],
      difficulty: 2,
      targets: ["the-transformer:block"],
    },
    {
      id: "residual-role",
      kind: "choice",
      prompt: "Why do transformers add residual connections around attention and FFN?",
      options: [
        {
          label: "So each sublayer writes a delta on top of the existing representation instead of replacing it",
          correct: true,
          feedback:
            "Exactly. Skip paths preserve signal and make deep stacks trainable.",
        },
        {
          label: "To duplicate parameters and increase model size only",
          feedback:
            "Residuals add no weights — they add an identity path for gradients and representations.",
        },
        {
          label: "To prevent attention from running more than once",
          feedback:
            "Attention still runs inside the block; residuals wrap its output, not block it.",
        },
      ],
      difficulty: 2,
      targets: ["the-transformer:residual"],
    },
    {
      id: "next-token-predict",
      kind: "predict",
      setup: 'You are about to read the logits after "The cat sat on the".',
      prompt: "Which token should lead the distribution on the committed fixture?",
      options: [
        {
          label: "mat — the object noun completing the prepositional phrase",
          correct: true,
          feedback:
            "Right. The LM head peaks on mat at temperature 1 with residuals enabled.",
        },
        {
          label: "sat — repeat the verb",
          feedback:
            "Sat is in the prefix already; the model scores continuations, not copies of prior tokens unless context warrants.",
        },
        {
          label: "the — another article regardless of syntax",
          feedback:
            "Articles follow patterns, but the fixture peaks on mat after on the — check the logit bars in Run it.",
        },
      ],
      verify: 'Open Run it with one block, temperature 1, and read the top bar after the prefix.',
      difficulty: 2,
      targets: ["the-transformer:next-token"],
    },
    {
      id: "break-no-residual",
      kind: "experiment-task",
      prompt:
        "Break it: disable residuals and watch mat probability fall — then repair by turning residuals back on.",
      taskEvent: "the-transformer:no-residual",
      feedback:
        "Without skip connections the block overwrites instead of refining — next-token confidence collapses.",
      difficulty: 1,
      targets: ["the-transformer:break"],
    },
    {
      id: "transfer-decode",
      kind: "transfer",
      scenario:
        "A chat product ships with temperature 2.0 because PMs want 'creative' answers. Users report hallucinated citations on factual prompts, while brainstorming sessions feel fine.",
      prompt:
        "Diagnose which part of the pipeline explains the split behaviour, propose a fix, and name one metric you would monitor. Answer in your own words.",
      open: {
        placeholder: "e.g. high temperature flattens … so I would … and track …",
        answer:
          "High temperature flattens the next-token distribution at decode time — the transformer block still runs, but softmax spreads mass onto low-logit tokens, so factual prompts sample tail outcomes ( invented citations ) while brainstorming benefits from variety. The failure is inference configuration, not necessarily pretraining. I would use task-specific decode settings: lower temperature ( and maybe top-p ) for citation-heavy flows, higher only where variety is desired, and monitor logit margin ( top1 − top2 ) plus human eval on factual prompts to ensure peaks stay sharp when needed.",
      },
      difficulty: 3,
      targets: ["the-transformer:transfer"],
    },
  ],
};
