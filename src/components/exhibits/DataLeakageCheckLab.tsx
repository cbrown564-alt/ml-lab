"use client";

import { useMemo, useState } from "react";
import { crossValR2, type HeldOut, type Matrix } from "@/lib/models/leakage";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * The Explain-it companion: a compact predicted-vs-actual scatter pinned beside the
 * checks. Toggle where selection happens and watch the diagonal (leaky, a confident
 * lie) dissolve into a cloud (honest, the truth) — and the R² collapse with it.
 */
const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;

function Scatter({ points }: { points: HeldOut[] }) {
  const W = 300;
  const H = 300;
  const m = 26;
  const ext = 2.8;
  const sx = (v: number) => m + ((v + ext) / (2 * ext)) * (W - 2 * m);
  const sy = (v: number) => H - m - ((v + ext) / (2 * ext)) * (H - 2 * m);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Predicted versus actual for the held-out points." className="h-auto w-full max-w-[300px]">
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} fill="none" stroke="var(--line)" />
      <line x1={sx(-ext)} y1={sy(-ext)} x2={sx(ext)} y2={sy(ext)} stroke="var(--ink-faint)" strokeDasharray="4 4" />
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.actual)} cy={sy(Math.max(-ext, Math.min(ext, p.predicted)))} r={3.5} fill="var(--viz-prediction)" fillOpacity={0.7} />
      ))}
    </svg>
  );
}

export function DataLeakageCheckLab() {
  const [leaky, setLeaky] = useState(false);
  const result = useMemo(() => crossValR2(X, Y, K, FOLDS, leaky), [leaky]);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the score</figcaption>
      <div role="group" aria-label="Where feature selection happens" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-sm">
        {([["inside the fold", false], ["on all data", true]] as const).map(([label, value]) => (
          <button
            key={label}
            type="button"
            aria-pressed={leaky === value}
            onClick={() => setLeaky(value)}
            className={`rounded-full px-3 py-0.5 transition-colors ${leaky === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <Scatter points={result.points} />
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">
        {leaky ? "select on all data" : "select inside each fold"} · CV R² {result.meanR2.toFixed(2)} · true signal 0
      </p>
    </figure>
  );
}
