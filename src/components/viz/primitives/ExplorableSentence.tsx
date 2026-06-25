"use client";

import { useState, type ReactNode } from "react";
import type { VizHue } from "@/lib/exhibit/spine";
import { HUE_INK, HUE_MARK } from "@/lib/narrative/hues";
import { MOTION_QUICK, usePrefersReducedMotion } from "./shared";

export type ExplorableTerm = {
  /** Word or phrase in the sentence that acts as the control. */
  phrase: string;
  /** Shared id linking this term to a mark on the graphic. */
  markId: string;
  hue: VizHue;
};

/**
 * CONNECT/CARRY — Explorable sentence (visual-standards audit).
 *
 * Prose is the control surface: selecting a tinted word or phrase highlights
 * the corresponding mark on the graphic (and vice versa).
 */
export function ExplorableSentence({
  children,
  terms,
  activeMarkId,
  defaultActiveMarkId = null,
  onActiveMarkChange,
  graphic,
  ariaLabel,
}: {
  /** Full sentence text; terms are matched as substrings in order. */
  children: string;
  terms: ExplorableTerm[];
  activeMarkId?: string | null;
  defaultActiveMarkId?: string | null;
  onActiveMarkChange?: (markId: string | null) => void;
  /** Optional graphic slot; bind marks with the same `markId`. */
  graphic?: ReactNode;
  ariaLabel: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const controlled = activeMarkId !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultActiveMarkId);
  const active = controlled ? activeMarkId : internal;

  const setActive = (markId: string | null) => {
    if (!controlled) setInternal(markId);
    onActiveMarkChange?.(markId);
  };

  const segments = segmentSentence(children, terms);

  return (
    <div className="flex flex-col gap-4">
      <p
        className="max-w-[65ch] text-base leading-relaxed text-ink"
        aria-label={ariaLabel}
      >
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return <span key={i}>{seg.value}</span>;
          }
          const isActive = active === seg.term.markId;
          const mark = HUE_MARK[seg.term.hue];
          return (
            <button
              key={i}
              type="button"
              className="mx-0.5 rounded-xs px-0.5 font-medium underline decoration-2 underline-offset-2 hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              style={{
                color: HUE_INK[seg.term.hue],
                textDecorationColor: isActive
                  ? HUE_INK[seg.term.hue]
                  : "color-mix(in oklab, var(--line) 80%, transparent)",
                background: isActive
                  ? `color-mix(in oklab, ${mark} 12%, transparent)`
                  : undefined,
                transition: reduceMotion ? undefined : `background ${MOTION_QUICK}`,
              }}
              aria-pressed={isActive}
              onClick={() => setActive(isActive ? null : seg.term.markId)}
              onMouseEnter={() => setActive(seg.term.markId)}
              onMouseLeave={() => setActive(null)}
            >
              {seg.term.phrase}
            </button>
          );
        })}
      </p>
      {graphic}
    </div>
  );
}

type Segment =
  | { type: "text"; value: string }
  | { type: "term"; term: ExplorableTerm };

function segmentSentence(text: string, terms: ExplorableTerm[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  for (const term of terms) {
    const idx = text.indexOf(term.phrase, cursor);
    if (idx < 0) continue;
    if (idx > cursor) {
      segments.push({ type: "text", value: text.slice(cursor, idx) });
    }
    segments.push({ type: "term", term });
    cursor = idx + term.phrase.length;
  }
  if (cursor < text.length) {
    segments.push({ type: "text", value: text.slice(cursor) });
  }
  return segments.length ? segments : [{ type: "text", value: text }];
}

/** Hook for graphic children to read the active explorable mark id. */
export function useExplorableMark(
  activeMarkId: string | null | undefined,
  markId: string,
): boolean {
  return activeMarkId === markId;
}
