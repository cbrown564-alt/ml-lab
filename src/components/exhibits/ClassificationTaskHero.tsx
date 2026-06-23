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
        <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)] sm:items-center">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              reading the threshold (t = {T.toFixed(2)})
            </span>
            <p className="max-w-[46ch] text-sm leading-relaxed text-ink-muted">
              Slide the line and the verdict shifts:{" "}
              <span style={{ color: "var(--viz-prediction-ink)" }}>precision {precision(CM).toFixed(2)}</span>{" "}
              (of those called positive, how many were) trades against{" "}
              <span style={{ color: "var(--viz-param-ink)" }}>recall {recall(CM).toFixed(2)}</span>{" "}
              (of the actual positives, how many it caught).
            </p>
          </div>
          <ConfusionMatrix tp={CM.tp} fp={CM.fp} fn={CM.fn} tn={CM.tn} />
        </div>
      </div>
    </figure>
  );
}
