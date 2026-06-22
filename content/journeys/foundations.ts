import type { Journey } from "@/lib/graph/schema";

export const foundations: Journey = {
  id: "foundations",
  title: "Foundations",
  audience: "Engineers and analysts starting machine learning from zero",
  description:
    "From 'what even is learning from data' to your first trained models — the shortest honest path through the core ideas.",
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
    { nodeId: "neural-network-fundamentals", optional: true },
  ],
};

export const journeys: Journey[] = [foundations];
