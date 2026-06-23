"use client";

import { useMemo } from "react";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { DataLeakageFrame } from "@content/exhibits/data-leakage/spine";
import { crossValR2, type HeldOut, type Matrix } from "@/lib/models/leakage";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * The See-it graphic: the predicted-vs-actual scatter for the held-out points under
 * the pipeline the active beat asserts — leaky (a confident diagonal on noise) until
 * the reveal, then honest (a shapeless cloud at R² ≈ 0).
 */
const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;

function Scatter({ points }: { points: HeldOut[] }) {
  const W = 360;
  const H = 360;
  const m = 34;
  const ext = 2.8;
  const sx = (v: number) => m + ((v + ext) / (2 * ext)) * (W - 2 * m);
  const sy = (v: number) => H - m - ((v + ext) / (2 * ext)) * (H - 2 * m);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Predicted versus actual for the held-out points; a real model hugs the diagonal, pure noise scatters off it." className="h-auto w-full max-w-[380px]">
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} fill="none" stroke="var(--line)" />
      <line x1={sx(-ext)} y1={sy(-ext)} x2={sx(ext)} y2={sy(ext)} stroke="var(--ink-faint)" strokeDasharray="4 4" />
      <text x={sx(ext) - 4} y={sy(ext) + 14} textAnchor="end" fontSize={11} fill="var(--ink-faint)" fontStyle="italic">predicted = actual</text>
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.actual)} cy={sy(Math.max(-ext, Math.min(ext, p.predicted)))} r={4} fill="var(--viz-prediction)" fillOpacity={0.7} />
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--ink-faint)" fontFamily="var(--font-mono)">actual target →</text>
    </svg>
  );
}

export function DataLeakageStory() {
  const frame = useActiveFrame<DataLeakageFrame>();
  const leaky = frame?.mode !== "honest";
  const cur = useMemo(() => crossValR2(X, Y, K, FOLDS, leaky), [leaky]);

  return (
    <figure className="flex flex-col items-center rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 self-start font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {leaky ? "Select features on all data — then cross-validate" : "Select inside each fold — the honest way"}
      </figcaption>
      <Scatter points={cur.points} />
      <div className="mt-4 w-full">
        <StatGrid
          caption={leaky ? "Cross-validation says…" : "Honest cross-validation says…"}
          stats={[
            { label: "CV R²", value: cur.meanR2.toFixed(2), hue: leaky ? "var(--viz-error)" : "var(--viz-neutral)", note: leaky ? "looks like real skill" : "the truth: no signal" },
            { label: "real signal", value: "0", hue: "var(--ink-faint)", note: "the data is pure noise" },
          ]}
        />
      </div>
    </figure>
  );
}
