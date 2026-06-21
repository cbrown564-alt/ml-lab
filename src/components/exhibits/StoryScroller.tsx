"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NarratedSection } from "@/components/narrative/NarratedSection";
import type { BeatView } from "@/lib/exhibit/spine";

/**
 * The canvas-first scrollytelling spine (Stream 2, SYNTHESIS pattern 2). One
 * persistent graphic stays put; prose beats scroll past it and re-frame it as
 * each reaches the centre of the viewport (object constancy — the same marks
 * transform between beats rather than being replaced). The R2D3 layout: a
 * narrow prose rail on the left, the live interactive sticky on the right.
 *
 * The active beat's `frame` travels to the graphic through context, so the lab
 * stays a self-contained client component that simply reacts to the frame it is
 * handed — and remains fully manipulable: scrolling sets the stage, the learner
 * still drives.
 */

const FrameContext = createContext<unknown>(null);

/** Read the frame asserted by the beat currently at centre. Null outside a spine. */
export function useActiveFrame<Frame>(): Frame | null {
  return useContext(FrameContext) as Frame | null;
}

export function StoryScroller<Frame>({
  beats,
  graphic,
}: {
  beats: BeatView<Frame>[];
  /** The persistent interactive. Reads its frame with useActiveFrame(). */
  graphic: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const els = refs.current.filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.beatIndex);
          if (e.isIntersecting) visible.add(idx);
          else visible.delete(idx);
        }
        if (visible.size === 0) return;
        // Among the beats crossing the centre band, the one nearest the
        // midline wins — deterministic during fast scroll and overlaps.
        const mid = window.innerHeight / 2;
        let best = -1;
        let bestDist = Infinity;
        for (const idx of visible) {
          const el = refs.current[idx];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const dist = Math.abs(r.top + r.height / 2 - mid);
          if (dist < bestDist) {
            bestDist = dist;
            best = idx;
          }
        }
        if (best >= 0) setActive(best);
      },
      // Shrink the root to a thin band at the vertical centre: a beat is
      // "active" only while it sits over the middle of the screen.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [beats.length]);

  const activeFrame = beats[active]?.frame ?? null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12 xl:gap-16">
      {/* The persistent graphic. First in source order so it leads on mobile;
          pinned to the right column on big screens. The cell is the sticky
          element itself, with self-start so its containing block is the full
          grid height — that is what keeps it pinned through every beat. */}
      <div className="lg:sticky lg:top-8 lg:order-2 lg:col-start-2 lg:self-start">
        <FrameContext.Provider value={activeFrame}>{graphic}</FrameContext.Provider>
      </div>

      {/* The prose rail: beats that scroll past and re-frame the graphic. */}
      <div className="mt-12 lg:mt-0 lg:order-1 lg:col-start-1">
        {beats.map((beat, i) => (
          <section
            key={beat.sectionId}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-beat-index={i}
            data-beat-id={beat.sectionId}
            data-active={i === active || undefined}
            aria-current={i === active ? "true" : undefined}
            className={`flex min-h-[68vh] flex-col justify-center border-l-2 pl-6 transition-colors duration-300 first:min-h-0 first:justify-start lg:first:pt-[12vh] ${
              i === active ? "border-accent" : "border-line"
            }`}
          >
            <NarratedSection
              tone={i === 0 ? "hook" : "story"}
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
          </section>
        ))}
      </div>
    </div>
  );
}
