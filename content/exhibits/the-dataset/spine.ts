import type { Spine } from "@/lib/exhibit/spine";

/**
 * the-dataset spine: the See-it graphic highlights the matrix one way per beat — a single
 * row (an example), the feature-vs-target columns, then the whole matrix linked to the
 * scatter. The committed prediction sits on the-matrix beat: commit what the model
 * actually learns from before the reveal.
 */
export type TheDatasetFrame = { highlight: "row" | "columns" | "matrix" };

export const theDatasetSpine: Spine<TheDatasetFrame> = [
  {
    sectionId: "rows-are-examples",
    frame: { highlight: "row" },
    terms: [
      { phrase: "one example", hue: "prediction" },
      { phrase: "one dot per house", hue: "truth" },
    ],
  },
  {
    sectionId: "columns-are-features-and-target",
    frame: { highlight: "columns" },
    terms: [
      { phrase: "features", hue: "neutral" },
      { phrase: "the target", hue: "truth" },
    ],
  },
  {
    sectionId: "the-matrix",
    frame: { highlight: "matrix" },
    terms: [{ phrase: "the model's entire world", hue: "prediction" }],
    predict: {
      prompt:
        "You train a model on this dataset. What does it actually learn from?",
      options: [
        {
          label: "Only the rows and columns in the table — the numbers you handed it",
          correct: true,
          feedback:
            "Right. The model learns from this matrix of numbers. It doesn't see the houses or the market — only the values in the table, and only the columns you included.",
        },
        {
          label: "The real houses and the wider property market",
          feedback:
            "It has no access to any of that — only the table. If a fact isn't a column in the data, the model can't use it directly, however obvious it is to you — unless another feature proxies for it.",
        },
        {
          label: "The column names and what you intended them to mean",
          feedback:
            "Names and intentions don't reach the model; only the numbers do. A column you call “quality” is just whatever values sit in it — the model learns those, not your meaning.",
        },
      ],
    },
  },
  {
    sectionId: "quality-is-everything",
    frame: { highlight: "matrix" },
    terms: [
      { phrase: "its quality is decisive", hue: "truth" },
      { phrase: "drag the whole trend", hue: "error" },
    ],
  },
];
