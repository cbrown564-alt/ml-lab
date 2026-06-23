"use client";

import { useEffect, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { accuracy, createLogisticDescent, type LogisticParams, type LogisticStep } from "@/lib/models/logistic";
import { logisticPoints } from "@content/exhibits/logistic-regression/experiment";

/**
 * The specimen hero — what a classifier learns, as a before/after. Untrained, the
 * sigmoid has no opinion: a flat ~50% field with the two classes scattered through
 * it. Trained, it carves a decision boundary — a gold→blue probability gradient
 * that separates the classes and says how sure it is. Same points, before and after
 * learning. The fields fade in on load; reduced motion renders them drawn.
 */

const TRACE: LogisticStep[] = (() => {
  const run = createLogisticDescent(logisticPoints, { lr: 0.5, l2: 1e-3 });
  run.run(220);
  return [...run.trace];
})();
const UNTRAINED = TRACE[0].params;
const TRAINED = TRACE[TRACE.length - 1].params;
const ACC0 = Math.round(accuracy(logisticPoints, UNTRAINED) * 100);
const ACC1 = Math.round(accuracy(logisticPoints, TRAINED) * 100);

function Panel({
  kicker,
  acc,
  accHue,
  params,
  reveal,
}: {
  kicker: string;
  acc: number;
  accHue: string;
  params: LogisticParams;
  reveal: number;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</span>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: accHue }}>
          {acc}%
        </span>
      </div>
      <div style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
        <DecisionField points={logisticPoints} params={params} showProb width={520} height={400} />
      </div>
    </div>
  );
}

export function LogisticRegressionHero() {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 360);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Logistic regression
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          learning a decision boundary
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        <Panel kicker="untrained — no opinion" acc={ACC0} accHue="var(--ink-muted)" params={UNTRAINED} reveal={reveal} />
        <Panel kicker="trained — the boundary" acc={ACC1} accHue="var(--viz-prediction-ink)" params={TRAINED} reveal={reveal} />
      </div>
    </figure>
  );
}
