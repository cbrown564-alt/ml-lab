import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * The mechanism: with many features, the best chance correlation is large, and
 * selecting on all the data bakes that spurious correlation into the test folds. The
 * spurious correlation tinted error-red.
 */
export const dataLeakageMath: MathDrawerContent = {
  nodeId: "data-leakage",
  invitation:
    "The 0.41 isn't random luck — it's predictable. With enough features, a sizeable correlation with anything is guaranteed by chance, and selecting on all the data hands that correlation to the test folds.",
  sections: [
    {
      id: "spurious",
      heading: "Why noise looks like signal",
      blocks: [
        {
          kind: "equation",
          lines: [
            "max_j |corr(xⱼ, y)|  ≈  √(2 ln p / n)",
            "p = 72, n = 64   ⟹   ≈ 0.37",
          ],
          caption: "The largest correlation you can expect among p pure-noise features — purely by chance.",
          highlights: [{ text: "≈ 0.37", hue: "error" }],
        },
        {
          kind: "prose",
          text: "With seventy-two features, some will correlate ≈ 0.37 with the target by luck alone. Pick the top ten of those using the whole dataset and you've selected features whose lucky correlation holds across every row — including the rows each fold later 'holds out'. The fit leans on that, and out-of-sample R² climbs well above zero on data that has no signal at all.",
          highlights: [{ text: "0.37", hue: "error" }],
        },
      ],
    },
    {
      id: "the-rule",
      heading: "The rule that closes every door",
      blocks: [
        {
          kind: "prose",
          text: "Selection done on training rows only is judged against a test fold it never saw, so a feature's lucky in-sample correlation gives no out-of-sample edge — and R² returns to ~0, the truth. The principle generalises past selection: any step that learns from data — scaling, imputation, encoding, selection — must be fitted inside the cross-validation loop, on the fold's training rows alone.",
        },
        {
          kind: "prose",
          text: "Split first; fit every learned transform on the training split; keep one final test set sealed and spend it once. A cross-validation score far above the sealed-set score is the surest sign a leak is hiding in the pipeline.",
        },
      ],
    },
  ],
  mathNodeIds: [],
};
