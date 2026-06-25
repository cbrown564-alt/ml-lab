import type { Spine } from "@/lib/exhibit/spine";

/**
 * what-is-ml spine: the See-it graphic shows the same data with the hand-written rule
 * (a vertical cut), then the machine-learned rule (a tilted line). The committed
 * prediction sits on the inversion beat: commit what the machine needs from you to find
 * a rule (labelled examples) before the reveal.
 */
export type WhatIsMlFrame = { stage: "hand" | "learning" | "learned" };

export const whatIsMlSpine: Spine<WhatIsMlFrame> = [
  {
    sectionId: "the-rule-you-write",
    frame: { stage: "hand" },
    terms: [
      { phrase: "one feature", hue: "neutral" },
      { phrase: "tops out", hue: "error" },
    ],
  },
  {
    sectionId: "the-rule-it-learns",
    frame: { stage: "learned" },
    terms: [
      { phrase: "the labeled examples", hue: "truth" },
      { phrase: "the tilted line", hue: "prediction" },
    ],
  },
  {
    sectionId: "the-inversion",
    frame: { stage: "learning" },
    terms: [
      { phrase: "rules and data", hue: "neutral" },
      { phrase: "produces the rule", hue: "prediction" },
    ],
    predict: {
      prompt:
        "Machine learning flips programming around. What do you give the machine so it can find the rule itself?",
      options: [
        {
          label: "Examples labeled with the right answers",
          correct: true,
          feedback:
            "Right. You supply the inputs paired with their correct outputs; the machine searches for the rule that reproduces them. That's supervised learning — examples in, rule out.",
        },
        {
          label: "The rule, written out as code",
          feedback:
            "That's traditional programming — and the whole point is that for real tasks you can't write the rule. In ML you give examples, not the rule.",
        },
        {
          label: "Raw inputs, with no answers attached",
          feedback:
            "Inputs alone let it find structure (clusters), not the labeled rule you want. To learn “class 1 vs class 0” it needs the answers — the labels — on your examples.",
        },
      ],
    },
  },
  {
    sectionId: "only-as-good-as-the-data",
    frame: { stage: "learned" },
    terms: [
      { phrase: "a mirror of the examples", hue: "truth" },
      { phrase: "learns the skew", hue: "error" },
    ],
  },
];
