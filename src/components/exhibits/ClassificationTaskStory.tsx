"use client";

import { useMemo } from "react";
import { StatGrid } from "@/components/viz/StatGrid";
import { DecisionConveyor } from "@/components/exhibits/ClassificationViews";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { ClassificationFrame } from "@content/exhibits/classification-task/spine";
import { fitLogistic, proba } from "@/lib/models/logistic";
import { confusion, precision, recall, type Scored } from "@/lib/models/classification-metrics";
import { logisticPoints } from "@content/exhibits/logistic-regression/experiment";

/**
 * The See-it graphic: the probability strip + confusion matrix at the threshold the
 * active beat asserts — ½, then raised (precision↑/recall↓), then the extremes.
 */
const FIT = fitLogistic(logisticPoints, { steps: 4000, lr: 0.5 });
const SCORED: Scored[] = logisticPoints
  .map((p) => ({ prob: proba(FIT, p.x1, p.x2), y: p.y }))
  .sort((a, b) => a.prob - b.prob);

export function ClassificationTaskStory() {
  const frame = useActiveFrame<ClassificationFrame>();
  const threshold = frame?.threshold ?? 0.5;
  const cm = useMemo(() => confusion(SCORED, threshold), [threshold]);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Threshold t = {threshold.toFixed(2)} — {threshold > 0.65 ? "cautious" : threshold < 0.35 ? "eager" : "balanced"}
      </figcaption>
      <DecisionConveyor scored={SCORED} threshold={threshold} />
      <div className="mt-5">
        <StatGrid
          caption="Reading the decision"
          stats={[
            { label: "precision", value: precision(cm).toFixed(2), hue: "var(--viz-prediction)", note: "of called-positive, how many were" },
            { label: "recall", value: recall(cm).toFixed(2), hue: "var(--viz-param)", note: "of actual positives, how many caught" },
          ]}
        />
      </div>
    </figure>
  );
}
