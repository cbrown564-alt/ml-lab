"use client";

import { useMemo, useState } from "react";
import { kFoldCV, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE } from "@content/exhibits/train-test-generalization/experiment";

/**
 * The Explain-it companion: the holdout-size lottery, live. Shrink the held-out set and
 * the test-error dots from many random splits sprawl; enlarge it and they pull together
 * — while the cross-validation mark stays put. Answer the checks against the spread.
 */
const N = pooledPoints.length;
const SEEDS = Array.from({ length: 24 }, (_, i) => i + 1);
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1).meanErr;

export function TrainTestCheckLab() {
  const [testSize, setTestSize] = useState(3);
  const errs = useMemo(
    () => SEEDS.map((s) => scoreSplit(splitPoints(pooledPoints, testSize / N, s), TT_DEGREE).testErr),
    [testSize],
  );
  const spread = Math.max(...errs) - Math.min(...errs);

  const W = 360;
  const H = 90;
  const m = { l: 12, r: 12, t: 24, b: 20 };
  const hi = Math.max(0.05, ...errs, CV) * 1.2;
  const x = (e: number) => m.l + (Math.min(e, hi) / hi) * (W - m.l - m.r);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the spread</figcaption>
      <div className="mb-3 rounded-lg border border-line bg-sunken p-3">
        <label className="flex items-center justify-between text-sm text-ink-muted">
          <span>held-out points</span>
          <span className="font-mono tabular-nums text-ink">{testSize}</span>
        </label>
        <input type="range" aria-label="Number of held-out test points" min={2} max={16} step={1} value={testSize} onChange={(e) => setTestSize(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Test error from ${errs.length} random splits at ${testSize} held-out points; the cross-validation mark is fixed.`} className="h-auto w-full">
        <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="var(--line)" />
        {errs.map((e, i) => (
          <circle key={i} cx={x(e)} cy={H - m.b - 11} r={3.5} fill="var(--viz-prediction)" fillOpacity={0.4} />
        ))}
        <line x1={x(CV)} x2={x(CV)} y1={m.t - 4} y2={H - m.b} stroke="var(--accent)" strokeWidth={2} />
        <text x={x(CV)} y={m.t - 8} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--accent)">CV</text>
      </svg>
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">spread {spread.toFixed(2)} · CV {CV.toFixed(3)} (steady)</p>
    </figure>
  );
}
