import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: a neuron is a squashed weighted sum (a line); a hidden layer with a
 * nonlinearity between the layers is what bends the boundary; backprop is the chain rule
 * giving every weight's gradient so descent can tune them together. The tanh is the load-
 * bearing piece — drop it and the whole stack collapses to a line.
 */
export const neuralNetworkFundamentalsMath: MathDrawerContent = {
  nodeId: "neural-network-fundamentals",
  invitation:
    "A network is the pieces you already know, stacked: a neuron is logistic regression, training is gradient descent. The only new idea is the nonlinearity between the layers — and it's the whole reason depth helps.",
  sections: [
    {
      id: "neuron",
      heading: "A neuron is a line",
      blocks: [
        {
          kind: "equation",
          lines: ["ŷ = σ(w·x + b)"],
          caption: "A weighted sum squashed to a probability — geometrically, a straight decision boundary. This is exactly one logistic-regression unit.",
          highlights: [{ text: "σ", hue: "truth" }],
        },
      ],
    },
    {
      id: "layer",
      heading: "A hidden layer bends it",
      blocks: [
        {
          kind: "equation",
          lines: ["h = tanh(W₁x + b₁)", "ŷ = σ(W₂·h + b₂)"],
          caption: "Several neurons each draw a line into the hidden vector h; the output neuron recombines them. The tanh between the layers is what lets the combination curve.",
          highlights: [{ text: "tanh", hue: "truth" }],
        },
        {
          kind: "prose",
          text: "Why the tanh matters: drop it and ŷ = σ(W₂W₁x + …) = σ(Wx + …) — a stack of linear maps is one linear map, still a line. The nonlinearity is the entire reason a deep network is more expressive than a shallow one.",
          highlights: [{ text: "still a line", hue: "error" }],
        },
        { kind: "widget", widget: "nonlinearity" },
      ],
    },
    {
      id: "train",
      heading: "Backprop trains every weight at once",
      blocks: [
        {
          kind: "equation",
          lines: ["∂L/∂w  for every weight   (chain rule)", "w ← w − η · ∂L/∂w"],
          caption: "Backpropagation is the chain rule, walking the loss's gradient back through the layers to every weight; gradient descent then steps them all downhill together.",
          highlights: [{ text: "∂L/∂w", hue: "param" }],
        },
        {
          kind: "prose",
          text: "With enough hidden units this construction can approximate essentially any decision boundary — the universal-approximation property. You supply capacity; backprop finds the shape. The cost is more weights to fit and more room to overfit, which is why regularisation rides along.",
          highlights: [{ text: "any decision boundary", hue: "truth" }],
        },
      ],
    },
  ],
  mathNodeIds: ["gradient-descent", "logistic-regression"],
};
