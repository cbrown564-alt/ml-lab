"use client";

import { useEffect, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { accuracy, accuracyVec, fitLogistic, fitLogisticVec, probaVec } from "@/lib/models/logistic";
import { curvePoints, expandedRow } from "@content/exhibits/logistic-regression/curve";

/**
 * The interactive "Break it" lab for logistic regression. The true boundary here is a
 * parabola — class 0 in the valley, class 1 above. Trained on the raw coordinates,
 * logistic regression draws the best straight line it can: confident, and confidently
 * wrong on the curve's rising arms (~78%). Then add one engineered feature, x₁², and
 * the same linear model bends its boundary into the parabola and separates them.
 * Trigger → symptom → diagnose → repair: logistic regression is a *linear* classifier,
 * and features are how you bend it.
 */
const LABELS = curvePoints.map((p) => p.y);
const RAW_PARAMS = fitLogistic(curvePoints, { steps: 4000, lr: 0.3 });
const RAW_ACC = accuracy(curvePoints, RAW_PARAMS);
const EXP_W = fitLogisticVec(curvePoints.map(expandedRow), LABELS, { steps: 4000, lr: 0.3 });
const EXP_ACC = accuracyVec(curvePoints.map(expandedRow), LABELS, EXP_W);
const expandedProba = (x1: number, x2: number) => probaVec(EXP_W, [1, x1, x2, x1 * x1]);

type Phase = "broken" | "repaired";

export function LogisticRegressionBreakIt() {
  const [expanded, setExpanded] = useState(false);
  // The task asks the learner to *drive* the failure, so the event only fires once
  // they've worked the toggle — not on mount (panel fix: trigger, don't watch).
  const [hasToggled, setHasToggled] = useState(false);
  useEffect(() => {
    if (hasToggled) reportTaskEvent("logistic-regression:linear-fails-curve");
  }, [hasToggled]);

  const phase: Phase = expanded ? "repaired" : "broken";
  const acc = expanded ? EXP_ACC : RAW_ACC;

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-sunken p-4">
            <div role="group" aria-label="Which features the classifier sees" className="inline-flex self-center rounded-full border border-line p-0.5 text-sm">
              {([["Raw: x₁, x₂", false], ["Add x₁²", true]] as const).map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={expanded === value}
                  onClick={() => {
                    whenHydrated(() => useLearner.getState().recordPractice("logistic-regression"));
                    setHasToggled(true);
                    setExpanded(value);
                  }}
                  className={`rounded-full px-3.5 py-1 transition-colors ${expanded === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
                expanded ? "border-accent text-accent" : "border-[var(--viz-error)] text-[var(--viz-error-ink)]"
              }`}
            >
              {expanded ? "The curve fits" : "A straight line, miscut"}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">accuracy {Math.round(acc * 100)}%</span>
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <DecisionField
            points={curvePoints}
            params={expanded ? undefined : RAW_PARAMS}
            predictProba={expanded ? expandedProba : undefined}
            domain={[-4, 4]}
            width={600}
            height={500}
          />
        </div>
      </div>
    </div>
  );
}

function Guidance({ phase }: { phase: Phase }) {
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          One extra feature — x₁² — and the boundary <span className="font-medium text-accent">bends into the parabola</span>. The
          model is still linear; it just got a feature it can be linear *in*. A straight
          line in (x₁, x₂, x₁²) is a curve back in the original plane.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> feature-engineering your
          way to a curve is powerful but easy to overdo — too many added features and you
          overfit, the failure from the regression cluster. Add what the problem needs, no more.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
      <p className="mt-2 leading-relaxed text-ink">
        The true split is a parabola — class 0 in the valley, class 1 above. Trained on
        the raw coordinates, logistic regression draws its best straight line: it nails the
        middle but is <span className="font-medium text-[var(--viz-error-ink)]">confidently wrong</span> on the rising arms, where
        class-0 points sit high and land in its class-1 region.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Diagnose:</span> logistic regression draws one
        <em> straight</em> line, and no straight line follows a curve — the problem isn&apos;t
        the optimiser, it&apos;s the model&apos;s shape.{" "}
        <span className="font-medium text-ink">Repair:</span> give it a feature that bends —
        add x₁².
      </p>
    </div>
  );
}
