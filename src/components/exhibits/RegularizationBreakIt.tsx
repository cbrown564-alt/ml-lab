"use client";

import { useEffect, useMemo, useState } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { RegularizationCurves } from "@/components/exhibits/RegularizationCurves";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import type { Point } from "@/lib/models/linear-regression";
import { chebMSE, predictCheb, ridgeFitCheb } from "@/lib/models/polynomial";
import {
  REG_DEGREE,
  overfittingRegularizationExperiment as spec,
} from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The interactive "Break it" lab for regularisation. You've reined a wild degree-12
 * model in with a moderate penalty — so the instinct is that more penalty must be
 * even safer. It isn't: crank λ up and the weights are crushed toward zero, the curve
 * goes limp, and the model underfits as badly as a straight line. Then dial λ back to
 * the window. The regularisation-specific trap, made drivable.
 */
const TRAIN: Point[] = fixtures.train as Point[];
const TEST: Point[] = fixtures.test as Point[];

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

// Reference scale: the largest coefficient magnitude at near-zero penalty (the
// overfit). Every bar is drawn against this, so raising λ visibly crushes them.
const REF_W = Math.max(...ridgeFitCheb(TRAIN, REG_DEGREE, 1e-4).weights.slice(1).map(Math.abs));

/** The penalty's signature, made visible: the magnitudes of the fitted coefficients.
 * As λ rises the bars are crushed toward zero — the shrinkage that distinguishes
 * regularisation from simply cutting the degree. */
function CoefficientBars({ weights }: { weights: number[] }) {
  const coefs = weights.slice(1).map(Math.abs); // drop the unpenalised intercept
  const W = 300;
  const H = 130;
  const m = { l: 10, r: 10, t: 22, b: 16 };
  const bw = (W - m.l - m.r) / coefs.length;
  const bh = (v: number) => Math.min(1, v / (REF_W || 1)) * (H - m.t - m.b);
  return (
    <figure className="rounded-xl border border-line bg-raised p-3">
      <figcaption className="mb-1 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Coefficient magnitudes |wⱼ|</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The magnitudes of the fitted coefficients; raising the penalty shrinks them toward zero." className="h-auto w-full">
        <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="var(--line)" />
        {coefs.map((v, i) => (
          <rect key={i} x={m.l + i * bw + bw * 0.18} y={H - m.b - bh(v)} width={bw * 0.64} height={bh(v)} fill="var(--viz-param)" fillOpacity={0.85} />
        ))}
      </svg>
    </figure>
  );
}

type Phase = "arming" | "broken" | "repaired";

export function RegularizationBreakIt() {
  const [lambda, setLambda] = useState(0.3);
  const [hasBroken, setHasBroken] = useState(false);
  const m = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, lambda), [lambda]);
  const trainErr = chebMSE(TRAIN, m);
  const testErr = chebMSE(TEST, m);

  const overPenalised = lambda > 5;
  if (overPenalised && !hasBroken) setHasBroken(true);
  useEffect(() => {
    if (hasBroken) reportTaskEvent("overfitting-regularization:over-penalised");
  }, [hasBroken]);
  const repaired = hasBroken && lambda >= 0.03 && lambda <= 3;
  const phase: Phase = overPenalised ? "broken" : repaired ? "repaired" : "arming";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="rounded-lg border border-line bg-sunken p-4">
            <ParamSlider
              def={spec.params[0]}
              value={lambda}
              onChange={(v) => {
                whenHydrated(() => useLearner.getState().recordPractice("overfitting-regularization"));
                setLambda(v);
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
                overPenalised ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]" : repaired ? "border-accent text-accent" : "border-line text-ink-faint"
              }`}
            >
              {overPenalised ? "Over-penalised" : repaired ? "Reined in" : `λ = ${lambda < 0.01 ? lambda.toExponential(0) : lambda.toFixed(2)}`}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              train {trainErr.toFixed(3)} · test {testErr.toFixed(3)}
            </span>
          </div>

          {/* The shrinkage made visible — the beat that's unique to regularisation
              (not the degree lever next door). */}
          <CoefficientBars weights={m.weights} />
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={640}
            height={420}
            xDomain={[0, 1]}
            yDomain={[-1.8, 1.8]}
            ariaLabel={`A degree-${REG_DEGREE} polynomial with penalty λ = ${lambda.toExponential(1)}; training error ${trainErr.toFixed(3)}, test error ${testErr.toFixed(3)}. ${overPenalised ? "The penalty has crushed the weights — the curve is limp and underfits." : "The penalised fit tracks the shape."}`}
          >
            <Axes />
            <TestPoints points={TEST} />
            <PolyCurve predict={(xv) => predictCheb(m, xv)} />
            <DataPoints points={TRAIN} />
          </Plot>
          {/* The error-vs-λ U promoted to a co-hero beside the fit (panel register fix). */}
          <div className="mt-4">
            <RegularizationCurves train={TRAIN} test={TEST} degree={REG_DEGREE} lambda={lambda} width={640} height={210} />
          </div>
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
          More penalty didn&apos;t help — the curve went <span className="font-medium text-[var(--viz-error-ink)]">limp</span>. The weights
          have been crushed toward zero, so the fit can barely bend, and the test error
          has climbed right back up.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> too much penalty doesn&apos;t
          just remove the wiggle, it removes the signal — you&apos;ve traded variance for
          pure bias. <span className="font-medium text-ink">Repair:</span> dial λ back down
          into the window the error curve marks.
        </p>
      </div>
    );
  }
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          Back in the window, the penalty is just enough to smooth the wiggle without
          strangling the signal — test error at its lowest. There&apos;s a best λ, and
          it&apos;s neither extreme.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> too <em>little</em> λ is the
          opposite failure — the overfit wiggle returns. Regularisation is a dial to tune,
          not a lever to pull all the way.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Trigger · break it on purpose</p>
      <p className="mt-2 leading-relaxed text-ink">
        At λ = 0.3 the penalty has reined the overfit in nicely. The instinct is that
        more penalty must be safer still — so crank λ all the way up and watch the curve{" "}
        <span className="font-medium text-[var(--viz-error-ink)]">flatten</span>.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Predict first: does a bigger penalty keep improving the fit, or is there a point
        where it starts to hurt?
      </p>
    </div>
  );
}
