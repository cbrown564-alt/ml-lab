"use client";

import type { VizHue } from "@/lib/exhibit/spine";
import { hueMark } from "./shared";

export type Contribution = {
  id: string;
  label: string;
  value: number;
  hue?: VizHue;
};

/**
 * COMPARE/INTERVENE — Contribution stack (visual-standards audit).
 *
 * Individual per-example or per-term contributions stack visibly into a total
 * loss or score so aggregation is legible, not a black-box sum.
 */
export function ContributionStack({
  contributions,
  total,
  totalLabel = "total",
  orientation = "vertical",
  maxMagnitude,
  ariaLabel,
}: {
  contributions: Contribution[];
  total: number;
  totalLabel?: string;
  orientation?: "vertical" | "horizontal";
  /** Cap bar length; defaults to max absolute contribution × count. */
  maxMagnitude?: number;
  ariaLabel: string;
}) {
  const absMax =
    maxMagnitude ??
    Math.max(
      Math.abs(total),
      ...contributions.map((c) => Math.abs(c.value)),
      1,
    );

  const isVertical = orientation === "vertical";

  return (
    <div
      className={isVertical ? "flex gap-4 items-end" : "flex flex-col gap-3"}
      aria-label={ariaLabel}
      role="img"
    >
      <div
        className={
          isVertical
            ? "flex flex-1 items-end justify-center gap-1.5 min-h-[120px]"
            : "flex flex-col gap-1.5 w-full"
        }
      >
        {contributions.map((c) => {
          const pct = (Math.abs(c.value) / absMax) * 100;
          const color = hueMark(c.hue ?? (c.value < 0 ? "error" : "truth"));
          return (
            <div
              key={c.id}
              className={
                isVertical
                  ? "flex flex-col items-center gap-1 flex-1 max-w-[48px]"
                  : "flex items-center gap-2"
              }
            >
              {isVertical ? (
                <>
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${pct}%`,
                      minHeight: c.value !== 0 ? 4 : 0,
                      background: color,
                      opacity: 0.85,
                    }}
                    title={`${c.label}: ${c.value}`}
                  />
                  <span className="font-mono text-[9px] text-ink-faint text-center leading-tight">
                    {c.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-20 shrink-0 font-mono text-[10px] text-ink-faint truncate">
                    {c.label}
                  </span>
                  <div className="flex-1 h-3 rounded-sm bg-sunken overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${pct}%`,
                        background: color,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span className="w-12 shrink-0 font-mono text-[10px] tabular-nums text-right">
                    {c.value.toFixed(2)}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div
        className={
          isVertical
            ? "flex flex-col items-center gap-1 border-l border-line pl-3"
            : "flex items-center justify-between gap-2 border-t border-line pt-2"
        }
      >
        <span className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">
          {totalLabel}
        </span>
        <span
          className="font-mono text-lg tabular-nums"
          style={{ color: "var(--viz-error-ink)" }}
        >
          {total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
