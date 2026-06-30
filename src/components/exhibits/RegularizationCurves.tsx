"use client";

import { useMemo } from "react";
import type { Point } from "@/lib/models/linear-regression";
import { chebMSE, ridgeFitCheb } from "@/lib/models/polynomial";

/**
 * Error against the regularisation strength λ (log axis), at a fixed, over-powered
 * degree. Training error only rises as λ pushes the weights down; test error — the
 * honest one — is U-shaped in λ: high at λ→0 (the model overfits), high again when
 * λ is so large it underfits, lowest in between. The current λ and the best λ are
 * marked.
 */
export function RegularizationCurves({
  train,
  test,
  degree,
  lambda,
  lambdaMin = 1e-4,
  lambdaMax = 100,
  width = 340,
  height = 200,
}: {
  train: Point[];
  test: Point[];
  degree: number;
  lambda: number;
  lambdaMin?: number;
  lambdaMax?: number;
  width?: number;
  height?: number;
}) {
  const data = useMemo(() => {
    const rows: { lam: number; train: number; test: number }[] = [];
    const steps = 44;
    const l0 = Math.log10(lambdaMin);
    const l1 = Math.log10(lambdaMax);
    for (let i = 0; i <= steps; i++) {
      const lam = 10 ** (l0 + ((l1 - l0) * i) / steps);
      const m = ridgeFitCheb(train, degree, lam);
      rows.push({ lam, train: chebMSE(train, m), test: chebMSE(test, m) });
    }
    return rows;
  }, [train, test, degree, lambdaMin, lambdaMax]);

  const yMax = useMemo(() => {
    const peak = data.reduce((m, r) => Math.max(m, r.train, r.test), 0);
    return peak > 0 ? peak * 1.08 : 0.5;
  }, [data]);
  const m = { l: 36, r: 10, t: 12, b: 26 };
  const l0 = Math.log10(lambdaMin);
  const l1 = Math.log10(lambdaMax);
  const px = (lam: number) => m.l + ((Math.log10(lam) - l0) / (l1 - l0)) * (width - m.l - m.r);
  const py = (e: number) => height - m.b - (Math.min(e, yMax) / yMax) * (height - m.t - m.b);
  const line = (key: "train" | "test") =>
    data.map((r, i) => `${i === 0 ? "M" : "L"} ${px(r.lam).toFixed(1)} ${py(r[key]).toFixed(1)}`).join(" ");
  const best = data.reduce((a, b) => (b.test < a.test ? b : a));

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Error vs penalty λ
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Training and test error against the ridge penalty λ on a log axis. Training error rises with λ; test error is U-shaped, lowest near λ = ${best.lam.toExponential(1)}.`} className="h-auto w-full">
        <line x1={m.l} x2={width - m.r} y1={height - m.b} y2={height - m.b} stroke="var(--line)" />
        <line x1={m.l} x2={m.l} y1={m.t} y2={height - m.b} stroke="var(--line)" />
        <text x={m.l} y={height - 8} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">←less</text>
        <text x={width - m.r} y={height - 8} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">more λ→</text>
        <line x1={px(best.lam)} x2={px(best.lam)} y1={m.t} y2={height - m.b} stroke="var(--accent)" strokeOpacity={0.4} strokeDasharray="3 3" />
        <text x={px(best.lam)} y={m.t + 2} textAnchor="middle" fontSize={9} fill="var(--accent)">best λ</text>
        <line x1={px(lambda)} x2={px(lambda)} y1={m.t} y2={height - m.b} stroke="var(--viz-param)" strokeWidth={1.5} />
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
