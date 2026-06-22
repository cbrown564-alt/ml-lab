"use client";

import { useId, useState } from "react";
import type { StabilityConfig } from "@/lib/narrative/math";

/**
 * The speed limit, made crossable. A 1-D number line for the learning rate η:
 * below the cliff (η_critical) every stride lands lower and the walk converges;
 * above it every stride lands higher and the loss explodes. The reader drags one
 * stride marker across the cliff and the readout flips — turning the math view's
 * claim ("0.06 walks home, 0.12 rockets off") into a boundary they can feel.
 *
 * This is "math beside its consequence" (Stream 2, pattern 5): self-contained
 * (its own η, no coupling to the experiment tab), but speaking the lab's
 * instrument voice — mono readouts, the param hue on the stride, error-red on the
 * cliff. The range input is the accessible driver; the SVG mirrors it.
 */

// SVG user-space; rendered responsive via viewBox. Pad leaves room for the
// stride/cliff labels above and the reference ticks below.
const W = 720;
const H = 104;
const PAD_X = 28;
const AXIS_Y = 56;
const trackPct = (PAD_X / W) * 100;

export function StabilityScale({ config }: { config: StabilityConfig }) {
  const { etaCritical, max, defaultEta, marks } = config;
  const [eta, setEta] = useState(defaultEta);
  const sliderId = useId();

  const x = (v: number) => PAD_X + (Math.min(v, max) / max) * (W - 2 * PAD_X);
  const diverges = eta >= etaCritical;
  const tone = diverges ? "var(--viz-error)" : "var(--accent)";
  // How far past (or short of) the cliff, as a percentage of the ceiling.
  const margin = Math.round((Math.abs(eta - etaCritical) / etaCritical) * 100);

  const fmt = (v: number) => v.toFixed(v < 0.1 ? 3 : 2);

  return (
    <div className="rounded-xl border border-line bg-raised p-5">
      <p className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        The stability cliff
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`A number line for the learning rate from 0 to ${max}. The convergence ceiling sits at ${etaCritical}. The current stride is ${fmt(eta)}, which ${diverges ? "diverges" : "converges"}.`}
      >
        {/* Zones: safe below the cliff, danger above. */}
        <rect
          x={x(0)}
          y={AXIS_Y - 14}
          width={x(etaCritical) - x(0)}
          height={28}
          fill="var(--accent)"
          opacity={0.07}
        />
        <rect
          x={x(etaCritical)}
          y={AXIS_Y - 14}
          width={x(max) - x(etaCritical)}
          height={28}
          fill="var(--viz-error)"
          opacity={0.08}
        />

        {/* Axis. */}
        <line x1={x(0)} y1={AXIS_Y} x2={x(max)} y2={AXIS_Y} stroke="var(--line)" strokeWidth={1.5} />

        {/* The cliff. */}
        <line
          x1={x(etaCritical)}
          y1={AXIS_Y - 22}
          x2={x(etaCritical)}
          y2={AXIS_Y + 14}
          stroke="var(--viz-error)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <text
          x={x(etaCritical)}
          y={AXIS_Y - 28}
          textAnchor="middle"
          className="fill-[var(--viz-error-ink)] font-mono text-[12px]"
        >
          η_crit ≈ {etaCritical}
        </text>

        {/* Reference strides the story walked. */}
        {marks.map((m) => (
          <g key={m.label}>
            <line
              x1={x(m.eta)}
              y1={AXIS_Y - 5}
              x2={x(m.eta)}
              y2={AXIS_Y + 5}
              stroke="var(--ink-faint)"
              strokeWidth={1.5}
            />
            <text
              x={x(m.eta)}
              y={AXIS_Y + 26}
              textAnchor="middle"
              className="fill-[var(--ink-muted)] font-mono text-[11px]"
            >
              {fmt(m.eta)}
            </text>
            <text
              x={x(m.eta)}
              y={AXIS_Y + 40}
              textAnchor="middle"
              className={
                m.tone === "danger"
                  ? "fill-[var(--viz-error-ink)] text-[11px]"
                  : "fill-[var(--ink-faint)] text-[11px]"
              }
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* The draggable stride. */}
        <line
          x1={x(eta)}
          y1={AXIS_Y - 20}
          x2={x(eta)}
          y2={AXIS_Y + 12}
          stroke={tone}
          strokeWidth={2}
        />
        <circle cx={x(eta)} cy={AXIS_Y} r={6} fill={tone} stroke="var(--surface-raised)" strokeWidth={2} />
      </svg>

      {/* The accessible driver, aligned to the axis. */}
      <input
        id={sliderId}
        type="range"
        min={0}
        max={max}
        step={0.001}
        value={eta}
        onChange={(e) => setEta(Number(e.target.value))}
        aria-label="Your stride, the learning rate η"
        className="block accent-[var(--viz-param)]"
        style={{ marginLeft: `${trackPct}%`, width: `${100 - 2 * trackPct}%` }}
      />

      {/* The readout flips at the cliff. */}
      <p className="mt-4 text-sm leading-relaxed" style={{ color: tone }}>
        <span className="font-mono tabular-nums">η = {fmt(eta)}</span>
        <span className="font-semibold">
          {diverges ? " — diverges" : " — converges"}
        </span>
        <span className="text-ink-muted">
          {diverges
            ? ` (${margin}% over the ceiling — every step lands higher than the last)`
            : ` (${margin}% under the ceiling — every step lands lower than the last)`}
        </span>
      </p>
    </div>
  );
}
