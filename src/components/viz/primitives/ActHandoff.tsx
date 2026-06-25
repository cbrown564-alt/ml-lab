"use client";

import type { ReactNode } from "react";
import { MOTION_MOVE, usePrefersReducedMotion } from "./shared";

/**
 * IDENTITY/NAV — Act handoff (visual-standards audit).
 *
 * The final state of one spine act becomes the explicit starting point of the
 * next — continuity across See it → Run it → Break it → Explain it.
 */
export function ActHandoff({
  fromAct,
  toAct,
  handoff,
  fromLabel,
  toLabel,
  ariaLabel,
}: {
  fromAct: number;
  toAct: number;
  /** The shared state artifact passed between acts (plot snapshot, params, etc.). */
  handoff: ReactNode;
  fromLabel?: string;
  toLabel?: string;
  ariaLabel: string;
}) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
      aria-label={ariaLabel}
      role="group"
    >
      <ActBadge act={fromAct} label={fromLabel ?? `act ${fromAct}`} side="from" />
      <div
        className="relative min-w-[120px] overflow-hidden rounded-lg border border-line bg-raised px-3 py-2"
        style={{
          transition: reduceMotion ? undefined : `box-shadow ${MOTION_MOVE}`,
          boxShadow: "0 0 0 1px color-mix(in oklab, var(--viz-param) 25%, transparent)",
        }}
      >
        {handoff}
      </div>
      <ActBadge act={toAct} label={toLabel ?? `act ${toAct}`} side="to" />
    </div>
  );
}

function ActBadge({
  act,
  label,
  side,
}: {
  act: number;
  label: string;
  side: "from" | "to";
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full border font-mono text-sm tabular-nums"
        style={{
          borderColor: side === "from" ? "var(--line)" : "var(--viz-param)",
          color: side === "to" ? "var(--viz-param-ink)" : "var(--ink-muted)",
          background:
            side === "to"
              ? "color-mix(in oklab, var(--viz-param) 10%, var(--surface-raised))"
              : "var(--surface-raised)",
        }}
      >
        {act}
      </span>
      <span className="max-w-[5rem] font-mono text-[9px] leading-tight tracking-wide text-ink-faint uppercase">
        {label}
      </span>
    </div>
  );
}
