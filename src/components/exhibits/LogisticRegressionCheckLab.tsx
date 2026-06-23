"use client";

import { useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { accuracy, accuracyVec, fitLogistic, fitLogisticVec, probaVec } from "@/lib/models/logistic";
import { curvePoints, expandedRow } from "@content/exhibits/logistic-regression/curve";

/**
 * The Explain-it companion: the curved-boundary classifier, raw vs feature-expanded,
 * so the learner answers against the live boundary — a straight line miscutting the
 * parabola, or a curve that follows it. Toggle and watch the line bend once x₁² is in play.
 */
const LABELS = curvePoints.map((p) => p.y);
const RAW_PARAMS = fitLogistic(curvePoints, { steps: 4000, lr: 0.3 });
const RAW_ACC = accuracy(curvePoints, RAW_PARAMS);
const EXP_W = fitLogisticVec(curvePoints.map(expandedRow), LABELS, { steps: 4000, lr: 0.3 });
const EXP_ACC = accuracyVec(curvePoints.map(expandedRow), LABELS, EXP_W);
const expandedProba = (x1: number, x2: number) => probaVec(EXP_W, [1, x1, x2, x1 * x1]);

export function LogisticRegressionCheckLab() {
  const [expanded, setExpanded] = useState(false);
  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the boundary</figcaption>
      <div role="group" aria-label="Which features the classifier sees" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-sm">
        {([["raw", false], ["+ x₁²", true]] as const).map(([label, value]) => (
          <button
            key={label}
            type="button"
            aria-pressed={expanded === value}
            onClick={() => setExpanded(value)}
            className={`rounded-full px-3 py-0.5 transition-colors ${expanded === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <DecisionField
        points={curvePoints}
        params={expanded ? undefined : RAW_PARAMS}
        predictProba={expanded ? expandedProba : undefined}
        domain={[-4, 4]}
        width={380}
        height={320}
      />
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">
        {expanded ? "curved boundary" : "straight line"} · accuracy {Math.round((expanded ? EXP_ACC : RAW_ACC) * 100)}%
      </p>
    </figure>
  );
}
