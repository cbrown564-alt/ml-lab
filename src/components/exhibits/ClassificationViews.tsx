"use client";

import { useEffect, useMemo, useState } from "react";
import { precision, recall, type Scored } from "@/lib/models/classification-metrics";
import { MOTION_MOVE, usePrefersReducedMotion } from "@/components/viz/primitives/shared";

/**
 * Shared classification views — the decision conveyor, probability strip, and
 * confusion matrix — used by the classification-task hero, lab, and story so the
 * threshold reads the same everywhere.
 */

type Outcome = "tp" | "fp" | "fn" | "tn";

function outcomeOf(s: Scored, threshold: number): Outcome {
  const pred = s.prob >= threshold ? 1 : 0;
  if (pred === 1 && s.y === 1) return "tp";
  if (pred === 1 && s.y === 0) return "fp";
  if (pred === 0 && s.y === 1) return "fn";
  return "tn";
}

const BIN_LAYOUT: Record<Outcome, { cx: number; cy: number; good: boolean; label: string }> = {
  tp: { cx: 188, cy: 175, good: true, label: "TP" },
  fp: { cx: 308, cy: 175, good: false, label: "FP" },
  fn: { cx: 188, cy: 252, good: false, label: "FN" },
  tn: { cx: 308, cy: 252, good: true, label: "TN" },
};

/**
 * Decision conveyor — observations ride the belt to the threshold gate and drop
 * into TP/FP/FN/TN bins; precision and recall update from what's landed.
 */
export function DecisionConveyor({
  scored,
  threshold,
  animate = false,
  showMetrics = true,
}: {
  scored: Scored[];
  threshold: number;
  /** Hero load: stagger dots dropping into bins once. */
  animate?: boolean;
  /** Hide inline precision/recall when StatGrid already shows them. */
  showMetrics?: boolean;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const W = showMetrics ? 640 : 560;
  const H = 290;
  const m = { l: 56, r: showMetrics ? 20 : 24, t: 32, b: 16 };
  const beltY1 = m.t + 22;
  const beltY0 = m.t + 58;
  const beltW = W - m.l - m.r;
  const x = (p: number) => m.l + p * beltW;
  const tx = x(threshold);

  const counts = useMemo(() => {
    const c = { tp: 0, fp: 0, fn: 0, tn: 0 };
    for (const s of scored) c[outcomeOf(s, threshold)]++;
    return c;
  }, [scored, threshold]);

  const cm = { tp: counts.tp, fp: counts.fp, fn: counts.fn, tn: counts.tn };
  const prec = precision(cm);
  const rec = recall(cm);

  const [shown, setShown] = useState(animate ? 0 : scored.length);

  useEffect(() => {
    if (!animate || reduceMotion) {
      const id = requestAnimationFrame(() => setShown(scored.length));
      return () => cancelAnimationFrame(id);
    }
    const reset = requestAnimationFrame(() => setShown(0));
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= scored.length) window.clearInterval(interval);
    }, 48);
    return () => {
      cancelAnimationFrame(reset);
      window.clearInterval(interval);
    };
  }, [animate, scored.length, reduceMotion]);

  const landed = scored.slice(0, shown);
  const moveTransition = reduceMotion ? undefined : `cx 220ms ease-out, cy 260ms ease-out`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Decision conveyor at threshold ${threshold.toFixed(2)}: observations cross the gate and land in true-positive, false-positive, false-negative, and true-negative bins.${showMetrics ? ` Precision ${prec.toFixed(2)}, recall ${rec.toFixed(2)}.` : ""}`}
      className="h-auto w-full"
    >
      {[beltY1, beltY0].map((by) => (
        <g key={by}>
          <rect x={m.l} y={by - 10} width={beltW} height={20} rx={4} fill="var(--surface-sunken)" stroke="var(--line)" />
          <line x1={m.l} x2={W - m.r} y1={by} y2={by} stroke="var(--line)" strokeDasharray="8 6" strokeOpacity={0.45} />
        </g>
      ))}
      <text x={m.l - 8} y={beltY1 + 4} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        actual 1
      </text>
      <text x={m.l - 8} y={beltY0 + 4} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        actual 0
      </text>

      <rect x={tx - 3} y={m.t - 6} width={6} height={beltY0 - m.t + 26} fill="var(--ink)" rx={2} />
      <text x={tx} y={m.t - 12} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
        t = {threshold.toFixed(2)}
      </text>
      <text x={m.l} y={beltY0 + 22} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        ← predict 0
      </text>
      <text x={W - m.r} y={beltY0 + 22} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        predict 1 →
      </text>

      {([beltY1, beltY0] as const).map((by) => (
        <line key={`ch${by}`} x1={tx} y1={by + 12} x2={tx} y2={150} stroke="var(--line)" strokeWidth={1.5} strokeDasharray="3 3" />
      ))}

      {(Object.keys(BIN_LAYOUT) as Outcome[]).map((key) => {
        const b = BIN_LAYOUT[key];
        const n = counts[key];
        return (
          <g key={key}>
            <rect
              x={b.cx - 48}
              y={b.cy - 28}
              width={96}
              height={52}
              rx={6}
              fill={b.good ? "color-mix(in oklab, var(--viz-prediction) 8%, transparent)" : "color-mix(in oklab, var(--viz-error) 8%, transparent)"}
              stroke={b.good ? "var(--viz-prediction)" : "var(--viz-error)"}
              strokeWidth={1.25}
            />
            {/* Count surfaced in a header above the bin, clear of the dots that
                fill it — never occluded. */}
            <text
              x={b.cx}
              y={b.cy - 33}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fill={b.good ? "var(--viz-prediction-ink)" : "var(--viz-error-ink)"}
              style={{ transition: reduceMotion ? undefined : `opacity ${MOTION_MOVE}` }}
            >
              <tspan fontSize={10} fill="var(--ink-faint)">
                {b.label}{" "}
              </tspan>
              <tspan fontSize={16} fontWeight={700}>
                {n}
              </tspan>
            </text>
          </g>
        );
      })}
      {landed.map((s, i) => {
        const out = outcomeOf(s, threshold);
        const bin = BIN_LAYOUT[out];
        const beltY = s.y === 1 ? beltY1 : beltY0;
        const onBelt = animate && i === shown - 1 && shown < scored.length;
        const stackIdx = landed.slice(0, i + 1).filter((p) => outcomeOf(p, threshold) === out).length - 1;
        const binCount = landed.filter((p) => outcomeOf(p, threshold) === out).length;
        const col = stackIdx % 4;
        const row = Math.floor(stackIdx / 4);
        const itemsInRow = Math.min(4, binCount - row * 4);
        // Sparse FP/FN stacks (≤2 dots) need wider pitch than the 11px misclassified diameter.
        const hSpacing = binCount <= 2 ? 14 : 9;
        const cx = onBelt ? x(s.prob) : bin.cx + (col - (itemsInRow - 1) / 2) * hSpacing;
        // Clamp the pile to the bin so dense bins don't overflow into the labels.
        const cy = onBelt ? beltY : bin.cy + 6 - Math.min(row, 4) * 8;
        const correct = out === "tp" || out === "tn";
        return (
          <circle
            key={`${s.prob}-${s.y}-${i}`}
            cx={cx}
            cy={cy}
            r={correct ? 4.5 : 5.5}
            fill={s.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"}
            stroke={correct ? "var(--surface-bg)" : "var(--viz-error)"}
            strokeWidth={correct ? 1 : 2.5}
            style={{ transition: moveTransition }}
          />
        );
      })}

      {showMetrics && (
        <g transform="translate(448, 172)">
          <text x={0} y={0} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
            PRECISION
          </text>
          <text x={0} y={22} fontSize={22} fontFamily="var(--font-mono)" fill="var(--viz-prediction-ink)">
            {prec.toFixed(2)}
          </text>
          <text x={0} y={48} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
            RECALL
          </text>
          <text x={0} y={70} fontSize={22} fontFamily="var(--font-mono)" fill="var(--viz-truth-ink)">
            {rec.toFixed(2)}
          </text>
        </g>
      )}
    </svg>
  );
}

export function ProbabilityStrip({ scored, threshold }: { scored: Scored[]; threshold: number }) {
  const W = 560;
  const H = 146;
  const m = { l: 62, r: 14, t: 28, b: 26 };
  const x = (p: number) => m.l + p * (W - m.l - m.r);
  const row1 = m.t + 18;
  const row0 = H - m.b - 18;
  const rowOf = (y: 0 | 1) => (y === 1 ? row1 : row0);
  const tx = x(threshold);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Each point at its predicted probability; the threshold at ${threshold.toFixed(2)} splits predict 0 (left) from predict 1 (right). The top row is actual class 1, the bottom row actual class 0; a point on the wrong side of the line for its row is ringed red — a misclassification.`} className="h-auto w-full">
      <rect x={m.l} y={m.t} width={tx - m.l} height={H - m.t - m.b} fill="var(--viz-truth)" opacity={0.1} />
      <rect x={tx} y={m.t} width={W - m.r - tx} height={H - m.t - m.b} fill="var(--viz-prediction)" opacity={0.1} />
      {([row1, row0] as const).map((ry) => (
        <line key={ry} x1={m.l} x2={W - m.r} y1={ry} y2={ry} stroke="var(--line)" strokeOpacity={0.6} />
      ))}
      <text x={m.l - 10} y={row1 + 3} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">actual 1</text>
      <text x={m.l - 10} y={row0 + 3} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">actual 0</text>
      <line x1={tx} x2={tx} y1={m.t - 8} y2={H - m.b + 8} stroke="var(--ink)" strokeWidth={2.25} strokeDasharray="5 3" />
      <text x={tx} y={m.t - 12} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink-muted)">t = {threshold.toFixed(2)}</text>
      <text x={m.l} y={H - 7} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">← predict 0</text>
      <text x={W - m.r} y={H - 7} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">predict 1 →</text>
      {scored.map((s, i) => {
        const pred = s.prob >= threshold ? 1 : 0;
        const correct = pred === s.y;
        return (
          <circle
            key={i}
            cx={x(s.prob)}
            cy={rowOf(s.y)}
            r={correct ? 4.5 : 5.5}
            fill={s.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"}
            stroke={correct ? "var(--surface-bg)" : "var(--viz-error)"}
            strokeWidth={correct ? 1 : 2.5}
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
