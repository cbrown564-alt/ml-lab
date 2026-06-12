"use client";

import { useEffect, useState } from "react";
import type {
  ChoiceItem,
  ChoiceOption,
  ConceptCheck,
  ExperimentTaskItem,
  PredictItem,
} from "@/lib/assessment/schema";
import { onTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";

/**
 * Concept check — assessment that deepens rather than interrupts (docs/06,
 * B5). Lives on the calm shell after the experiment. Choice and predict
 * items give explanatory feedback on every selection and let the learner
 * change their answer (the latest answer counts — correcting a misconception
 * counts as correcting it). Experiment-task items complete from inside the
 * simulation itself. Results feed the mastery model.
 */

function Options({
  options,
  picked,
  onPick,
}: {
  options: ChoiceOption[];
  picked: number | null;
  onPick: (i: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {options.map((opt, i) => {
        const isPicked = picked === i;
        const state = !isPicked ? "idle" : opt.correct ? "correct" : "incorrect";
        return (
          <button
            key={i}
            type="button"
            onClick={() => onPick(i)}
            aria-pressed={isPicked}
            className={`max-w-[70ch] rounded-lg border px-4 py-3 text-left text-sm leading-relaxed transition-colors ${
              state === "correct"
                ? "border-accent bg-raised"
                : state === "incorrect"
                  ? "border-[var(--viz-error)] bg-raised"
                  : "border-line bg-raised hover:border-ink-faint"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Feedback({ chosen }: { chosen: ChoiceOption }) {
  return (
    <p
      className="mt-4 max-w-[65ch] text-sm leading-relaxed"
      role="status"
      style={{ color: chosen.correct ? "var(--accent)" : "var(--viz-error)" }}
    >
      <span className="font-semibold">{chosen.correct ? "Right. " : "Not quite. "}</span>
      <span className="text-ink-muted">{chosen.feedback}</span>
    </p>
  );
}

function ChoiceItemView({
  item,
  nodeId,
  itemCount,
}: {
  item: ChoiceItem | PredictItem;
  nodeId: string;
  itemCount: number;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const recordAnswer = useLearner((s) => s.recordAnswer);

  const pick = (i: number) => {
    setPicked(i);
    whenHydrated(() =>
      recordAnswer(nodeId, item.id, item.options[i].correct === true, itemCount),
    );
  };

  const chosen = picked !== null ? item.options[picked] : null;

  return (
    <li className="border-t border-line py-7 first:border-t-0">
      {item.kind === "predict" && (
        <p className="max-w-[65ch] font-mono text-xs tracking-widest text-ink-faint uppercase">
          Predict, then verify
        </p>
      )}
      {item.kind === "predict" && (
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
          {item.setup}
        </p>
      )}
      <p className={`max-w-[65ch] font-medium ${item.kind === "predict" ? "mt-3" : ""}`}>
        {item.prompt}
      </p>
      <Options options={item.options} picked={picked} onPick={pick} />
      {chosen && <Feedback chosen={chosen} />}
      {chosen && item.kind === "predict" && (
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink">Now verify it: </span>
          {item.verify}
        </p>
      )}
    </li>
  );
}

function ExperimentTaskView({
  item,
  nodeId,
  itemCount,
}: {
  item: ExperimentTaskItem;
  nodeId: string;
  itemCount: number;
}) {
  const recordAnswer = useLearner((s) => s.recordAnswer);
  // Completion persists: the mastery evidence log already knows.
  const storedDone = useLearner((s) =>
    (s.mastery[nodeId]?.evidence ?? []).some((e) => e.itemId === item.id && e.correct),
  );
  const [justDone, setJustDone] = useState(false);
  const done = storedDone || justDone;

  useEffect(() => {
    if (done) return;
    return onTaskEvent((event) => {
      if (event !== item.taskEvent) return;
      setJustDone(true);
      whenHydrated(() => recordAnswer(nodeId, item.id, true, itemCount));
    });
  }, [done, item.taskEvent, item.id, nodeId, itemCount, recordAnswer]);

  return (
    <li className="border-t border-line py-7 first:border-t-0">
      <p className="max-w-[65ch] font-mono text-xs tracking-widest text-ink-faint uppercase">
        Lab task
      </p>
      <p className="mt-2 max-w-[65ch] font-medium">{item.prompt}</p>
      {done ? (
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed" role="status">
          <span className="font-semibold" style={{ color: "var(--accent)" }}>
            Done — the experiment felt it.{" "}
          </span>
          <span className="text-ink-muted">{item.feedback}</span>
        </p>
      ) : (
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-ink-faint" role="status">
          Waiting on the experiment above — this one is completed with your
          hands, not a click here.
        </p>
      )}
    </li>
  );
}

export function ConceptCheckSection({ check }: { check: ConceptCheck }) {
  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="text-sm font-medium tracking-wide text-ink-faint uppercase">
        Check your understanding
      </h2>
      <ol className="mt-2">
        {check.items.map((item) =>
          item.kind === "experiment-task" ? (
            <ExperimentTaskView
              key={item.id}
              item={item}
              nodeId={check.nodeId}
              itemCount={check.items.length}
            />
          ) : (
            <ChoiceItemView
              key={item.id}
              item={item}
              nodeId={check.nodeId}
              itemCount={check.items.length}
            />
          ),
        )}
      </ol>
    </section>
  );
}
