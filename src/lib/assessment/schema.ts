/**
 * Assessment types (docs/03-data-model.md §3), v1: choice items. Every
 * option carries learner-facing feedback — distractors encode real
 * misconceptions, and the feedback addresses the misconception, not just
 * the verdict (docs/06, B5). Other kinds (parameter-prediction,
 * experiment-task) land with Phase 1.
 */

export type ChoiceOption = {
  label: string;
  correct?: boolean;
  /** Shown after selection: why this is right, or what misconception it is. */
  feedback: string;
};

export type AssessmentItem = {
  id: string;
  kind: "choice";
  prompt: string;
  options: ChoiceOption[];
  difficulty: 1 | 2 | 3;
  /** Sub-skills this item measures, e.g. "linreg:why-squared-error". */
  targets: string[];
};

export type ConceptCheck = {
  nodeId: string;
  items: AssessmentItem[];
};
