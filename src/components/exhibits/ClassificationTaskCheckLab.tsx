"use client";

import { useMemo, useState } from "react";
import { ConfusionMatrix } from "@/components/exhibits/ClassificationViews";
import { accuracyOf, confusion, recall } from "@/lib/models/classification-metrics";
import { imbalancedScored } from "@content/exhibits/classification-task/imbalance";

/**
 * The Explain-it companion: the imbalanced confusion matrix, live. Drag the threshold
 * and watch accuracy stay high while recall — the share of the 3 rare positives caught
 * — tells the real story.
 */
export function ClassificationTaskCheckLab() {
  const [threshold, setThreshold] = useState(0.5);
  const cm = useMemo(() => confusion(imbalancedScored, threshold), [threshold]);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the matrix</figcaption>
      <div className="mb-4 rounded-lg border border-line bg-sunken p-3">
        <label className="flex items-center justify-between text-sm text-ink-muted">
          <span>threshold</span>
          <span className="font-mono tabular-nums text-ink">{threshold.toFixed(2)}</span>
        </label>
        <input
          type="range"
          aria-label="Decision threshold"
          min={0.02}
          max={0.98}
          step={0.01}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </div>
      <ConfusionMatrix tp={cm.tp} fp={cm.fp} fn={cm.fn} tn={cm.tn} />
      <p className="mt-3 font-mono text-xs text-ink-faint tabular-nums">
        accuracy {Math.round(accuracyOf(cm) * 100)}% · recall {recall(cm).toFixed(2)} (of 3 positives)
      </p>
    </figure>
  );
}
