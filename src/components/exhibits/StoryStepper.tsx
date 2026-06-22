"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { NarratedSection } from "@/components/narrative/NarratedSection";
import { FrameContext } from "@/components/exhibits/StoryScroller";
import type { BeatView } from "@/lib/exhibit/spine";

/**
 * The guided story as a beat **stepper**, not a scroll spine (the Seeing-Theory /
 * Distill presentation, replacing the R2D3 scroll-driver). One persistent graphic
 * holds the right; the *current* beat's prose + controls + readouts hold the left.
 * You advance by choosing — Prev/Next or the beat rail — never by scrolling, so:
 *
 *   - the graphic and its explanation stay co-visible at any width (no "the visual
 *     disappeared above me" on a half-screen);
 *   - scrolling stays free for reading, and dragging stays free for manipulating —
 *     the two no longer fight over the same gesture;
 *   - object constancy survives: stepping re-frames the one graphic (via
 *     `FrameContext`, the same channel the scroller used) rather than replacing it.
 *
 * The lab reads the active beat's frame with `useActiveFrame()` exactly as before;
 * it neither knows nor cares that an index, not a scroll position, now chooses it.
 */

export function StoryStepper<Frame>({
  beats,
  graphic,
}: {
  beats: BeatView<Frame>[];
  /** The persistent interactive. Reads its frame with useActiveFrame(). */
  graphic: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const count = beats.length;
  const beat = beats[active];
  const segs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = (i: number, focusSeg = false) => {
    const next = Math.max(0, Math.min(count - 1, i));
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

  return (
    <div className="min-[700px]:grid min-[700px]:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] min-[700px]:items-start min-[700px]:gap-8 lg:gap-12 xl:gap-16">
      {/* The persistent graphic. First in source order so it leads when stacked;
          stays side-by-side and pinned from 700px up — half a wide monitor — so
          the graphic and its current beat never lose sight of each other. */}
      <div className="min-[700px]:order-2 min-[700px]:col-start-2 min-[700px]:sticky min-[700px]:top-8">
        <FrameContext.Provider value={beat.frame}>{graphic}</FrameContext.Provider>
      </div>

      {/* The beat panel: rail, then the current beat's prose. */}
      <div className="mt-8 min-[700px]:order-1 min-[700px]:col-start-1 min-[700px]:mt-0">
        <nav
          aria-label="Story beats"
          onKeyDown={onRailKey}
          className="flex items-center justify-between gap-4 border-b border-line pb-5"
        >
          <ol className="flex items-center gap-2">
            {beats.map((b, i) => {
              const state =
                i === active ? "bg-accent" : i < active ? "bg-ink-faint" : "bg-line";
              return (
                <li key={b.sectionId} className="flex">
                  <button
                    type="button"
                    ref={(el) => {
                      segs.current[i] = el;
                    }}
                    aria-current={i === active ? "step" : undefined}
                    aria-label={`Beat ${i + 1} of ${count}${b.heading ? `: ${b.heading}` : ""}`}
                    tabIndex={i === active ? 0 : -1}
                    onClick={() => go(i)}
                    className="flex items-center py-2"
                  >
                    <span
                      className={`h-1.5 w-9 rounded-full transition-colors ${state} ${
                        i === active ? "" : "hover:bg-ink-muted"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-ink-faint uppercase tabular-nums">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label="Previous beat"
                disabled={active === 0}
                onClick={() => go(active - 1)}
                className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Back
              </button>
              <button
                type="button"
                aria-label="Next beat"
                disabled={active === count - 1}
                onClick={() => go(active + 1)}
                className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </nav>

        {/* The beat changes in place. Keying on the index remounts the prose so it
            re-enters softly and any playing narration stops when you step away. */}
        <p className="sr-only" aria-live="polite">
          Beat {active + 1} of {count}
          {beat.heading ? `: ${beat.heading}` : ""}
        </p>
        <div key={active} className="lift-fog mt-7 min-h-[16rem]">
          <NarratedSection
            tone={active === 0 ? "hook" : "story"}
            heading={beat.heading}
            paragraphs={beat.paragraphs}
            audio={beat.audio}
            terms={beat.terms}
          />
          {beat.equation && (
            <div className="mt-5 overflow-x-auto rounded-lg bg-sunken px-5 py-3 font-mono text-[15px] leading-relaxed text-ink">
              {beat.equation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
