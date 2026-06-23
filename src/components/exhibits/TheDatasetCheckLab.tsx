"use client";

import { useMemo, useState } from "react";
import { olsFit, predict } from "@/lib/models/linear-regression";
import { corruptedRows, houses, toPoints } from "@content/exhibits/the-dataset/experiment";

/**
 * The Explain-it companion: one bad row, on a toggle. Include the mistyped row and the
 * price-per-m² slope flattens and the 100 m² estimate craters; remove it and both recover
 * — the contrast the checks ask about.
 */
const CLEAN = olsFit(toPoints(houses));

export function TheDatasetCheckLab() {
  const [included, setIncluded] = useState(true);
  const fit = useMemo(() => olsFit(toPoints(included ? [...houses, ...corruptedRows] : houses)), [included]);
  const pred = Math.round(predict(fit, 120));

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">One bad row</figcaption>
      <label className="flex items-center gap-3 rounded-lg border border-line bg-sunken p-3 text-sm">
        <input type="checkbox" checked={included} onChange={(e) => setIncluded(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
        <span className="text-ink">Include the mistyped row</span>
      </label>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">price/m² slope</dt>
          <dd className="mt-0.5 font-mono text-lg" style={{ color: included ? "var(--viz-error-ink)" : "var(--accent)" }}>{fit.slope.toFixed(1)}</dd>
          <dd className="text-[11px] text-ink-faint">true ≈ {CLEAN.slope.toFixed(1)}</dd>
        </div>
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">120 m² estimate</dt>
          <dd className="mt-0.5 font-mono text-lg" style={{ color: included ? "var(--viz-error-ink)" : "var(--accent)" }}>£{pred}k</dd>
          <dd className="text-[11px] text-ink-faint">true ≈ £{Math.round(predict(CLEAN, 120))}k</dd>
        </div>
      </dl>
    </figure>
  );
}
