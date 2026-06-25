"use client";

import type { ReactNode } from "react";
import { MOTION_MOVE, usePrefersReducedMotion } from "./shared";

type PinMode = "overlay" | "side-by-side" | "diff";

/**
 * COMPARE/INTERVENE — Pin and compare (visual-standards audit).
 *
 * Freeze the current state as a ghost layer, then overlay or juxtapose a new
 * state (or a diff-only view) so the learner sees what changed without losing
 * the reference frame.
 */
export function PinAndCompare({
  pinned,
  current,
  mode = "overlay",
  pinnedLabel = "pinned",
  currentLabel = "current",
  pinnedOpacity = 0.45,
  ariaLabel,
}: {
  /** The frozen reference state rendered as a ghost. */
  pinned: ReactNode;
  /** The live or updated state to compare against the pin. */
  current: ReactNode;
  mode?: PinMode;
  pinnedLabel?: string;
  currentLabel?: string;
  pinnedOpacity?: number;
  ariaLabel: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const transition = reduceMotion ? undefined : `opacity ${MOTION_MOVE}`;

  if (mode === "side-by-side") {
    return (
      <div
        className="grid grid-cols-2 gap-3"
        aria-label={ariaLabel}
        role="group"
      >
        <div className="relative overflow-hidden rounded-lg border border-line border-dashed">
          <span className="pointer-events-none absolute top-2 left-2 z-10 rounded bg-raised/90 px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-faint uppercase">
            {pinnedLabel}
          </span>
          <div style={{ opacity: pinnedOpacity }}>{pinned}</div>
        </div>
        <div className="relative overflow-hidden rounded-lg border border-line">
          <span className="pointer-events-none absolute top-2 left-2 z-10 rounded bg-raised/90 px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-faint uppercase">
            {currentLabel}
          </span>
          {current}
        </div>
      </div>
    );
  }

  if (mode === "diff") {
    return (
      <div
        className="relative overflow-hidden rounded-lg border border-line"
        aria-label={ariaLabel}
        role="group"
      >
        <div
          className="absolute inset-0"
          style={{ opacity: pinnedOpacity, transition }}
          aria-hidden
        >
          {pinned}
        </div>
        <div
          className="relative mix-blend-difference"
          style={{ transition }}
        >
          {current}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-line"
      aria-label={ariaLabel}
      role="group"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: pinnedOpacity, transition }}
        aria-hidden
      >
        {pinned}
      </div>
      <div className="relative">{current}</div>
    </div>
  );
}
