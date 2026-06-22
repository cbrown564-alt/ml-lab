"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  ChoiceItem,
  ChoiceOption,
  ConceptCheck,
  ExperimentTaskItem,
  PredictItem,
  TransferItem,
} from "@/lib/assessment/schema";
import { onTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated, type MasteryLevel } from "@/lib/learner/store";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Concept check — assessment that deepens rather than interrupts (docs/06, B5),
 * composed as the exhibit's capstone (Stream 2: our learning loop is the edge the
 * benchmark set lacks, so it earns real presentation). A live progress meter
 * reads the bench like an instrument; each item carries its kind, difficulty, and
 * status in the mono catalogue voice; and a closing payoff ties the mastery just
 * earned to the next stop in the journey — orient, practise, advance.
 *
 * Choice and predict items give explanatory feedback on every selection and let
 * the learner change their answer (the latest answer counts). Experiment-task
 * items complete from inside the simulation itself. Results feed the mastery model.
 */

type ItemStatus = "unanswered" | "resolved" | "revisit";

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

const KIND_LABEL = {
  choice: "Recall",
  predict: "Predict & verify",
  "experiment-task": "Lab task",
  transfer: "Transfer",
} as const;

/** The catalogue strip over each item: index · kind · difficulty · live status. */
function ItemHeader({
  index,
  kind,
  difficulty,
  status,
}: {
  index: number;
  kind: keyof typeof KIND_LABEL;
  difficulty: 1 | 2 | 3;
  status: ItemStatus;
}) {
  const chip =
    status === "resolved"
      ? { text: "Resolved", cls: "border-accent text-accent" }
      : status === "revisit"
        ? { text: "Revisit", cls: "border-[var(--viz-error)] text-[var(--viz-error-ink)]" }
        : { text: "Open", cls: "border-line text-ink-faint" };
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="font-mono text-xs tracking-widest text-ink-faint tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {KIND_LABEL[kind]}
      </span>
      <span
        role="img"
        className="flex items-center gap-1"
        aria-label={`Difficulty ${difficulty} of 3`}
        title={`Difficulty ${difficulty} of 3`}
      >
        {[1, 2, 3].map((d) => (
          <span
            key={d}
            className={`h-1.5 w-1.5 rounded-full ${d <= difficulty ? "bg-ink-muted" : "bg-line"}`}
          />
        ))}
      </span>
      <span
        className={`ml-auto rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${chip.cls}`}
        role="status"
      >
        {chip.text}
      </span>
    </div>
  );
}

function ChoiceItemView({
  item,
  index,
  nodeId,
  itemCount,
  onStatus,
}: {
  item: ChoiceItem | PredictItem | TransferItem;
  index: number;
  nodeId: string;
  itemCount: number;
  onStatus: (id: string, status: ItemStatus) => void;
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
  const status: ItemStatus =
    chosen === null ? "unanswered" : chosen.correct ? "resolved" : "revisit";
  useEffect(() => onStatus(item.id, status), [status, item.id, onStatus]);

  // Predict and transfer items open with a framing line — the state to set up,
  // or the novel unseen case — before the prompt and options.
  const preamble =
    item.kind === "predict" ? item.setup : item.kind === "transfer" ? item.scenario : null;

  return (
    <li className="border-t border-line py-7 first:border-t-0">
      <ItemHeader index={index} kind={item.kind} difficulty={item.difficulty} status={status} />
      {preamble && (
        <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-ink-muted">{preamble}</p>
      )}
      <p className={`max-w-[65ch] font-medium ${preamble ? "mt-3" : "mt-4"}`}>{item.prompt}</p>
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
  index,
  nodeId,
  itemCount,
  onStatus,
}: {
  item: ExperimentTaskItem;
  index: number;
  nodeId: string;
  itemCount: number;
  onStatus: (id: string, status: ItemStatus) => void;
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

  useEffect(
    () => onStatus(item.id, done ? "resolved" : "unanswered"),
    [done, item.id, onStatus],
  );

  return (
    <li className="border-t border-line py-7 first:border-t-0">
      <ItemHeader index={index} kind={item.kind} difficulty={item.difficulty} status={done ? "resolved" : "unanswered"} />
      <p className="mt-4 max-w-[65ch] font-medium">{item.prompt}</p>
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

/**
 * The earned level, shown in the payoff. A sibling of MasteryBadge but without
 * its shared test id — the header already owns that handle, and one node must
 * not surface two elements under it.
 */
function EarnedLevel({ nodeId }: { nodeId: string }) {
  const level = useLearner((s) => s.mastery[nodeId]?.level);
  const hydrated = useHydrated();
  if (!hydrated || !level || level === "untouched") return null;
  const styles: Record<Exclude<MasteryLevel, "untouched">, string> = {
    seen: "border-line text-ink-faint",
    practiced: "border-line text-ink-muted",
    assessed: "border-accent/50 text-accent",
    mastered: "border-accent bg-accent text-accent-ink",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-xs tracking-wide ${styles[level]}`}>
      {level}
    </span>
  );
}

/** Where this exhibit leads, for the closing payoff. */
export type CheckNext = { title: string; href?: string; live: boolean };

export function ConceptCheckSection({
  check,
  nodeTitle,
  next,
}: {
  check: ConceptCheck;
  /** This exhibit's title, named in the payoff ("you've worked through …"). */
  nodeTitle?: string;
  /** The journey's next stop, surfaced once the bench is cleared. */
  next?: CheckNext;
}) {
  const total = check.items.length;
  const [status, setStatus] = useState<Record<string, ItemStatus>>({});
  const onStatus = useStableStatusSetter(setStatus);

  const resolved = Object.values(status).filter((s) => s === "resolved").length;
  const allResolved = resolved === total;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="max-w-[60ch]">
          <h2 className="text-2xl font-semibold tracking-tight">Explain it</h2>
          <p className="mt-2 leading-relaxed text-ink-muted">
            The real test isn&apos;t recall — it&apos;s whether you could rebuild
            this at a whiteboard. Work the checks (the latest answer counts), then
            the closing transfer: a case you haven&apos;t seen, that only the
            intuition can solve.
          </p>
        </div>
        {/* The live meter — the bench read as an instrument. */}
        <div className="shrink-0">
          <p className="font-mono text-[11px] tracking-widest text-ink-faint uppercase tabular-nums">
            {resolved} of {total} resolved
          </p>
          <ol className="mt-2 flex items-center gap-1.5" aria-hidden>
            {check.items.map((item) => {
              const s = status[item.id] ?? "unanswered";
              const cls =
                s === "resolved"
                  ? "bg-accent"
                  : s === "revisit"
                    ? "bg-[var(--viz-error)]"
                    : "bg-line";
              return <li key={item.id} className={`h-1.5 w-7 rounded-full ${cls}`} />;
            })}
          </ol>
        </div>
      </div>

      <ol className="mt-6">
        {check.items.map((item, i) =>
          item.kind === "experiment-task" ? (
            <ExperimentTaskView
              key={item.id}
              item={item}
              index={i}
              nodeId={check.nodeId}
              itemCount={total}
              onStatus={onStatus}
            />
          ) : (
            <ChoiceItemView
              key={item.id}
              item={item}
              index={i}
              nodeId={check.nodeId}
              itemCount={total}
              onStatus={onStatus}
            />
          ),
        )}
      </ol>

      {/* The payoff: mastery earned, and the road on. */}
      <div className="mt-8 rounded-xl border border-line bg-raised p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
            {allResolved ? "Bench cleared" : "Your standing"}
          </span>
          <EarnedLevel nodeId={check.nodeId} />
        </div>
        <p className="mt-3 max-w-[60ch] leading-relaxed text-ink-muted">
          {allResolved ? (
            <>
              All {total} resolved — you could now reconstruct
              {nodeTitle ? ` ${nodeTitle}` : " this"} at a whiteboard: what it does,
              why, how it breaks, and where it transfers. The mastery model has the
              receipts.
            </>
          ) : (
            <>
              Resolve all {total} to lock in mastery for
              {nodeTitle ? ` ${nodeTitle}` : " this exhibit"} — the meter above
              tracks what&apos;s left.
            </>
          )}
        </p>
        {next && (
          <p className="mt-4 text-sm">
            {next.href ? (
              <Link
                href={next.href}
                className="font-medium text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2"
              >
                {next.live ? `Next: ${next.title} →` : "Browse the map →"}
              </Link>
            ) : (
              <Link
                href="/#map"
                className="font-medium text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2"
              >
                Back to the map →
              </Link>
            )}
          </p>
        )}
      </div>
    </section>
  );
}

/** A stable callback that folds each item's reported status into the map. */
function useStableStatusSetter(
  setStatus: React.Dispatch<React.SetStateAction<Record<string, ItemStatus>>>,
) {
  const [fn] = useState(
    () => (id: string, s: ItemStatus) =>
      setStatus((prev) => (prev[id] === s ? prev : { ...prev, [id]: s })),
  );
  return fn;
}
