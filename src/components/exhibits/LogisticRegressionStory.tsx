"use client";

import { useMemo } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { LogisticFrame } from "@content/exhibits/logistic-regression/spine";
import { accuracy, createLogisticDescent, logLoss, type LogisticStep } from "@/lib/models/logistic";
import { logisticPoints } from "@content/exhibits/logistic-regression/experiment";

/**
 * The See-it graphic: the classifier at the training step the active beat asserts —
 * the trained probability field for the sigmoid + payoff, the bare boundary line for
 * the-boundary, a half-swung boundary for training.
 */
const TRACE: LogisticStep[] = (() => {
  const run = createLogisticDescent(logisticPoints, { lr: 0.5, l2: 1e-3 });
  run.run(220);
  return [...run.trace];
})();

export function LogisticRegressionStory() {
  const frame = useActiveFrame<LogisticFrame>();
  const step = Math.min(frame?.step ?? 220, TRACE.length - 1);
  const showProb = frame?.showProb ?? true;
  const cur = TRACE[step];
  const acc = useMemo(() => accuracy(logisticPoints, cur.params), [cur.params]);
  const loss = useMemo(() => logLoss(logisticPoints, cur.params), [cur.params]);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {step === 0 ? "Untrained" : step >= TRACE.length - 1 ? "Trained — the decision boundary" : `Training · step ${step}`}
      </figcaption>
      <DecisionField points={logisticPoints} params={cur.params} showProb={showProb} width={600} height={480} />
      <div className="mt-4">
        <StatGrid
          caption="The classifier's verdict"
          stats={[
            { label: "accuracy", value: `${Math.round(acc * 100)}%`, hue: "var(--viz-prediction)", note: "share correct" },
            { label: "log-loss", value: loss.toFixed(3), hue: "var(--viz-error)", note: "what training minimised" },
            { label: "class hues", value: "0 / 1", hue: "var(--viz-truth)", note: "amber · blue" },
          ]}
        />
      </div>
    </figure>
  );
}
