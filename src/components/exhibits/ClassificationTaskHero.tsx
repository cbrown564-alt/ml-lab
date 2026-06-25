"use client";

import { ConfusionMatrix, DecisionConveyor } from "@/components/exhibits/ClassificationViews";
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
const CM = confusion(SCORED, T);

export function ClassificationTaskHero() {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          A classification task
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          threshold → bins → metrics
        </span>
      </figcaption>
      <div className="px-4 py-4">
        <DecisionConveyor scored={SCORED} threshold={T} animate />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4 px-1">
          <div className="flex gap-8">
            <Metric label="precision" value={precision(CM)} hue="var(--viz-prediction-ink)" note="of predicted +" />
            <Metric label="recall" value={recall(CM)} hue="var(--viz-param-ink)" note="of actual +" />
          </div>
          <ConfusionMatrix tp={CM.tp} fp={CM.fp} fn={CM.fn} tn={CM.tn} />
        </div>
      </div>
    </figure>
  );
}

function Metric({ label, value, hue, note }: { label: string; value: number; hue: string; note: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[10px] tracking-wide text-ink-faint uppercase">{label}</span>
      <span className="font-mono text-2xl tabular-nums" style={{ color: hue }}>
        {value.toFixed(2)}
      </span>
      <span className="font-mono text-[10px] tracking-wide text-ink-faint uppercase">{note}</span>
    </div>
  );
}
