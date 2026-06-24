"use client";

import { useMemo, useState } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { StatGrid } from "@/components/viz/StatGrid";
import { RegularizationCurves } from "@/components/exhibits/RegularizationCurves";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import type { Point } from "@/lib/models/linear-regression";
import { chebMSE, predictCheb, ridgeFitCheb } from "@/lib/models/polynomial";
import {
  REG_DEGREE,
  overfittingRegularizationExperiment as spec,
} from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * Regularisation bench: a degree-12 model (far too flexible) reined in by the ridge
 * penalty λ. Turn λ up and the same model's frantic wiggle relaxes toward the smooth
 * truth — its degree never changes, its weights just shrink. The error-vs-λ chart
 * shows the cost (training error up) buying the prize (test error down, then up if
 * you overdo it).
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

export function RegularizationLab() {
  const [lambda, setLambda] = useState(1e-4);
  const m = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, lambda), [lambda]);
  const trainErr = chebMSE(TRAIN, m);
  const testErr = chebMSE(TEST, m);
  const regime = lambda < 0.02 ? "overfitting (λ too small)" : lambda > 5 ? "underfitting (λ too big)" : "reined in";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{spec.scenarios[0].prompt}</p>

          <ParamSlider
            def={spec.params[0]}
            value={lambda}
            onChange={(v) => {
              whenHydrated(() => useLearner.getState().recordPractice("overfitting-regularization"));
              setLambda(v);
            }}
          />

          <StatGrid
            direction="col"
            caption={`Degree ${REG_DEGREE}, λ = ${lambda < 0.01 ? lambda.toExponential(0) : lambda.toFixed(2)} — ${regime}`}
            stats={[
              { label: "training error", value: trainErr.toFixed(3), hue: "var(--viz-neutral-ink)", note: "rises as λ bites" },
              { label: "test error", value: testErr.toFixed(3), hue: "var(--viz-error)", note: "the honest one" },
            ]}
          />

          <RegularizationCurves train={TRAIN} test={TEST} degree={REG_DEGREE} lambda={lambda} />
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={640}
            height={520}
            xDomain={[-0.02, 1.02]}
            yDomain={[-1.8, 1.8]}
            ariaLabel={`A degree-${REG_DEGREE} polynomial with ridge penalty λ = ${lambda.toExponential(1)}; training error ${trainErr.toFixed(3)}, test error ${testErr.toFixed(3)}. ${regime}.`}
          >
            <Axes />
            <TestPoints points={TEST} />
            <PolyCurve predict={(xv) => predictCheb(m, xv)} />
            <DataPoints points={TRAIN} />
          </Plot>
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">
            Same degree-12 model throughout — only the penalty changes. Slide λ up and
            watch the wiggle relax onto the smooth shape; slide it too far and the
            curve goes limp, underfitting like a straight line.
          </p>
        </div>
      </div>
    </div>
  );
}
