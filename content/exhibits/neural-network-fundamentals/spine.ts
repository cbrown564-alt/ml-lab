import type { Spine } from "@/lib/exhibit/spine";

/**
 * Neural-network spine: the See-it graphic shows the decision field at three stages — a
 * single neuron's straight line, a hidden layer part-way trained, and the solved XOR X.
 * The committed prediction sits on the hidden-layer beat: commit whether a single hidden
 * unit could solve XOR (it can't — it's still essentially one bend) before the reveal,
 * which the learner can then drive themselves in Run it.
 */
export type NeuralNetFrame = { stage: "neuron" | "bending" | "solved" };

export const neuralNetworkFundamentalsSpine: Spine<NeuralNetFrame> = [
  {
    sectionId: "one-neuron",
    frame: { stage: "neuron" },
    terms: [
      { phrase: "a straight decision boundary", hue: "prediction" },
      { phrase: "no single straight cut", hue: "error" },
    ],
  },
  {
    sectionId: "hidden-layer",
    frame: { stage: "bending" },
    terms: [
      { phrase: "a hidden layer", hue: "param" },
      { phrase: "the nonlinearity", hue: "truth" },
    ],
    predict: {
      prompt:
        "You're about to add a hidden layer. If it had just one hidden unit, could the network solve XOR?",
      options: [
        {
          label: "No — one unit is still essentially one bend; it can't carve the X",
          correct: true,
          feedback:
            "Right. A single hidden unit gives you one tanh ridge — not enough to separate four alternating quadrants. It stalls near a line (~75%). You'll see exactly this in Run it: set hidden units to 1.",
        },
        {
          label: "Yes — any hidden layer, even one unit, solves XOR",
          feedback:
            "Not quite. It's the hidden layer's width that buys shape: one unit is one bend, which can't make the X. A few units carve it reliably. Try hidden = 1 in Run it and watch it stall, then 4.",
        },
        {
          label: "Yes, but only with far more training data",
          feedback:
            "More data won't help — one hidden unit lacks the capacity to represent the X at all, no matter how much data. It's a shape problem, not a data problem. See it: hidden = 1 stalls.",
        },
      ],
    },
  },
  {
    sectionId: "learns",
    frame: { stage: "solved" },
    terms: [
      { phrase: "the XOR X", hue: "prediction" },
      { phrase: "backpropagation", hue: "param" },
    ],
  },
  {
    sectionId: "universal",
    frame: { stage: "solved" },
    terms: [{ phrase: "any boundary", hue: "truth" }],
  },
];
