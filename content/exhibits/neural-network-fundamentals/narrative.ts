import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * From one neuron (a line) to a network (any shape). A single neuron is a weighted sum
 * squashed to a probability — a straight decision boundary, useless on XOR. Feed the
 * inputs through a hidden layer with a nonlinearity between the layers and the boundary
 * bends; backprop tunes every weight at once until it becomes the shape the data needs.
 */
export const neuralNetworkFundamentalsNarrative: ExhibitNarrative = {
  nodeId: "neural-network-fundamentals",
  hook: [
    "A single neuron — a weighted sum squashed to a probability — can only ever draw a straight line between the classes. That's logistic regression, and for all its uses, it's stuck: some patterns simply have no line. XOR, where the class flips every quadrant, is the famous one. The fix that launched deep learning is almost suspiciously simple: stack neurons, with a squiggle in between.",
    "Here is XOR — four clusters no line can separate. Watch a small network bend its boundary into the X it needs.",
  ],
  story: [
    {
      id: "one-neuron",
      heading: "One neuron is one line",
      paragraphs: [
        "A neuron takes the inputs, multiplies each by a weight, adds them up, and squashes the total to a probability. Geometrically that's a straight decision boundary — everything on one side is class 1, the other side class 0. On data a line can split, that's all you need. On XOR, it's hopeless: no single straight cut leaves the matching quadrants together. The lone neuron tops out around a coin-flip.",
      ],
    },
    {
      id: "hidden-layer",
      heading: "Stack them, with a squiggle between",
      paragraphs: [
        "Now send the two inputs to several neurons at once — a hidden layer — each drawing its own line, then feed their outputs into a final neuron that combines them. The crucial part is the nonlinearity (here, tanh) applied between the layers. Without it, a stack of linear maps is just one bigger linear map — still a line. With it, the layers can carve the plane into regions and recombine them into curves. That's where the shape comes from.",
      ],
    },
    {
      id: "learns",
      heading: "Backprop tunes every weight at once",
      paragraphs: [
        "A network has many weights — one per connection — and they all have to cooperate. Backpropagation is just the chain rule computing the gradient of the loss with respect to every weight simultaneously; gradient descent then steps them all downhill together. Press Train and watch it happen: the boundary morphs from a meaningless split into the XOR X, the wiring diagram's edges thicken and flip, and the loss falls. Nobody designed the shape — it was learned.",
      ],
    },
    {
      id: "universal",
      heading: "Enough units, any shape",
      paragraphs: [
        "Give the hidden layer enough units and a network can approximate essentially any boundary — circles, spirals, the XOR X, shapes you'd never write a rule for. That's the whole promise of deep learning: you don't hand-design the decision surface, you give the network capacity and let backprop find it. More units and more layers buy more shape — at the cost of more weights to fit and more ways to overfit.",
      ],
    },
  ],
  fieldNotes: [
    "Everything you've met is hiding in here. Each hidden unit is a logistic-style neuron; training is gradient descent on a loss; too much capacity overfits, which is why regularisation comes along for the ride. A neural network isn't a new idea so much as the old ones, stacked.",
    "The nonlinearity is not optional decoration — it is the entire reason depth helps. Strip the tanh out and a hundred-layer network collapses, algebraically, to a single linear layer. The squiggle between the sums is what makes a network more than a fancy line.",
  ],
};
