"use client";

import { useId, useState } from "react";
import type { PenaltyConfig } from "@/lib/narrative/math";

/**
 * The squared penalty, made visible. Each term of the loss is a residual squared
 * — and "squared" is the whole personality of least squares: drag the miss r and
 * the penalty grows as an *area*, r², not a length. The reader watches a small
 * miss cost almost nothing and a large one dominate the sum, which is exactly why
 * one outlier can wrench the line (the exhibit's predict item, made tactile).
 *
 * "Math beside its consequence" (Stream 2, pattern 5): self-contained, speaking
 * the lab's instrument voice — error-red on the penalty, the mono readout the
 * StatGrid speaks. The range input is the accessible driver; the square mirrors it.
 */

const W = 300;
const H = 220;
const PAD = 22;
const MAX_SIDE = Math.min(W, H) - 2 * PAD;

export function SquaredPenalty({ config }: { config: PenaltyConfig }) {
  const { maxResidual, defaultResidual } = config;
  const [r, setR] = useState(defaultResidual);
  const sliderId = useId();

  const side = (r / maxResidual) * MAX_SIDE;
  const left = PAD;
  const bottom = H - PAD;
  const penalty = r * r;
  const doubled = 4 * penalty;

  return (
    <div className="rounded-xl border border-line bg-raised p-5">
      <p className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        One penalty, squared
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto mt-3 block w-full max-w-[300px]"
        role="img"
        aria-label={`A square whose side is the miss r = ${r.toFixed(1)} and whose area is the penalty r² = ${penalty.toFixed(1)}.`}
      >
        {/* The anchoring corner — the two axes the square grows along. */}
        <line x1={left} y1={bottom} x2={left + MAX_SIDE} y2={bottom} stroke="var(--line)" strokeWidth={1.5} />
        <line x1={left} y1={bottom} x2={left} y2={bottom - MAX_SIDE} stroke="var(--line)" strokeWidth={1.5} />

        {/* The penalty square: side = r, area = r². */}
        <rect
          x={left}
          y={bottom - side}
          width={side}
          height={side}
          fill="var(--viz-error)"
          fillOpacity={0.14}
          stroke="var(--viz-error)"
          strokeWidth={1.5}
        />
        {/* Side = the miss. */}
        <text
          x={left + side / 2}
          y={bottom + 15}
          textAnchor="middle"
          className="fill-[var(--viz-error-ink)] font-mono text-[12px]"
        >
          r = {r.toFixed(1)}
        </text>
        {/* Area = the penalty, once the square is big enough to hold the label. */}
        {side > 46 && (
          <text
            x={left + side / 2}
            y={bottom - side / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--viz-error-ink)] font-mono text-[12px]"
          >
            r² = {penalty.toFixed(1)}
          </text>
        )}
      </svg>

      <input
        id={sliderId}
        type="range"
        min={0}
        max={maxResidual}
        step={0.1}
        value={r}
        onChange={(e) => setR(Number(e.target.value))}
        aria-label="The miss, the residual r"
        className="mt-4 block w-full accent-[var(--viz-error)]"
      />

      <p className="mt-4 text-sm leading-relaxed text-ink-muted">
        <span className="font-mono tabular-nums" style={{ color: "var(--viz-error-ink)" }}>
          miss r = {r.toFixed(1)} → penalty r² = {penalty.toFixed(1)}
        </span>
        . Double the miss to {(2 * r).toFixed(1)}
        {" and the square doesn’t double — it quadruples, to "}
        {doubled.toFixed(1)}. That is why the line capitulates to a single far point.
      </p>
    </div>
  );
}
