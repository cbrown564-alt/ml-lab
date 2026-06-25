"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useActHandoffOptional } from "@/components/exhibits/ActHandoffContext";
import { NarratedSection } from "@/components/narrative/NarratedSection";
import { FrameContext } from "@/components/exhibits/story-frame";
import type { BeatPredict, BeatView } from "@/lib/exhibit/spine";

/**
 * The guided story as a beat **stepper** (the Seeing-Theory / Distill model). One
 * persistent graphic holds the right; the *current* beat's prose + controls +
 * readouts hold the left. You advance by choosing — Prev/Next or the beat rail —
 * never by scrolling, so:
 *
 *   - the graphic and its explanation stay co-visible at any width (no "the visual
 *     disappeared above me" on a half-screen);
 *   - scrolling stays free for reading, and dragging stays free for manipulating —
 *     the two no longer fight over the same gesture;
 *   - object constancy survives: stepping re-frames the one graphic (via
 *     `FrameContext`) rather than replacing it.
 *
 * The lab reads the active beat's frame with `useActiveFrame()`; it neither knows
 * nor cares that an index, not a scroll position, now chooses it.
 *
 * Field notes — where the concept lives once you leave the lab — close the walk as
 * a final "In the wild" step over the calm at-rest graphic, so the story ends on
 * its real-world payoff and nothing scrolls below it.
 */

export type StoryStepperLayout = "diptych" | "continuous";

type Step<Frame> =
  | { kind: "beat"; heading?: string; beat: BeatView<Frame>; frame: Frame }
  | { kind: "notes"; heading: string; notes: string[]; frame: Frame };

export function StoryStepper<Frame>({
  beats,
  graphic,
  fieldNotes,
  layout = "diptych",
}: {
  beats: BeatView<Frame>[];
  /** The persistent interactive. Reads its frame with useActiveFrame(). */
  graphic: ReactNode;
  /** Real-world notes; rendered as the closing "In the wild" step when present. */
  fieldNotes?: string[];
  /**
   * Composition mode. `diptych` (default) keeps prose beside the sticky graphic
   * from 700px up; `continuous` stacks one canvas the learner reads top-to-bottom.
   */
  layout?: StoryStepperLayout;
}) {
  const steps: Step<Frame>[] = [
    ...beats.map((beat) => ({
      kind: "beat" as const,
      heading: beat.heading,
      beat,
      frame: beat.frame,
    })),
    ...(fieldNotes && fieldNotes.length > 0
      ? [
          {
            kind: "notes" as const,
            heading: "In the wild",
            notes: fieldNotes,
            // Rest the graphic on the last beat's frame — a calm closing image.
            frame: beats[beats.length - 1].frame,
          },
        ]
      : []),
  ];

  const [active, setActive] = useState(0);
  const count = steps.length;
  const step = steps[active];
  const segs = useRef<(HTMLButtonElement | null)[]>([]);
  const handoff = useActHandoffOptional();
  const isContinuous = layout === "continuous";

  // Hand the active frame to later acts (Run-it can seed from the story's last beat).
  useEffect(() => {
    handoff?.setStoryFrame(step.frame);
  }, [handoff, step.frame]);

  const go = (i: number, focusSeg = false) => {
    const next = Math.max(0, Math.min(count - 1, i));
    if (next !== active) handoff?.markStoryInteraction();
    setActive(next);
    if (focusSeg) segs.current[next]?.focus();
  };

  // Arrow keys step — but only while focus is inside the rail, so they never
  // collide with the plot's own arrow-key point nudging.
  const onRailKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1, true);
    }
  };

  const gridClass = isContinuous
    ? "story-continuous flex flex-col gap-8"
    : "story-diptych min-[700px]:grid min-[700px]:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] min-[700px]:items-start min-[700px]:gap-8 lg:gap-12 xl:gap-16";

  const graphicClass = isContinuous
    ? "story-graphic"
    : "story-graphic min-[700px]:order-2 min-[700px]:col-start-2 min-[700px]:sticky min-[700px]:top-8";

  const panelClass = isContinuous
    ? "story-panel"
    : "story-panel mt-8 min-[700px]:order-1 min-[700px]:col-start-1 min-[700px]:mt-0";

  return (
    <div className={gridClass}>
      {/* The persistent graphic. First in source order when stacked; side-by-side
          and pinned from 700px up in diptych mode. */}
      <div className={graphicClass}>
        <FrameContext.Provider value={step.frame}>{graphic}</FrameContext.Provider>
      </div>

      {/* The beat panel: rail, then the current step. */}
      <div className={panelClass}>
        <nav
          aria-label="Story beats"
          onKeyDown={onRailKey}
          className="chrome-story-rail flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line pb-5"
        >
          <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
            {steps.map((s, i) => {
              const state =
                i === active ? "bg-accent" : i < active ? "bg-ink-faint" : "bg-line";
              return (
                <li key={i} className="flex">
                  <button
                    type="button"
                    ref={(el) => {
                      segs.current[i] = el;
                    }}
                    aria-current={i === active ? "step" : undefined}
                    aria-label={`Beat ${i + 1} of ${count}${s.heading ? `: ${s.heading}` : ""}`}
                    tabIndex={i === active ? 0 : -1}
                    onClick={() => go(i)}
                    className="flex items-center py-2"
                  >
                    <span
                      className={`h-1.5 w-7 rounded-full transition-colors ${state} ${
                        i === active ? "" : "hover:bg-ink-muted"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="chrome-story-transport flex shrink-0 items-center gap-3">
            <span className="chrome-story-counter font-mono text-xs tracking-widest whitespace-nowrap text-ink-faint uppercase tabular-nums">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label="Previous beat"
                disabled={active === 0}
                onClick={() => go(active - 1)}
                className="rounded-full border border-line px-3 py-1.5 text-sm whitespace-nowrap text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                type="button"
                aria-label="Next beat"
                disabled={active === count - 1}
                onClick={() => go(active + 1)}
                className="rounded-full border border-line px-3 py-1.5 text-sm whitespace-nowrap text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </nav>

        {/* The step changes in place. Keying on the index remounts it so it
            re-enters softly and any playing narration stops when you step away. */}
        <p className="sr-only" aria-live="polite">
          Beat {active + 1} of {count}
          {step.heading ? `: ${step.heading}` : ""}
        </p>
        <div key={active} className="lift-fog mt-7 min-h-[16rem]">
          {step.kind === "beat" ? (
            <>
              <NarratedSection
                tone={active === 0 ? "hook" : "story"}
                heading={step.beat.heading}
                paragraphs={step.beat.paragraphs}
                audio={step.beat.audio}
                terms={step.beat.terms}
              />
              {step.beat.equation && (
                <div className="mt-5 overflow-x-auto rounded-lg bg-sunken px-5 py-3 font-mono text-[15px] leading-relaxed text-ink">
                  {step.beat.equation}
                </div>
              )}
              {step.beat.predict && (
                <BeatPrediction
                  predict={step.beat.predict}
                  onInteract={() => handoff?.markStoryInteraction()}
                />
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">{step.heading}</h2>
              <ul className="mt-5">
                {step.notes.map((note, i) => (
                  <li
                    key={i}
                    className="mt-3 border-l-2 border-line pl-4 leading-relaxed text-ink-muted first:mt-0"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A committed prediction inside a See-it beat: the learner commits before stepping
 * on to the reveal. This is the choreography's predict-then-verify opening beat made
 * first-class in the template, so every exhibit enforces it rather than narrating it.
 * State is per-beat (the step remounts on advance), so a prediction resets if revisited.
 */
function BeatPrediction({
  predict,
  onInteract,
}: {
  predict: BeatPredict;
  onInteract?: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const chosen = picked !== null ? predict.options[picked] : null;
  return (
    <div className="mt-6 rounded-lg border border-line bg-sunken p-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
        Predict first
      </p>
      <p className="mt-2 font-medium text-ink">{predict.prompt}</p>
      <div className="mt-3 flex flex-col gap-2">
        {predict.options.map((opt, i) => {
          const isPicked = picked === i;
          const state = !isPicked ? "idle" : opt.correct ? "correct" : "incorrect";
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                onInteract?.();
                setPicked(i);
              }}
              aria-pressed={isPicked}
              className={`rounded-lg border px-4 py-2.5 text-left text-sm leading-relaxed transition-colors ${
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
        <>
          <p
            className="mt-3 text-sm leading-relaxed"
            role="status"
            style={{ color: chosen.correct ? "var(--accent)" : "var(--viz-error)" }}
          >
            <span className="font-semibold">
              {chosen.correct ? "You're right. " : "Commit noted — watch. "}
            </span>
            <span className="text-ink-muted">{chosen.feedback}</span>
          </p>
          <p className="mt-2 text-sm text-ink-faint">Now step on and see it happen.</p>
        </>
      )}
    </div>
  );
}
