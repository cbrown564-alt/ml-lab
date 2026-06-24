import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism, formally: traditional programming evaluates a rule you wrote; supervised
 * learning searches a family of rules for the one that best fits labelled examples. The
 * hand rule is a one-parameter member of that family; learning optimises over a richer one.
 */
export const whatIsMlMath: MathDrawerContent = {
  nodeId: "what-is-ml",
  invitation:
    "Two lines of notation separate writing a rule from learning one. The first you've done forever; the second is the whole field.",
  sections: [
    {
      id: "write",
      heading: "Programming — you write the rule",
      blocks: [
        {
          kind: "equation",
          lines: ["answer = f(input)", "your hand rule:  f(x) = [ x₁ > t ]"],
          caption: "You specify f directly. The threshold rule is an f with a single knob, t — you tune it, but it only ever watches one feature.",
          highlights: [{ text: "f(x) = [ x₁ > t ]", hue: "neutral" }],
        },
      ],
    },
    {
      id: "learn",
      heading: "Learning — the data picks the rule",
      blocks: [
        {
          kind: "equation",
          lines: ["given examples  {(xᵢ, yᵢ)}", "find  f  minimising  Σᵢ loss( f(xᵢ), yᵢ )"],
          caption: "You hand over labelled examples and a family of candidate rules; the machine searches for the member that best reproduces the answers. Here that family is f(x) = σ(w·x + b) — it can weigh both features.",
          highlights: [{ text: "{(xᵢ, yᵢ)}", hue: "truth" }],
        },
        {
          kind: "prose",
          text: "That's the inversion: programming maps (rule, data) → answers; learning maps (data, answers) → rule. Everything else in the lab is a piece of this search — which family of f to allow (the model), how to score fit (the loss), how to find the best f (gradient descent), and whether it holds on new data (generalisation).",
          highlights: [{ text: "(data, answers) → rule", hue: "prediction" }],
        },
      ],
    },
  ],
  mathNodeIds: ["regression-task", "classification-task", "loss-functions"],
};
