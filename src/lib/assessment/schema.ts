/**
 * Assessment types (docs/03-data-model.md §3). Three kinds (docs/06, B5):
 *
 * - `choice` — retrieval practice; distractors encode real misconceptions
 *   and every option carries feedback addressing the misconception.
 * - `predict` — predict-observe-explain (White & Gunstone): commit to a
 *   prediction first, then go verify it in the experiment above.
 * - `experiment-task` — assessment inside the simulation ("make it
 *   diverge"): the experiment itself reports completion, so the check is
 *   continued play, not exam cosplay.
 * - `transfer` — the north-star item (docs/06 success metrics): a novel,
 *   *unseen* case the exhibit never walked through, written so it cannot be
 *   passed by parroting the exhibit's wording. This is whiteboard transfer —
 *   prediction + diagnosis + explanation applied somewhere new.
 */

export type ChoiceOption = {
  label: string;
  correct?: boolean;
  /** Shown after selection: why this is right, or what misconception it is. */
  feedback: string;
};

type ItemBase = {
  id: string;
  difficulty: 1 | 2 | 3;
  /** Sub-skills this item measures, e.g. "linreg:why-squared-error". */
  targets: string[];
};

export type ChoiceItem = ItemBase & {
  kind: "choice";
  prompt: string;
  options: ChoiceOption[];
};

export type PredictItem = ItemBase & {
  kind: "predict";
  /** The state to put the experiment in before committing to a prediction. */
  setup: string;
  prompt: string;
  options: ChoiceOption[];
  /** After answering: how to go see the truth with your own hands. */
  verify: string;
};

export type ExperimentTaskItem = ItemBase & {
  kind: "experiment-task";
  prompt: string;
  /** Event id the experiment reports when the task condition is met. */
  taskEvent: string;
  /** Shown on completion: what just happened and why it matters. */
  feedback: string;
};

export type TransferItem = ItemBase & {
  kind: "transfer";
  /** The novel, unseen case — a situation the exhibit did not walk through. */
  scenario: string;
  prompt: string;
  options: ChoiceOption[];
};

export type AssessmentItem =
  | ChoiceItem
  | PredictItem
  | ExperimentTaskItem
  | TransferItem;

export type ConceptCheck = {
  nodeId: string;
  items: AssessmentItem[];
};
