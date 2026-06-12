"use client";

import { useId } from "react";
import type { ParamDef } from "@/lib/experiment/spec";

/**
 * Parameter control (viz kit v1) — manipulable model parameters carry the
 * param hue lab-wide. Log-scaled defs (learning rates) get a slider that
 * moves through exponents, not values; nobody can pick 1e-6 on a linear
 * track that also reaches 2.
 */
function formatParam(def: ParamDef, value: number): string {
  if (!def.log) return String(value);
  // Log-scaled values span decades: exponential below readable range.
  return value < 1e-3 ? value.toExponential(0) : value.toPrecision(2);
}

export function ParamSlider({
  def,
  value,
  onChange,
}: {
  def: ParamDef;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const toTrack = (v: number) => (def.log ? Math.log10(v) : v);
  const fromTrack = (t: number) => (def.log ? 10 ** t : t);

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={id}
        title={def.hint}
        className="text-sm whitespace-nowrap text-ink-muted"
      >
        {def.label}
      </label>
      <input
        id={id}
        type="range"
        min={toTrack(def.min)}
        max={toTrack(def.max)}
        step={def.log ? 0.05 : def.step}
        value={toTrack(value)}
        onChange={(e) => onChange(fromTrack(Number(e.target.value)))}
        className="w-36 accent-[var(--viz-param)]"
      />
      <span
        className="min-w-[5.5ch] font-mono text-sm tabular-nums"
        style={{ color: "var(--viz-param)" }}
      >
        {formatParam(def, value)}
      </span>
    </div>
  );
}
