"use client";

import type { VizHue } from "@/lib/exhibit/spine";
import { hueInk, hueMark, MOTION_MOVE, usePrefersReducedMotion } from "./shared";

export type CausalStep = {
  id: string;
  label: string;
  hue?: VizHue;
};

/**
 * TRACE/INSPECT — Causal trace (visual-standards audit).
 *
 * A pulse travels cause → intermediate representations → final metric so the
 * learner can follow one quantity's influence through the pipeline.
 */
export function CausalTrace({
  steps,
  activeStepId,
  direction = "horizontal",
  pulse = true,
  ariaLabel,
}: {
  steps: CausalStep[];
  /** Which step currently carries the pulse highlight. */
  activeStepId?: string;
  direction?: "horizontal" | "vertical";
  /** Animate a traveling pulse along the chain; static highlight when reduced. */
  pulse?: boolean;
  ariaLabel: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const activeIndex = steps.findIndex((s) => s.id === activeStepId);
  const isHorizontal = direction === "horizontal";

  return (
    <ol
      className={
        isHorizontal
          ? "flex items-stretch gap-0 list-none p-0 m-0"
          : "flex flex-col gap-0 list-none p-0 m-0"
      }
      aria-label={ariaLabel}
    >
      {steps.map((step, i) => {
        const isActive = step.id === activeStepId;
        const isPast = activeIndex >= 0 && i < activeIndex;
        const mark = hueMark(step.hue ?? (i === 0 ? "truth" : i === steps.length - 1 ? "prediction" : "param"));
        const ink = hueInk(step.hue ?? (i === 0 ? "truth" : i === steps.length - 1 ? "prediction" : "param"));
        const showPulse = pulse && isActive && !reduceMotion;

        return (
          <li key={step.id} className="flex flex-1 items-stretch min-w-0">
            <div
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2.5 text-center ${
                isActive ? "border-[var(--viz-param)]" : "border-line"
              }`}
              style={{
                background: isActive || isPast
                  ? `color-mix(in oklab, ${mark} ${isActive ? 14 : 8}%, var(--surface-raised))`
                  : "var(--surface-raised)",
                transition: reduceMotion ? undefined : `background ${MOTION_MOVE}, border-color ${MOTION_MOVE}`,
              }}
            >
              {showPulse && (
                <span
                  className="block h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: mark }}
                  aria-hidden
                />
              )}
              <span
                className="font-mono text-[11px] leading-tight"
                style={{ color: isActive ? ink : "var(--ink-muted)" }}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={
                  isHorizontal
                    ? "flex w-6 shrink-0 items-center justify-center"
                    : "flex h-6 shrink-0 items-center justify-center"
                }
                aria-hidden
              >
                <span
                  className={isHorizontal ? "block h-px w-full" : "block h-full w-px"}
                  style={{
                    background: isPast || isActive ? mark : "var(--line)",
                    opacity: isPast ? 0.9 : 0.5,
                  }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
