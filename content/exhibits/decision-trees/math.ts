import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism with no gradient in sight: a split is a threshold on one feature; its
 * quality is how much it drops Gini impurity; the tree greedily takes the best split and
 * recurses. Impurity tinted error-red (mess to remove), purity truth-gold, the chosen
 * cut param-purple. The contrast with the regression cluster is the point — same task,
 * utterly different engine.
 */
export const decisionTreesMath: MathDrawerContent = {
  nodeId: "decision-trees",
  invitation:
    "No weights, no gradient, no learning rate. Three ideas: a split is a threshold on one feature, its worth is the impurity it removes, and the tree greedily keeps asking the most useful question until you tell it to stop.",
  sections: [
    {
      id: "the-split",
      heading: "A split is one threshold",
      blocks: [
        {
          kind: "equation",
          lines: [
            "split (j, t):   go left if  xⱼ ≤ t,   else go right",
            "leaf predicts:  the majority class of the training points that land in it",
          ],
          caption:
            "Each internal node tests a single feature j against a threshold t — one axis-aligned cut. A point follows the answers down to a leaf, which votes the majority class it was trained on (and the class proportion is the predicted probability).",
          highlights: [{ text: "(j, t)", hue: "param" }],
        },
      ],
    },
    {
      id: "impurity",
      heading: "Score a cut by the impurity it removes",
      blocks: [
        {
          kind: "equation",
          lines: ["Gini(box) = 1 − Σₖ pₖ²"],
          caption:
            "pₖ is the fraction of class k in the box. A pure box (one class) scores 0; a 50/50 box scores ½ — the most impure two classes get. Gini is just the chance two random draws from the box disagree.",
          highlights: [{ text: "Gini(box)", hue: "error" }],
        },
        {
          kind: "equation",
          lines: [
            "gain = Gini(parent) − ( n_L/n · Gini(left) + n_R/n · Gini(right) )",
          ],
          caption:
            "A cut splits one box into left and right. Its gain is the parent's impurity minus the size-weighted impurity of the two children — how much mess the question removed. The tree tries every feature and every threshold and keeps the cut with the largest gain.",
          highlights: [
            { text: "gain", hue: "param" },
            { text: "Gini(parent)", hue: "error" },
          ],
        },
      ],
    },
    {
      id: "greedy-recursion",
      heading: "Greedy, recursive, and happy to overfit",
      blocks: [
        {
          kind: "prose",
          text: "That is the entire algorithm: at the current box, find the highest-gain cut, split, and recurse on each child with only its own points. There is no global objective being minimized by gradient descent — it is a greedy, top-down search, each question chosen to look best right now. Cheap, and exact about this sample.",
          highlights: [{ text: "greedy", hue: "param" }],
        },
        {
          kind: "prose",
          text: "Left alone, recursion stops only when every leaf is pure — so it keeps carving until it has memorized the training set, impurity zero and a box around every stray point. The cure is a brake: cap the depth, demand a minimum number of points per leaf, or prune cuts whose gain is too small. Depth is the complexity knob you met as bias and variance — turn it down and the boundary smooths, turn it up and the tree memorizes.",
          highlights: [
            { text: "pure", hue: "truth" },
            { text: "complexity knob", hue: "param" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: [],
};
