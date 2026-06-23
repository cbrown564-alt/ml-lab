import type { FailureGallery } from "@/lib/failure/schema";

/**
 * the-dataset failure gallery. Both are ways the table fails the model: a single bad row
 * that dominates the fit, and too few rows to pin a trustworthy pattern down at all.
 */
export const theDatasetFailures: FailureGallery = {
  nodeId: "the-dataset",
  cards: [
    {
      id: "outlier-row",
      primitive: "outliers",
      title: "One bad row dominates",
      trigger: "Leave a corrupted, high-leverage row in the data — a mistyped value at the edge of the range.",
      symptom: "The least-squares trend tips toward the single point and flattens; predictions for ordinary cases go badly wrong, even though every other row is fine.",
      diagnosis: "The model honours every row equally — it can't tell a typo from a fact. A point far from the rest, especially at the extremes, pulls the whole fit toward itself.",
      repair: "Find and fix or drop the bad row (and consider a robust loss that down-weights outliers). Cleaning the data is the fix; no model setting undoes a typo.",
      boundary: "Not every outlier is an error — a genuinely unusual but real example is data worth keeping. The skill is telling a mistake from a true extreme.",
    },
    {
      id: "too-few-rows",
      primitive: "small-samples",
      title: "Too few rows to trust",
      trigger: "Fit a model on a handful of rows and read its pattern as the truth.",
      symptom: "The trend swings with every row added or removed, and any one noisy point can rewrite it — the table is too small to outvote chance.",
      diagnosis: "A pattern is only as stable as the number of examples behind it; from few rows, many different trends fit nearly as well, so the one you get is mostly luck.",
      repair: "Collect more representative rows, or use a simpler model (and regularisation) so the few rows you have can determine it.",
      boundary: "How many rows are enough scales with how complex the pattern is — a straight line needs only a handful; a rich model needs many.",
    },
  ],
};
