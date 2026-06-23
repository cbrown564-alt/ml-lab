import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * the-dataset concept check. Misconceptions: that the model knows more than the table,
 * that a clever algorithm overcomes a bad row, and that an outlier is always an error.
 */
export const theDatasetCheck: ConceptCheck = {
  nodeId: "the-dataset",
  items: [
    {
      id: "rows-and-columns",
      kind: "choice",
      prompt: "In a dataset table, what do the rows and columns represent?",
      options: [
        {
          label: "Each row is one example; the columns are its features plus the target (the answer)",
          correct: true,
          feedback:
            "Right. A row is one observation (one house); the feature columns are inputs the model may use, and the target column is what it learns to predict.",
        },
        {
          label: "Rows are features, columns are examples",
          feedback:
            "It's the other way round in the standard layout: each row is an example, each column a variable (a feature or the target). One house per row.",
        },
        {
          label: "Rows and columns are interchangeable — it's just a grid of numbers",
          feedback:
            "They carry different meaning: rows index examples, columns index variables. Swapping them would scramble what the model is learning from.",
        },
      ],
      difficulty: 1,
      targets: ["ds:matrix"],
    },
    {
      id: "why-one-row-drags",
      kind: "choice",
      prompt: "A single mistyped row flattened the entire price trend. How can one row out of thirteen do that?",
      options: [
        {
          label: "The model honours every row equally, and a point far from the rest — especially at the edge — pulls the least-squares fit hard toward itself",
          correct: true,
          feedback:
            "Right. Least squares minimises total squared error, so a distant point creates a huge residual the line moves to reduce — and a point at the extreme of the range has the most leverage to tilt the slope.",
        },
        {
          label: "The model decided that row was the most important one",
          feedback:
            "It has no notion of importance — it just minimises total squared error. The far-off point happens to dominate that sum, especially from the edge, so the line chases it.",
        },
        {
          label: "Twelve good rows can't outvote one bad one — that's just how averages work",
          feedback:
            "Twelve rows can usually outvote one — but squared error punishes large misses disproportionately, and a high-leverage edge point tilts the slope more than a central one. That's why this one dominated.",
        },
      ],
      difficulty: 2,
      targets: ["ds:leverage"],
    },
    {
      id: "missing-column-predict",
      kind: "predict",
      setup: "House price really depends on location, but your table has no location column — only size and bedrooms.",
      prompt: "Can the model learn to use location?",
      options: [
        {
          label: "No — if it isn't a column in the table, the model can't use it, no matter how important it is",
          correct: true,
          feedback:
            "Right. The table is the model's entire world. A factor that isn't a column simply doesn't exist to it; its effect shows up only as unexplained noise.",
        },
        {
          label: "Yes — a good model infers location from the other columns",
          feedback:
            "Only to the extent location is already implied by size/bedrooms (it usually isn't). A factor absent from the columns can't be recovered — it's missing information, not hidden information.",
        },
        {
          label: "Yes, if you give it enough rows",
          feedback:
            "More rows of the same columns won't conjure a missing one. Without a location column, every row lacks that information, so no amount of them supplies it.",
        },
      ],
      verify: "The model can only use columns that are in the table — missing variables are invisible to it.",
      difficulty: 2,
      targets: ["ds:missing-column"],
    },
    {
      id: "break-outlier",
      kind: "experiment-task",
      prompt: "Break it on purpose: include the mistyped row and watch one point flatten the whole trend and wreck the 120 m² estimate — then drop it and see the trend snap back.",
      taskEvent: "the-dataset:outlier",
      feedback:
        "You've seen why data work is most of the job: one bad row can dominate, and the model can't tell a typo from a fact. The fix is in the data, not the algorithm.",
      difficulty: 1,
      targets: ["ds:break"],
    },
    {
      id: "transfer-sensor",
      kind: "transfer",
      scenario:
        "A factory's temperature-prediction model suddenly makes wild forecasts. Engineers find that one sensor occasionally reports −9999 (its error code) instead of a temperature, and those rows are in the training data.",
      prompt:
        "From what the mistyped row taught you: what's happening, what's the right fix, and what would not help? Write it in your own words.",
      open: {
        placeholder:
          "e.g. to the model a −9999 row is just… so it… the fix is… a bigger model would…",
        answer:
          "To the model a −9999 row is just another example — it can't tell an error code from a temperature — so each one is a massive high-leverage outlier that drags the fit, exactly like the one mistyped house here. The fix is upstream, in the data: detect and remove the error-coded rows and guard against the code on the way in. A more powerful model wouldn't help — it would fit the −9999 points even more faithfully — and 'collect more data' won't either, because −9999 is systematic, not zero-mean noise that averages away.",
      },
      difficulty: 3,
      targets: ["ds:transfer-quality"],
    },
  ],
};
