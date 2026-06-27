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

export const journeys: Journey[] = [foundations];
