"use client";

import { useMemo } from "react";
import type { Point } from "@/lib/models/linear-regression";
import { polyMSE, ridgeFit } from "@/lib/models/polynomial";

/**
 * Error vs model complexity — the bias–variance picture. Training error (the
 * optimistic score) falls monotonically as the degree rises; test error (the only
 * honest one) is U-shaped: high at low degree (bias), high again at high degree
 * (variance), lowest in the middle. The current degree is marked, and so is the
 * sweet spot the test curve picks out.
 */
export function ErrorCurves({
  train,
  test,
  maxDegree = 12,
  degree,
  lambda = 0,
  width = 340,
  height = 200,
}: {
  train: Point[];
  test: Point[];
  maxDegree?: number;
  degree: number;
  lambda?: number;
  width?: number;
  height?: number;
}) {
  const data = useMemo(() => {
    const rows: { d: number; train: number; test: number }[] = [];
    for (let d = 1; d <= maxDegree; d++) {
      const w = ridgeFit(train, d, lambda);
      rows.push({ d, train: polyMSE(train, w), test: polyMSE(test, w) });
    }
    return rows;
  }, [train, test, maxDegree, lambda]);

  const yMax = 0.8; // cap so the U stays legible; overfit spikes clamp to the top
  const m = { l: 36, r: 10, t: 12, b: 26 };
  const px = (d: number) => m.l + ((d - 1) / (maxDegree - 1)) * (width - m.l - m.r);
  const py = (e: number) => height - m.b - (Math.min(e, yMax) / yMax) * (height - m.t - m.b);
  const line = (key: "train" | "test") =>
    data.map((r, i) => `${i === 0 ? "M" : "L"} ${px(r.d).toFixed(1)} ${py(r[key]).toFixed(1)}`).join(" ");
  const best = data.reduce((a, b) => (b.test < a.test ? b : a));

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Error vs complexity
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Training and test error against polynomial degree. Training error falls toward zero; test error is U-shaped with its minimum near degree ${best.d}. The current degree is ${degree}.`} className="h-auto w-full">
        <line x1={m.l} x2={width - m.r} y1={height - m.b} y2={height - m.b} stroke="var(--line)" />
        <line x1={m.l} x2={m.l} y1={m.t} y2={height - m.b} stroke="var(--line)" />
        <text x={m.l} y={height - 8} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">1</text>
        <text x={width - m.r} y={height - 8} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">degree {maxDegree}</text>
        <text x={6} y={m.t + 6} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">err</text>
        {/* sweet spot */}
        <line x1={px(best.d)} x2={px(best.d)} y1={m.t} y2={height - m.b} stroke="var(--accent)" strokeOpacity={0.4} strokeDasharray="3 3" />
        <text x={px(best.d)} y={m.t + 2} textAnchor="middle" fontSize={9} fill="var(--accent)">sweet spot</text>
        {/* current degree */}
        <line x1={px(degree)} x2={px(degree)} y1={m.t} y2={height - m.b} stroke="var(--viz-param)" strokeWidth={1.5} />
        <path d={line("train")} fill="none" stroke="var(--viz-neutral)" strokeWidth={2} strokeLinejoin="round" />
        <path d={line("test")} fill="none" stroke="var(--viz-error)" strokeWidth={2.4} strokeLinejoin="round" />
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-4 rounded-full" style={{ background: "var(--viz-neutral)" }} />
          <span className="text-ink-muted">training error</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-4 rounded-full" style={{ background: "var(--viz-error)" }} />
          <span className="font-medium text-ink">test error (honest)</span>
        </span>
      </div>
    </figure>
  );
}
