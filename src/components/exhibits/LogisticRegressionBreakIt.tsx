"use client";

import { useEffect, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { accuracy, accuracyVec, fitLogistic, fitLogisticVec, probaVec } from "@/lib/models/logistic";
import { expandedRow, xorPoints } from "@content/exhibits/logistic-regression/xor";

/**
 * The interactive "Break it" lab for logistic regression. XOR — two classes in
 * opposite corners — is the textbook problem a straight line cannot solve. Train the
 * raw classifier and it lands at chance, slicing the plane uselessly. Then add one
 * engineered feature, x₁·x₂, whose sign is exactly the XOR, and the same linear model
 * draws a curved boundary that separates them. Trigger → symptom → diagnose → repair:
 * logistic regression is a *linear* classifier, and features are how you bend it.
 */
const LABELS = xorPoints.map((p) => p.y);
const RAW_PARAMS = fitLogistic(xorPoints, { steps: 4000, lr: 0.3 });
const RAW_ACC = accuracy(xorPoints, RAW_PARAMS);
const EXP_W = fitLogisticVec(xorPoints.map(expandedRow), LABELS, { steps: 4000, lr: 0.3 });
const EXP_ACC = accuracyVec(xorPoints.map(expandedRow), LABELS, EXP_W);
const expandedProba = (x1: number, x2: number) => probaVec(EXP_W, [1, x1, x2, x1 * x2]);

type Phase = "broken" | "repaired";

export function LogisticRegressionBreakIt() {
  const [expanded, setExpanded] = useState(false);
  const [hasSeenFailure, setHasSeenFailure] = useState(false);

  // The raw straight-line failure is the default state — record it the moment it's seen.
  if (!expanded && !hasSeenFailure) setHasSeenFailure(true);
  useEffect(() => {
    if (hasSeenFailure) reportTaskEvent("logistic-regression:linear-fails-xor");
  }, [hasSeenFailure]);

  const phase: Phase = expanded ? "repaired" : "broken";
  const acc = expanded ? EXP_ACC : RAW_ACC;

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-sunken p-4">
            <div role="group" aria-label="Which features the classifier sees" className="inline-flex self-center rounded-full border border-line p-0.5 text-sm">
              {([["Raw: x₁, x₂", false], ["Add x₁·x₂", true]] as const).map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={expanded === value}
                  onClick={() => {
                    whenHydrated(() => useLearner.getState().recordPractice("logistic-regression"));
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
              {expanded ? "The curve separates" : "A straight line, lost"}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">accuracy {Math.round(acc * 100)}%</span>
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <DecisionField
            points={xorPoints}
            params={expanded ? undefined : RAW_PARAMS}
            predictProba={expanded ? expandedProba : undefined}
            domain={[-3, 3]}
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
          One extra feature — x₁·x₂ — and the boundary <span className="font-medium text-accent">curves</span>. Its sign is positive in
          the class-1 corners and negative in the class-0 corners, so it <em>is</em> the
          XOR. The model is still linear; it just got a feature that lets the line bend.
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
        This is XOR — class 1 in two opposite corners, class 0 in the others. Trained on
        the raw coordinates, logistic regression lands at <span className="font-medium text-[var(--viz-error-ink)]">chance</span>: any
        straight line it picks puts two corners on the wrong side.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Diagnose:</span> logistic regression draws a
        single <em>straight</em> line, and no straight line separates XOR — the problem
        isn&apos;t the optimiser, it&apos;s the model&apos;s shape.{" "}
        <span className="font-medium text-ink">Repair:</span> give it a feature that bends —
        add x₁·x₂.
      </p>
    </div>
  );
}
