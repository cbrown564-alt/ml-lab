"use client";

import type { Scored } from "@/lib/models/classification-metrics";

/**
 * Shared classification views — the probability strip and the confusion matrix — used
 * by both the classification-task lab and its See-it graphic, so the threshold reads
 * the same in the guided story and the open bench.
 */

export function ProbabilityStrip({ scored, threshold }: { scored: Scored[]; threshold: number }) {
  const W = 560;
  const H = 146;
  const m = { l: 62, r: 14, t: 28, b: 26 };
  const x = (p: number) => m.l + p * (W - m.l - m.r);
  const row1 = m.t + 18; // actual class 1 — top band
  const row0 = H - m.b - 18; // actual class 0 — bottom band
  const rowOf = (y: 0 | 1) => (y === 1 ? row1 : row0);
  const tx = x(threshold);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Each point at its predicted probability; the threshold at ${threshold.toFixed(2)} splits predict 0 (left) from predict 1 (right). The top row is actual class 1, the bottom row actual class 0; a point on the wrong side of the line for its row is ringed red — a misclassification.`} className="h-auto w-full">
      {/* decision zones: a point's hue (actual class) matching its zone (predicted
          class) is correct; a clash is an error. */}
      <rect x={m.l} y={m.t} width={tx - m.l} height={H - m.t - m.b} fill="var(--viz-truth)" opacity={0.1} />
      <rect x={tx} y={m.t} width={W - m.r - tx} height={H - m.t - m.b} fill="var(--viz-prediction)" opacity={0.1} />
      {/* row guides + their true-class labels */}
      {([row1, row0] as const).map((ry) => (
        <line key={ry} x1={m.l} x2={W - m.r} y1={ry} y2={ry} stroke="var(--line)" strokeOpacity={0.6} />
      ))}
      <text x={m.l - 10} y={row1 + 3} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">actual 1</text>
      <text x={m.l - 10} y={row0 + 3} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">actual 0</text>
      <line x1={tx} x2={tx} y1={m.t - 8} y2={H - m.b + 8} stroke="var(--ink)" strokeWidth={2.25} strokeDasharray="5 3" />
      <text x={tx} y={m.t - 12} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink-muted)">t = {threshold.toFixed(2)}</text>
      <text x={m.l} y={H - 7} fontSize={10} fill="var(--ink-faint)">← predict 0</text>
      <text x={W - m.r} y={H - 7} textAnchor="end" fontSize={10} fill="var(--ink-faint)">predict 1 →</text>
      {scored.map((s, i) => {
        const pred = s.prob >= threshold ? 1 : 0;
        const correct = pred === s.y;
        return (
          <circle
            key={i}
            cx={x(s.prob)}
            cy={rowOf(s.y)}
            r={correct ? 5.5 : 6.5}
            fill={s.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"}
            stroke={correct ? "var(--surface-bg)" : "var(--viz-error)"}
            strokeWidth={correct ? 1.25 : 3}
          />
        );
      })}
    </svg>
  );
}

function Cell({ n, label, good, large }: { n: number; label: string; good: boolean; large?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border ${large ? "p-3.5" : "p-2"}`}
      style={{
        borderColor: good ? "var(--viz-prediction)" : "var(--viz-error)",
        background: good ? "color-mix(in oklab, var(--viz-prediction) 9%, transparent)" : "color-mix(in oklab, var(--viz-error) 9%, transparent)",
      }}
    >
      <span className={`font-mono tabular-nums ${large ? "text-2xl" : "text-lg"}`} style={{ color: good ? "var(--viz-prediction-ink)" : "var(--viz-error-ink)" }}>{n}</span>
      <span className="font-mono text-[10px] tracking-wide text-ink-faint uppercase">{label}</span>
    </div>
  );
}

export function ConfusionMatrix({ tp, fp, fn, tn, large = false }: { tp: number; fp: number; fn: number; tn: number; large?: boolean }) {
  return (
    <div>
      <div className="mb-1 grid grid-cols-[auto_1fr_1fr] gap-1 text-center font-mono text-[10px] tracking-wide text-ink-faint uppercase">
        <span />
        <span>actual 1</span>
        <span>actual 0</span>
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-1">
        <span className="font-mono text-[10px] tracking-wide text-ink-faint uppercase [writing-mode:vertical-rl] rotate-180">pred 1</span>
        <Cell n={tp} label="TP" good large={large} />
        <Cell n={fp} label="FP" good={false} large={large} />
        <span className="font-mono text-[10px] tracking-wide text-ink-faint uppercase [writing-mode:vertical-rl] rotate-180">pred 0</span>
        <Cell n={fn} label="FN" good={false} large={large} />
        <Cell n={tn} label="TN" good large={large} />
      </div>
    </div>
  );
}
