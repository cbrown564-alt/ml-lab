"use client";

import { useMemo, useState } from "react";
import { ErrorSpreadStrip } from "@/components/exhibits/ErrorSpreadStrip";
import { kFoldCV, p10p90Spread, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE, TT_LAMBDA } from "@content/exhibits/train-test-generalization/experiment";

/**
 * The Explain-it companion: the holdout-size lottery, live. Shrink the held-out set and
 * the test-error histogram across many random splits sprawls; enlarge it and it collapses
 * to a spike — while the cross-validation mark stays put. Answer the checks against the spread.
 */
const N = pooledPoints.length;
const SEEDS = Array.from({ length: 24 }, (_, i) => i + 1);
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1, TT_LAMBDA).meanErr;

export function TrainTestCheckLab() {
  const [testSize, setTestSize] = useState(4);
  const errs = useMemo(
    () => SEEDS.map((s) => scoreSplit(splitPoints(pooledPoints, testSize / N, s), TT_DEGREE, TT_LAMBDA).testErr),
    [testSize],
  );
  const spread = p10p90Spread(errs);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the spread</figcaption>
      <div className="mb-3 rounded-lg border border-line bg-sunken p-3">
        <label className="flex items-center justify-between text-sm text-ink-muted">
          <span>held-out points</span>
          <span className="font-mono tabular-nums text-ink">{testSize}</span>
        </label>
        <input type="range" aria-label="Number of held-out test points" min={3} max={20} step={1} value={testSize} onChange={(e) => setTestSize(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
      </div>
      <ErrorSpreadStrip
        errs={errs}
        axisMax={0.3}
        marks={[{ value: CV, label: "CV", color: "var(--accent)" }]}
        width={360}
        height={150}
        bins={16}
      />
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">spread {spread.toFixed(3)} · CV {CV.toFixed(3)} (steady)</p>
    </figure>
  );
}
