import type { Journey } from "@/lib/graph/schema";

export const foundations: Journey = {
  id: "foundations",
  title: "Foundations",
  audience: "Engineers and analysts starting machine learning from zero",
  description:
    "Start with the basic question—what does it mean to learn from data?—then build your first models, learn how they are optimized, and test whether they generalize.",
  stops: [
    { nodeId: "what-is-ml" },
    { nodeId: "the-dataset" },
    { nodeId: "regression-task" },
    {
      nodeId: "linear-regression",
      framing:
        "Your first real model. Everything later — boosting, transformers — is a riff on what happens here.",
    },
    { nodeId: "loss-functions" },
    {
      nodeId: "gradient-descent",
      framing: "The engine. Once you see it roll downhill, half of deep learning demystifies itself.",
    },
    { nodeId: "feature-scaling" },
    { nodeId: "train-test-generalization" },
    { nodeId: "bias-variance" },
    { nodeId: "data-leakage" },
    { nodeId: "overfitting-regularization" },
    { nodeId: "classification-task" },
    { nodeId: "logistic-regression" },
    {
      nodeId: "decision-trees",
      framing:
        "The other way to draw a boundary: not one line, but a staircase of yes/no cuts that bends on its own — and shows you overfitting as a thing you can watch happen.",
    },
    { nodeId: "neural-network-fundamentals", optional: true },
  ],
};

export const unsupervised: Journey = {
  id: "unsupervised",
  title: "Unsupervised Learning",
  audience: "Learners who know supervised basics and want to find structure without labels",
  description:
    "When there is no answer column — only features — you can still discover groups and the directions where the data actually varies.",
  stops: [
    { nodeId: "feature-scaling", optional: true },
    {
      nodeId: "k-means",
      framing:
        "No labels: just points and a guess at how many groups exist. Watch centres chase clusters through assign → average → repeat.",
    },
    {
      nodeId: "pca",
      framing:
        "Not groups — directions. Rotate the view so one axis captures as much spread as possible, then compress without losing the shape.",
    },
  ],
};

export const intoDeepLearning: Journey = {
  id: "into-deep-learning",
  title: "Into Deep Learning",
  audience: "Learners who have met linear models and neural-network basics and want the modern stack",
  description:
    "From stacked units to spatial filters, learned geometry, content-dependent routing, and the transformer block — the connected path into deep learning.",
  stops: [
    {
      nodeId: "neural-network-fundamentals",
      framing:
        "You already stacked units and watched a boundary bend. Deep learning is what happens when structure, hierarchy, and representation enter the picture.",
    },
    {
      nodeId: "cnns",
      framing:
        "Images are grids, not flat feature vectors. A small filter sliding across the grid learns local patterns that stack into parts.",
    },
    {
      nodeId: "embeddings",
      framing:
        "Discrete tokens and objects become points in a space — similar things close, different things far. Attention and transformers live in this geometry.",
    },
    {
      nodeId: "attention",
      framing:
        "Each position chooses what to read. Not a fixed window — a weighted mix driven by content.",
    },
    {
      nodeId: "the-transformer",
      framing:
        "Self-attention blocks, residuals, layer norm — the repeating unit behind most language and multimodal models today.",
    },
  ],
};

export const understandingLlms: Journey = {
  id: "understanding-llms",
  title: "Understanding LLMs",
  audience: "Engineers and curious readers who want to explain how chat models work end-to-end",
  description:
    "Not one giant animation — a connected sequence from vectors and routing through the transformer block to the practical fork: fine-tune, prompt, or retrieve.",
  stops: [
    { nodeId: "neural-network-fundamentals", optional: true },
    {
      nodeId: "embeddings",
      framing:
        "Tokens become vectors. Similar meanings land nearby — the coordinate system every later mechanism operates on.",
    },
    {
      nodeId: "attention",
      framing:
        "Query, key, value: each token asks who to listen to. Multi-head attention is several of these lookups in parallel.",
    },
    {
      nodeId: "the-transformer",
      framing:
        "Stack the block: predict the next token, backprop through attention, residual pathways keep the signal flowing.",
    },
    {
      nodeId: "fine-tuning-vs-prompting-vs-rag",
      framing:
        "The model is pretrained — now how do you steer it? Change weights, change instructions, or change what it can look up.",
    },
  ],
};

export const journeys: Journey[] = [
  foundations,
  unsupervised,
  intoDeepLearning,
  understandingLlms,
];
