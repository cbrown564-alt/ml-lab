"use client";

import { useMemo, useState } from "react";
import { accuracy, fitLogistic } from "@/lib/models/logistic";
import { biasedTrainingSet, whatIsMlData } from "@content/exhibits/what-is-ml/experiment";

/**
 * The Explain-it companion: bias in, bias out, in one slider. Raise the label bias and the
 * model still scores high on its own data while its accuracy on the true population falls
 * — the gap the checks ask you to read.
 */
export function WhatIsMlCheckLab() {
  const [bias, setBias] = useState(0.5);
  const learned = useMemo(() => fitLogistic(biasedTrainingSet(bias)), [bias]);
  const tr = Math.round(accuracy(biasedTrainingSet(bias), learned) * 100);
  const pop = Math.round(accuracy(whatIsMlData, learned) * 100);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Bias in, bias out</figcaption>
      <div className="rounded-lg border border-line bg-sunken p-3">
        <label className="flex items-center justify-between text-sm text-ink-muted">
          <span>label bias</span>
          <span className="font-mono tabular-nums text-ink">{Math.round(bias * 100)}%</span>
        </label>
        <input type="range" aria-label="Fraction of examples mislabelled" min={0} max={1} step={0.05} value={bias} onChange={(e) => setBias(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">on its data</dt>
          <dd className="mt-0.5 font-mono text-lg text-ink">{tr}%</dd>
          <dd className="text-[11px] text-ink-faint">looks fine</dd>
        </div>
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">true population</dt>
          <dd className="mt-0.5 font-mono text-lg" style={{ color: pop < 80 ? "var(--viz-error-ink)" : "var(--accent)" }}>{pop}%</dd>
          <dd className="text-[11px] text-ink-faint">the real test</dd>
        </div>
      </dl>
    </figure>
  );
}
