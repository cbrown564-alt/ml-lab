"use client";

import { useMemo, useState } from "react";
import { StatGrid } from "@/components/viz/StatGrid";
import { ConfusionMatrix, ProbabilityStrip } from "@/components/exhibits/ClassificationViews";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { fitLogistic, proba } from "@/lib/models/logistic";
import {
  accuracyOf,
  confusion,
  f1,
  precision,
  recall,
  type Scored,
} from "@/lib/models/classification-metrics";
import { logisticPoints } from "@content/exhibits/logistic-regression/experiment";
import { classificationTaskScenario } from "@content/exhibits/classification-task/experiment";

/**
 * Classification-task bench: the classifier's probabilities are fixed; the *decision*
 * is yours. Drag the threshold across the probability strip and watch the confusion
 * matrix re-count and precision/recall trade against each other. The model didn't
 * change — only where you drew the line.
 */
const FIT = fitLogistic(logisticPoints, { steps: 4000, lr: 0.5 });
const SCORED: Scored[] = logisticPoints
  .map((p) => ({ prob: proba(FIT, p.x1, p.x2), y: p.y }))
  .sort((a, b) => a.prob - b.prob);

export function ClassificationTaskLab() {
  const [threshold, setThreshold] = useState(0.5);
  const cm = useMemo(() => confusion(SCORED, threshold), [threshold]);
  const regime = threshold > 0.7 ? "cautious — few, sure positives" : threshold < 0.3 ? "eager — catch every positive" : "balanced";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{classificationTaskScenario.prompt}</p>

          <div className="rounded-lg border border-line bg-sunken p-4">
            <label className="flex items-center justify-between text-sm text-ink-muted">
              <span>Decision threshold</span>
              <span className="font-mono tabular-nums text-ink">{threshold.toFixed(2)}</span>
            </label>
            <input
              type="range"
              aria-label="Decision threshold"
              min={0.02}
              max={0.98}
              step={0.01}
              value={threshold}
              onChange={(e) => {
                whenHydrated(() => useLearner.getState().recordPractice("classification-task"));
                setThreshold(Number(e.target.value));
              }}
              className="mt-2 w-full accent-[var(--accent)]"
            />
            <p className="mt-1 font-mono text-[11px] tracking-wide text-ink-faint">{regime}</p>
          </div>

          <StatGrid
            direction="col"
            caption="Reading the same model four ways"
            stats={[
              { label: "precision", value: precision(cm).toFixed(2), hue: "var(--viz-prediction)", note: "of called-positive, how many were" },
              { label: "recall", value: recall(cm).toFixed(2), hue: "var(--viz-param)", note: "of actual positives, how many caught" },
              { label: "accuracy", value: accuracyOf(cm).toFixed(2), hue: "var(--viz-neutral)", note: "share correct overall" },
              { label: "F1", value: f1(cm).toFixed(2), hue: "var(--viz-truth)", note: "the precision/recall balance" },
            ]}
          />
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:mt-0">
          <ProbabilityStrip scored={SCORED} threshold={threshold} />
          <div className="max-w-[360px]">
            <ConfusionMatrix tp={cm.tp} fp={cm.fp} fn={cm.fn} tn={cm.tn} />
          </div>
        </div>
      </div>
    </div>
  );
}
