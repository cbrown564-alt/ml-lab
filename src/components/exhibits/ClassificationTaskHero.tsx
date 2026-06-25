"use client";

import { useMemo } from "react";
import { DecisionConveyor } from "@/components/exhibits/ClassificationViews";
import { fitLogistic, proba } from "@/lib/models/logistic";
import { confusion, precision, recall, type Scored } from "@/lib/models/classification-metrics";
import { logisticPoints } from "@content/exhibits/logistic-regression/experiment";

/**
 * The specimen hero — a decision conveyor: observations ride to the threshold gate
 * and drop into TP/FP/FN/TN bins while precision and recall update live. The
 * mechanism is one frame — not a dashboard of adjacent widgets.
 */

const FIT = fitLogistic(logisticPoints, { steps: 4000, lr: 0.5 });
const SCORED: Scored[] = logisticPoints
  .map((p) => ({ prob: proba(FIT, p.x1, p.x2), y: p.y }))
  .sort((a, b) => a.prob - b.prob);
const T = 0.5;

export function ClassificationTaskHero() {
  const cm = useMemo(() => confusion(SCORED, T), []);
  const prec = precision(cm);
  const rec = recall(cm);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          A classification task
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          precision {prec.toFixed(2)} · recall {rec.toFixed(2)}
        </span>
      </figcaption>
      <div className="px-4 py-4">
        <DecisionConveyor scored={SCORED} threshold={T} animate showMetrics />
      </div>
    </figure>
  );
}
