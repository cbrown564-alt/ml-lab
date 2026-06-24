"use client";

import { useState } from "react";
import { exactMatchAccuracy, mae } from "@/lib/models/regression-task";
import { allExamples, regressionTrend } from "@content/exhibits/regression-task/experiment";

/**
 * The Explain-it companion: the same good model, scored both ways. Slide the "close
 * enough" band and watch accuracy take any value you like, while the distance (MAE) sits
 * fixed and honest — the contrast the checks ask about.
 */
const PREDS = allExamples.map((p) => regressionTrend(p.x));
const TRUTHS = allExamples.map((p) => p.y);
const MAE = mae(PREDS, TRUTHS);

export function RegressionTaskCheckLab() {
  const [tol, setTol] = useState(2);
  const acc = Math.round(exactMatchAccuracy(PREDS, TRUTHS, tol) * 100);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">One model, two rulers</figcaption>
      <div className="rounded-lg border border-line bg-sunken p-3">
        <label className="flex items-center justify-between text-sm text-ink-muted">
          <span>“close enough” band</span>
          <span className="font-mono tabular-nums text-ink">±{tol}</span>
        </label>
        <input type="range" aria-label="Accuracy tolerance band in points" min={1} max={16} step={1} value={tol} onChange={(e) => setTol(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">accuracy</dt>
          <dd className="mt-1 font-mono text-xl text-[var(--viz-error-ink)]">{acc}%</dd>
          <dd className="text-[11px] text-ink-faint">moves with the band</dd>
        </div>
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">distance (MAE)</dt>
          <dd className="mt-1 font-mono text-xl text-accent">{MAE.toFixed(1)}</dd>
          <dd className="text-[11px] text-ink-faint">fixed &amp; honest</dd>
        </div>
      </dl>
    </figure>
  );
}
