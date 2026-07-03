import type { ConceptCheck } from "@/lib/assessment/schema";

export const embeddingsCheck: ConceptCheck = {
  nodeId: "embeddings",
  items: [
    {
      id: "what-is-embedding",
      kind: "choice",
      prompt: "What is an embedding in a language model?",
      options: [
        {
          label:
            "A learned vector for each token — coordinates in a space where similarity and direction carry meaning",
          correct: true,
          feedback:
            "Right. Embeddings turn discrete symbols into points the network can add, compare, and mix — attention reads this geometry.",
        },
        {
          label: "A dictionary that stores the English definition of each token",
          feedback:
            "Definitions are human metadata. Embeddings are numeric coordinates tuned by prediction loss, not glossaries.",
        },
        {
          label: "The one-hot index of a token in the vocabulary list",
          feedback:
            "That is an encoding, not an embedding. One-hot vectors are sparse and equidistant — they carry no learned similarity.",
        },
      ],
      difficulty: 2,
      targets: ["embeddings:definition"],
    },
    {
      id: "pca-vs-learned",
      kind: "choice",
      prompt: "How is a learned embedding different from a PCA projection of co-occurrence counts?",
      options: [
        {
          label:
            "Embeddings are trained so the downstream prediction task shapes the axes; PCA only maximises variance in fixed features",
          correct: true,
          feedback:
            "Exactly. Both compress — but PCA's objective is spread, not analogy or next-token prediction.",
        },
        {
          label: "PCA always produces higher-dimensional vectors than embeddings",
          feedback:
            "Either can be 2-D or 300-D. The difference is how the coordinates are chosen, not the dimension count.",
        },
        {
          label: "They are the same operation with different names",
          feedback:
            "Toggle PCA in Run it: the scatter rearranges and the king − man + woman trick breaks — same data, different objective.",
        },
      ],
      difficulty: 2,
      targets: ["embeddings:pca"],
    },
    {
      id: "analogy-predict",
      kind: "predict",
      setup: "You are about to compute king − man + woman in the learned embedding map.",
      prompt: "Where should the result land?",
      options: [
        {
          label: "Near queen — the gender offset from man→woman transfers to royalty",
          correct: true,
          feedback:
            "Right. The committed fixture lands within 0.00 of queen — the analogy is built into the teaching vectors.",
        },
        {
          label: "Near prince — both are royalty, so the gender offset cancels",
          feedback:
            "Gender offset is what you add after subtracting man. Prince is royalty but not the female counterpart of king in this offset.",
        },
        {
          label: "Nowhere sensible — vector arithmetic on words is meaningless",
          feedback:
            "Run the analogy overlay in See it or Break it — the result circle sits on queen. Meaningless arithmetic would not land consistently.",
        },
      ],
      verify: "Open Break it, run the analogy overlay, and watch the result ring land on queen.",
      difficulty: 2,
      targets: ["embeddings:analogy"],
    },
    {
      id: "break-one-hot",
      kind: "experiment-task",
      prompt:
        "Break it: switch to One-hot view and try to find neighbours of king. Notice every cosine is zero — then repair by returning to Learned embeddings.",
      taskEvent: "embeddings:one-hot",
      feedback:
        "Without dense geometry there is nothing to be near. That is why models learn embeddings instead of stopping at sparse indices.",
      difficulty: 1,
      targets: ["embeddings:break"],
    },
    {
      id: "transfer-context-window",
      kind: "transfer",
      scenario:
        "A support chatbot embeds customer tickets with a table trained on product reviews. A user writes 'My deployment caught fire after the canary.' The retriever returns the three nearest past tickets — all about literal kitchen appliances — because 'canary' and 'fire' sat near cooking vocabulary in the source embedding space.",
      prompt:
        "Diagnose the failure, propose a fix, and name one metric you would watch to know the geometry improved. Answer in your own words.",
      open: {
        placeholder: "e.g. the geometry was trained on … so I would … and watch …",
        answer:
          "The embedding geometry inherited review-domain neighbourhoods — 'canary' and 'fire' still live near consumer-product senses, so cosine retrieval returns appliance tickets even though the user means a canary deployment and an outage. The failure is domain shift in the coordinate system, not the retriever code. I would fine-tune embeddings (or the adapter layers above them) on in-domain ticket text, or rebuild the table from a model pretrained on broader technical corpora, and validate with a held-out set of jargon-heavy queries where I know the true nearest neighbour. I would watch recall@k on those domain-specific probes and spot-check neighbour lists for polyseme words like 'canary', 'fire', and 'crash' until the valleys match operations language instead of kitchen language.",
      },
      difficulty: 3,
      targets: ["embeddings:transfer"],
    },
  ],
};
