import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * The dataset as the thing the model actually learns from: a matrix where each row is an
 * example and the columns split into features (inputs) and a target (the answer). The
 * table is the model's entire world — so its shape, its columns, and its quality decide
 * the result more than the algorithm does.
 */
export const theDatasetNarrative: ExhibitNarrative = {
  nodeId: "the-dataset",
  hook: [
    "Every model is only as good as the table you hand it. Before the algorithm, before the math, there's the dataset: rows of experience the machine learns from. It feels like the boring part, but in practice data collection and cleaning often determine the practical quality of the result — and many famous failures trace back to the table.",
    "Here's a small one: twelve houses, three columns. Let's read it the way a model does.",
  ],
  story: [
    {
      id: "rows-are-examples",
      heading: "Each row is one example",
      paragraphs: [
        "A dataset is a table, and each row is a single example — here, one house, with everything we measured about it. The model learns by looking across many such rows for a pattern. More rows, more examples to learn from; the scatter shows the same rows as points, one dot per house. Hovering links them: row and point are the same example, written two ways.",
      ],
    },
    {
      id: "columns-are-features-and-target",
      heading: "Columns split into features and a target",
      paragraphs: [
        "The columns are not all alike. Some are features — the inputs the model is allowed to look at (size, bedrooms). One is the target — the answer it's learning to predict (price). Deciding which column is the target is what turns a table into a task: predict price from size and beds. Swap the target and you'd have a different problem entirely from the very same numbers.",
      ],
    },
    {
      id: "the-matrix",
      heading: "The table is all it sees",
      paragraphs: [
        "Here's the part that's easy to forget: this matrix of numbers is the model's entire world. It doesn't see the houses, the street, or your intentions — only the rows and columns you handed it. The model cannot use an omitted variable directly; it may only recover part of its effect when another recorded feature acts as a proxy. What's in the table is everything it can use; what's left out doesn't exist as a column.",
      ],
    },
    {
      id: "quality-is-everything",
      heading: "Quality decides the result",
      paragraphs: [
        "Because the table is all there is, its quality is decisive. Representative rows, correct values, the right columns — get those right and a simple model shines; get them wrong and a more flexible algorithm may fit the mess more closely rather than correct it. A single mistyped price can drag the whole trend (you'll do that next). “Garbage in, garbage out” isn't a slogan here; it's the reason data collection and cleaning often determine the practical quality of the result.",
      ],
    },
  ],
  fieldNotes: [
    "The shape has names worth knowing: rows are often called samples or instances; feature columns are the inputs (the design matrix, X); the target column is y. Every supervised exhibit in this lab is some way of learning the map from X to y — and they all start from a table like this one.",
    "Real datasets are rarely this tidy. Missing cells, duplicated rows, inconsistent units, mislabelled targets, and unrepresentative samples are the norm, and cleaning them is unglamorous but decisive work. The model can't tell a typo from a fact; whatever you leave in the table, it will treat as true.",
  ],
};
