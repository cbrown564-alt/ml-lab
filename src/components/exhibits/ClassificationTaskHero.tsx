"use client";

import { ConfusionMatrix, ProbabilityStrip } from "@/components/exhibits/ClassificationViews";
import { fitLogistic, proba } from "@/lib/models/logistic";
import { confusion, precision, recall, type Scored } from "@/lib/models/classification-metrics";
import { logisticPoints } from "@content/exhibits/logistic-regression/experiment";

/**
 * The specimen hero — what classification adds to a probability: a decision. Every
 * point sits at its predicted probability along the strip; the threshold line cuts
 * it into "predict 0" (left) and "predict 1" (right), and the points that fall on
 * the wrong side are ringed red. Those four outcomes — TP / FP / FN / TN — are the
 * confusion matrix beside it, from which precision and recall are read. The whole
 * mechanism, scores → threshold → verdict, in one frame.
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
          a threshold turns scores into a decision
        </span>
      </figcaption>
      <div className="px-5 py-4">
        <ProbabilityStrip scored={SCORED} threshold={T} />
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:justify-between">
          <ConfusionMatrix tp={CM.tp} fp={CM.fp} fn={CM.fn} tn={CM.tn} large />
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              read off at t = {T.toFixed(2)}
            </span>
            <div className="flex gap-8">
              <Metric label="precision" value={precision(CM)} hue="var(--viz-prediction-ink)" note="of predicted +" />
              <Metric label="recall" value={recall(CM)} hue="var(--viz-param-ink)" note="of actual +" />
            </div>
            <p className="max-w-[28ch] text-xs leading-snug text-ink-faint">
              Slide the line and the two trade: catch more positives, or be surer of the ones you call.
            </p>
          </div>
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
