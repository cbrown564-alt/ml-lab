"use client";

import type { ReactNode } from "react";
import { hueInk, hueMark } from "./shared";

/**
 * TRACE/INSPECT — Step microscope (visual-standards audit).
 *
 * Freeze one learning step and lay out before → gradient/update → after so the
 * learner can inspect a single parameter move under magnification.
 */
export function StepMicroscope({
  stepIndex,
  before,
  vector,
  after,
  updateLabel = "update",
  vectorLabel = "gradient",
  ariaLabel,
}: {
  /** Which optimization step is frozen (display only). */
  stepIndex: number;
  before: ReactNode;
  /** The direction or delta applied at this step (arrow, vector field slot). */
  vector: ReactNode;
  after: ReactNode;
  updateLabel?: string;
  vectorLabel?: string;
  ariaLabel: string;
}) {
  const paramInk = hueInk("param");
  const paramMark = hueMark("param");

  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2"
      aria-label={ariaLabel}
      role="group"
    >
      <MicroscopePanel label="before" kicker={`step ${stepIndex}`}>
        {before}
      </MicroscopePanel>

      <Arrow glyph="→" hue="neutral" />

      <MicroscopePanel label={vectorLabel} accent>
        <div
          className="rounded-md border border-dashed p-2"
          style={{ borderColor: paramMark }}
        >
          {vector}
        </div>
        <span
          className="mt-1 block text-center font-mono text-[9px] tracking-wider uppercase"
          style={{ color: paramInk }}
        >
          {updateLabel}
        </span>
      </MicroscopePanel>

      <Arrow glyph="→" hue="neutral" />

      <MicroscopePanel label="after">
        {after}
      </MicroscopePanel>
    </div>
  );
}

function MicroscopePanel({
  label,
  kicker,
  accent = false,
  children,
}: {
  label: string;
  kicker?: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
          {label}
        </span>
        {kicker && (
          <span className="font-mono text-[9px] text-ink-faint">{kicker}</span>
        )}
      </div>
      <div
        className={`overflow-hidden rounded-lg border p-2 ${
          accent ? "border-[var(--viz-param)]" : "border-line"
        } bg-raised`}
      >
        {children}
      </div>
    </div>
  );
}

function Arrow({
  glyph,
  hue,
}: {
  glyph: string;
  hue: "prediction" | "truth" | "error" | "param" | "neutral";
}) {
  return (
    <span
      className="shrink-0 font-mono text-lg select-none"
      style={{ color: hueMark(hue) }}
      aria-hidden
    >
      {glyph}
    </span>
  );
}
