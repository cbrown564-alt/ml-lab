import type { AssessmentItem, ConceptCheck } from "@/lib/assessment/schema";
import type { AssessmentForm } from "./rubric";

/**
 * Mechanizable detectors for rubric v2 (docs/08 §1c) — pure functions over a
 * `ConceptCheck`, shared by the `/review` form (to pre-fill what the machine can
 * decide) and the `check:rubric` linter (to gate the build). Only the
 * machine-decidable sub-checks live here; `transferIsInteractiveOrOpen` is a
 * taste call left blank for the human.
 */

const hasOptions = (
  item: AssessmentItem,
): item is Extract<AssessmentItem, { options: unknown }> => "options" in item;

/**
 * The assessment-form sub-checks the build can decide from the content alone:
 *
 * - `playableExperimentTask` — ≥1 `experiment-task` wired to a `taskEvent` (the
 *   check is continued play, not a text instruction).
 * - `processFeedbackEveryOption` — every option-bearing item gives feedback on
 *   every option (feedback on *process*, docs/06 B5).
 * - `notPureMcqStack` — the act is not only choice/transfer cards: a pure MCQ
 *   stack is an automatic B5 fail (docs/08 §1c). The presence of an
 *   `experiment-task` or a `predict`-then-verify beat is what redeems it.
 */
export function detectAssessmentForm(
  check: ConceptCheck,
): Pick<AssessmentForm, "playableExperimentTask" | "processFeedbackEveryOption" | "notPureMcqStack"> {
  const playableExperimentTask = check.items.some(
    (i) => i.kind === "experiment-task" && i.taskEvent.length > 0,
  );

  const processFeedbackEveryOption = check.items.every((item) => {
    if (!hasOptions(item)) return true;
    return item.options.every((o) => o.feedback.trim().length > 0);
  });

  const interactiveKinds = check.items.some(
    (i) => i.kind === "experiment-task" || i.kind === "predict",
  );
  const notPureMcqStack = interactiveKinds;

  return { playableExperimentTask, processFeedbackEveryOption, notPureMcqStack };
}
