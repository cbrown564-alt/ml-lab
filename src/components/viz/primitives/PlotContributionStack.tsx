"use client";

import { usePlot } from "@/components/viz/Plot";
import { hueMark } from "./shared";

/**
 * SVG contribution stack for use inside {@link Plot}. Residual bars or squared
 * penalties accumulate visibly into a total readout — the score is made from misses.
 */
export function PlotContributionStack({
  values,
  progress,
  total,
  stackLabel,
  totalLabel = "total",
  variant = "bar",
  width: stackW = 52,
  insetRight = 12,
}: {
  values: number[];
  /** 0–1: how many contributions have landed (animated reveal). */
  progress: number;
  total: number;
  stackLabel?: string;
  totalLabel?: string;
  variant?: "bar" | "square";
  width?: number;
  insetRight?: number;
}) {
  const { width, height } = usePlot();
  const stackX = width - insetRight - stackW;
  const maxV = Math.max(...values, 1e-9);
  const shown = Math.max(1, Math.round(progress * values.length));
  const barH = (height - 52) / values.length;
  const mark = hueMark("error");

  return (
    <g aria-hidden>
      {stackLabel && (
        <text
          x={stackX + stackW / 2}
          y={14}
          textAnchor="middle"
          fontSize={10}
          fontFamily="var(--font-mono)"
          fill="var(--ink-faint)"
        >
          {stackLabel}
        </text>
      )}
      {/* ruler ticks — score visibly built from parts */}
      <line
        x1={stackX - 6}
        x2={stackX - 6}
        y1={22}
        y2={height - 40}
        stroke="var(--line)"
        strokeWidth={1}
      />
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const ty = 22 + (height - 62) * t;
        return (
          <line
            key={t}
            x1={stackX - 10}
            x2={stackX - 4}
            y1={ty}
            y2={ty}
            stroke="var(--line)"
            strokeWidth={1}
            opacity={0.7}
          />
        );
      })}
      {values.map((v, i) => {
        const visible = i < shown;
        if (variant === "square") {
          const side = Math.sqrt(v / maxV) * barH * 0.82;
          return (
            <rect
              key={i}
              x={stackX + (barH - side) / 2}
              y={24 + i * barH}
              width={visible ? side : 0}
              height={visible ? side : 0}
              fill={mark}
              opacity={visible ? 0.58 : 0.1}
              rx={1}
              style={{ transition: "width 120ms ease, height 120ms ease" }}
            />
          );
        }
        const h = (v / maxV) * (barH * 0.85);
        return (
          <rect
            key={i}
            x={stackX}
            y={24 + i * barH + (barH - h) / 2}
            width={visible ? (v / maxV) * stackW : 0}
            height={h}
            fill={mark}
            opacity={visible ? 0.68 : 0.12}
            rx={1}
            style={{ transition: "width 120ms ease" }}
          />
        );
      })}
      <rect
        x={stackX - 4}
        y={height - 36}
        width={stackW + 8}
        height={28}
        rx={4}
        fill="var(--surface-bg)"
        stroke="var(--line)"
      />
      <text
        x={stackX + stackW / 2}
        y={height - 24}
        textAnchor="middle"
        fontSize={9}
        fontFamily="var(--font-mono)"
        fill="var(--ink-faint)"
      >
        {totalLabel}
      </text>
      <text
        x={stackX + stackW / 2}
        y={height - 10}
        textAnchor="middle"
        fontSize={13}
        fontFamily="var(--font-mono)"
        fontWeight={600}
        fill="var(--viz-error-ink)"
      >
        {total.toFixed(variant === "square" ? 2 : 1)}
      </text>
    </g>
  );
}
