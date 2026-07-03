import type { ExhibitNarrative } from "@/lib/narrative/schema";

export const adaptationNarrative: ExhibitNarrative = {
  nodeId: "fine-tuning-vs-prompting-vs-rag",
  hook: [
    "Pretraining teaches a model language in general. Deployment asks a narrower question: how do you steer it toward your product, your policies, and your latest docs? Three levers dominate practice — fine-tuning (change the weights), prompting (change the instructions), and retrieval-augmented generation (change what evidence it can read). They are not interchangeable shortcuts; each moves a different part of the stack and fails differently.",
    "This exhibit compares them on the same OrbitDesk support tickets with committed tradeoff numbers — domain fit, freshness, cost, and whether the answer can cite a source.",
  ],
  story: [
    {
      id: "fine-tuning",
      heading: "Fine-tuning — bake domain into the weights",
      paragraphs: [
        "Fine-tuning continues training on your transcripts or docs until the base model's weights encode OrbitDesk vocabulary and tone. Domain fit can be excellent — the model answers like someone who has seen thousands of your tickets.",
        "The cost is freshness. Weights are a snapshot. When reset steps or pricing change, yesterday's fine-tune is stale until you retrain, relaunch, and regression-test again.",
      ],
    },
    {
      id: "prompting",
      heading: "Prompting — steer without retraining",
      paragraphs: [
        "Prompting keeps weights frozen and changes what you prepend: role instructions, style guides, a few worked examples. It is fast, cheap, and reversible — edit the prompt, redeploy.",
        "Prompts cannot smuggle an entire volatile knowledge base. They set behaviour and remind the model of patterns; they do not replace retrieval when facts change weekly or citations are required.",
      ],
    },
    {
      id: "rag",
      heading: "RAG — retrieve, then generate",
      paragraphs: [
        "Retrieval-augmented generation searches an index of up-to-date chunks, injects the top matches into the prompt, and asks the model to answer from that evidence. Refresh the index when docs change — no full weight update required.",
        "Quality lives and dies on retrieval. Wrong chunks produce confident wrong answers with citations pointing at irrelevant pages. RAG adds latency and infra, but it is the usual answer when facts move faster than your training pipeline.",
      ],
    },
    {
      id: "choose-lever",
      heading: "Pick the lever for the failure you fear",
      paragraphs: [
        "Need stable tone and vocabulary with rarely changing policy? Fine-tuning plus light prompting may suffice. Need fast iteration on instructions only? Prompt. Need fresh facts, audit trails, and weekly doc updates? RAG — often stacked on top of a lightly fine-tuned or prompted base.",
        "Production systems mix levers. The mistake is reaching for the wrong one — fine-tuning pricing sheets that change every sprint, or prompting an entire manual that exceeds the context window.",
      ],
    },
  ],
  fieldNotes: [
    "Metrics here are pedagogical fixtures, not benchmarks from a live OrbitDesk deployment. The ordering of tradeoffs is what matters.",
    "Reinforcement learning from human feedback (RLHF) and preference tuning are adjacent to fine-tuning — same weight-update family, different objective. They are folded into the fine-tuning column for this exhibit.",
  ],
};
