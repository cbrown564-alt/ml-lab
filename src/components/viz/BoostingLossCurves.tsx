"use client";

import { bestRound, boostLossCurve } from "@content/exhibits/gradient-boosting/experiment";

/**
 * The signature visual of gradient boosting: train vs held-out log-loss against the number
 * of rounds (log-x). Training loss sinks toward zero; held-out loss bottoms early and then
 * climbs — the overfitting U you can't see in the (flat) accuracy. A dashed marker sits at
 * the held-out minimum (where you'd stop early), and a moving marker tracks the current
 * round. Train neutral, held-out accent — the cluster's metric grammar.
 */
const MAXR = boostLossCurve[boostLossCurve.length - 1].rounds;
const MAXLL = Math.max(...boostLossCurve.map((c) => Math.max(c.trainLL, c.testLL))) * 1.08;

export function BoostingLossCurves({
  current,
  width = 320,
  height = 150,
}: {
  current: number;
  width?: number;
  height?: number;
}) {
  const m = { top: 12, right: 12, bottom: 26, left: 30 };
  const xs = (r: number) => m.left + (Math.log(Math.max(1, r)) / Math.log(MAXR)) * (width - m.left - m.right);
  const ys = (ll: number) => height - m.bottom - (ll / MAXLL) * (height - m.top - m.bottom);
  const path = (key: "trainLL" | "testLL") =>
    boostLossCurve.map((c, i) => `${i === 0 ? "M" : "L"}${xs(c.rounds).toFixed(1)},${ys(c[key]).toFixed(1)}`).join(" ");

  return (
    <figure>
      <figcaption className="mb-1 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Log-loss vs rounds
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Training log-loss sinks toward zero as rounds are added, while held-out log-loss bottoms early and then climbs — the overfitting U. A dashed line marks the held-out minimum, where you would stop early."
        className="h-auto w-full"
      >
        {/* early-stopping marker at the held-out minimum */}
        <line x1={xs(bestRound)} y1={m.top} x2={xs(bestRound)} y2={height - m.bottom} stroke="var(--viz-truth-ink)" strokeWidth={1} strokeDasharray="2 3" opacity={0.8} />
        <text x={xs(bestRound) + 3} y={m.top + 8} fontSize={8} fontFamily="var(--font-mono)" fill="var(--viz-truth-ink)">stop ~{bestRound}</text>
        {/* current-round marker */}
        <line x1={xs(current)} y1={m.top} x2={xs(current)} y2={height - m.bottom} stroke="var(--viz-param)" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
        {/* axes ticks */}
        {[0, 0.3, 0.6].map((ll) => (
          <text key={ll} x={m.left - 4} y={ys(ll) + 3} textAnchor="end" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">{ll.toFixed(1)}</text>
        ))}
        {[1, 10, 100].map((r) => (
          <text key={r} x={xs(r)} y={height - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">{r}</text>
        ))}
        <path d={path("trainLL")} fill="none" stroke="var(--ink-muted)" strokeWidth={2} strokeDasharray="4 3" />
        <path d={path("testLL")} fill="none" stroke="var(--accent)" strokeWidth={2.25} />
      </svg>
      <div className="mt-1 flex gap-4 font-mono text-[10px] text-ink-faint">
        <span><span style={{ color: "var(--ink-muted)" }}>– –</span> train</span>
        <span><span style={{ color: "var(--accent)" }}>—</span> held-out</span>
        <span>rounds →</span>
      </div>
    </figure>
  );
}
