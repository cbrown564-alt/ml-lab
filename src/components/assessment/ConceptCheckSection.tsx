"use client";

import { useState } from "react";
import type { AssessmentItem, ConceptCheck } from "@/lib/assessment/schema";
import { useLearner, whenHydrated } from "@/lib/learner/store";

/**
 * Concept check — assessment that deepens rather than interrupts (docs/06,
 * B5). Lives on the calm shell after the experiment. Every selection gets
 * explanatory feedback; learners can change their answer after reading it
 * (the latest answer is what counts — correcting a misconception counts as
 * correcting it). Results feed the mastery model.
 */

function ChoiceItem({
  item,
  nodeId,
  itemCount,
}: {
  item: AssessmentItem;
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
      <p className="max-w-[65ch] font-medium">{item.prompt}</p>
      <div className="mt-4 flex flex-col gap-2">
        {item.options.map((opt, i) => {
          const isPicked = picked === i;
          const state =
            !isPicked ? "idle" : opt.correct ? "correct" : "incorrect";
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
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
      {chosen && (
        <p
          className="mt-4 max-w-[65ch] text-sm leading-relaxed"
          role="status"
          style={{
            color: chosen.correct ? "var(--accent)" : "var(--viz-error)",
          }}
        >
          <span className="font-semibold">
            {chosen.correct ? "Right. " : "Not quite. "}
          </span>
          <span className="text-ink-muted">{chosen.feedback}</span>
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
        {check.items.map((item) => (
          <ChoiceItem
            key={item.id}
            item={item}
            nodeId={check.nodeId}
            itemCount={check.items.length}
          />
        ))}
      </ol>
    </section>
  );
}
