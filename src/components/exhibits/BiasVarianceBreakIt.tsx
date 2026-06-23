"use client";

import { useEffect, useMemo, useState } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { ErrorCurves } from "@/components/exhibits/ErrorCurves";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import type { Point } from "@/lib/models/linear-regression";
import { polyMSE, predictPoly, ridgeFit } from "@/lib/models/polynomial";
import { biasVarianceExperiment } from "@content/exhibits/bias-variance/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The interactive "Break it" lab for bias–variance. Start at a sensible degree where
 * the fit tracks the truth; crank the degree up and watch the curve contort to thread
 * every training point while the test error — the honest one — climbs. Then dial the
 * degree back to the sweet spot and watch generalisation return. Trigger → symptom →
 * diagnose → repair, the overfit made drivable.
 */
const TRAIN: Point[] = fixtures.train as Point[];
const TEST: Point[] = fixtures.test as Point[];
const DEG = biasVarianceExperiment.params[0];

function TestPoints({ points }: { points: Point[] }) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {points.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r={3.5} fill="none" stroke="var(--viz-truth)" strokeWidth={1.25} strokeOpacity={0.55} />
      ))}
    </g>
  );
}

type Phase = "arming" | "broken" | "repaired";

export function BiasVarianceBreakIt() {
  const [degree, setDegree] = useState(3);
  const [hasBroken, setHasBroken] = useState(false);
  const w = useMemo(() => ridgeFit(TRAIN, degree, 0), [degree]);
  const trainErr = polyMSE(TRAIN, w);
  const testErr = polyMSE(TEST, w);

  const overfit = degree >= 9 && testErr > trainErr * 4;
  if (overfit && !hasBroken) setHasBroken(true);
  useEffect(() => {
    if (hasBroken) reportTaskEvent("bias-variance:overfit");
  }, [hasBroken]);
  const repaired = hasBroken && degree >= 3 && degree <= 6 && testErr < trainErr * 3;
  const phase: Phase = overfit ? "broken" : repaired ? "repaired" : "arming";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="rounded-lg border border-line bg-sunken p-4">
            <ParamSlider
              def={DEG}
              value={degree}
              onChange={(v) => {
                whenHydrated(() => useLearner.getState().recordPractice("bias-variance"));
                setDegree(Math.round(v));
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
                overfit ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]" : repaired ? "border-accent text-accent" : "border-line text-ink-faint"
              }`}
            >
              {overfit ? "Overfitting" : repaired ? "Generalising" : `Degree ${degree}`}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              train {trainErr.toFixed(3)} · test {testErr.toFixed(3)}
            </span>
          </div>

          <ErrorCurves train={TRAIN} test={TEST} degree={degree} maxDegree={DEG.max} />
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={640}
            height={460}
            xDomain={[-0.02, 1.02]}
            yDomain={[-1.8, 1.8]}
            ariaLabel={`A degree-${degree} polynomial; training error ${trainErr.toFixed(3)}, test error ${testErr.toFixed(3)}. ${overfit ? "It threads the training points but misses the held-out rings — overfitting." : "The fit tracks the underlying shape."}`}
          >
            <Axes />
            <TestPoints points={TEST} />
            <PolyCurve predict={(xv) => predictPoly(w, xv)} />
            <DataPoints points={TRAIN} />
          </Plot>
        </div>
      </div>
    </div>
  );
}

function Guidance({ phase }: { phase: Phase }) {
  if (phase === "broken") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
        <p className="mt-2 leading-relaxed text-ink">
          Training error has nearly vanished — the curve threads every gold dot — but the
          test error has <span className="font-medium text-[var(--viz-error-ink)]">climbed</span>. The fit lunges between the points,
          missing the held-out rings entirely.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> the extra capacity went
          into memorising the training noise, not learning the shape — high variance.{" "}
          <span className="font-medium text-ink">Repair:</span> dial the degree back toward
          the sweet spot the test curve marks.
        </p>
      </div>
    );
  }
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          Back near the sweet spot, the curve follows the underlying shape instead of the
          noise, and the test error is low again. The best model was never the one that fit
          the training data best.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> too <em>low</em> a degree
          is the opposite failure — a stiff line that underfits, high bias. The art is the
          middle the test curve points to.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Trigger · break it on purpose</p>
      <p className="mt-2 leading-relaxed text-ink">
        At this degree the fit tracks the shape. Now crank the degree up and watch the
        curve start to <span className="font-medium text-[var(--viz-error-ink)]">wriggle</span> — chasing every training point as the
        test error turns and climbs.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Predict first: as training error falls toward zero, which way does the test error
        go — and when does it turn?
      </p>
    </div>
  );
}
