import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * What machine learning is, as an inversion of programming. Traditional programming:
 * you write the rule, the computer applies it. Machine learning: you supply examples
 * labelled with answers, and the machine writes the rule for you — finding patterns you
 * could never spell out by hand, but only as good as the examples you give it.
 */
export const whatIsMlNarrative: ExhibitNarrative = {
  nodeId: "what-is-ml",
  hook: [
    "Programming means a human writes the rules and the computer follows them. It works brilliantly — when you can spell the rules out. But write the rule for “is this a cat?”, or “is this email spam?”, or “what will this house sell for?” and you'll stall. Supervised learning handles tasks where examples are available but an explicit rule is hard to write: instead of writing the rule, you show labeled examples and fit a rule from them.",
    "Here's a tiny version. Two kinds of point, and a rule to tell them apart — first by hand, then learned.",
  ],
  story: [
    {
      id: "the-rule-you-write",
      heading: "The rule you write",
      paragraphs: [
        "Traditional programming is you, specifying the procedure: if this, then that. Drag the threshold and you're doing exactly that — hand-writing a rule that watches one feature and cuts the plane in two. You can get part of the way. But your rule only looks at one thing at a time, and it tops out well short. Now imagine the pattern were a face or a sentence: there's no threshold you could ever write by hand.",
      ],
    },
    {
      id: "the-rule-it-learns",
      heading: "The rule it learns",
      paragraphs: [
        "So don't write it — show it. Hand the machine the labeled examples (each point with its known class) and it searches for the rule that fits them best, free to weigh every feature at once. Here it finds the tilted line, using both features together, and beats your hand-tuned cut. The same approach can fit patterns that are difficult to express as hand-written rules: the machine isn't following a rule you wrote, it's discovering one from the data.",
      ],
    },
    {
      id: "the-inversion",
      heading: "Supervised learning, in one inversion",
      paragraphs: [
        "That's the definition, and it's an inversion. Traditional programming takes rules and data and produces answers. Supervised learning takes data and answers — examples — and produces the rule. You stop telling the computer how to do the task and start showing it what done looks like. Other forms of machine learning use different signals — for example, unlabeled structure or rewards — but this exhibit begins with supervised learning. Everything else in this lab is a way of doing that search well: which rules to consider, how to measure fit, how to find the best one.",
      ],
    },
    {
      id: "only-as-good-as-the-data",
      heading: "Only as good as its examples",
      paragraphs: [
        "There's a catch built into the power. The machine learns whatever pattern is in the examples you give it — no more, no less. Feed it representative data and it finds the real rule; feed it skewed or biased data and it faithfully learns the skew, then applies it to everyone. The rule isn't handed down by you, but it isn't conjured from nothing either — it's a mirror of the examples. That's why so much of the craft is about the data, not the algorithm.",
      ],
    },
  ],
  fieldNotes: [
    "This exhibit is the doorway to every other one. “Which rules to consider” is the model (linear regression, a neural network); “how to measure fit” is the loss; “how to find the best one” is gradient descent; “does it work on new data” is generalization. They're all pieces of learning a rule from examples.",
    "The labels matter. Showing the machine inputs with their correct answers is supervised learning — the kind here. Show it inputs with no answers and it can find structure (clusters, say), not a labeled rule. The answers in your examples are what let it learn what you actually want.",
  ],
};
