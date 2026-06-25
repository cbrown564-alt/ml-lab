"use client";

import { useMemo, useState } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { StatGrid } from "@/components/viz/StatGrid";
import { ErrorCurves } from "@/components/exhibits/ErrorCurves";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import type { Point } from "@/lib/models/linear-regression";
import { polyMSE, predictPoly, ridgeFit } from "@/lib/models/polynomial";
import { biasVarianceExperiment } from "@content/exhibits/bias-variance/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * Bias–variance bench: one knob, the polynomial degree, sweeps from underfit to
 * overfit. The fit plot shows the curve fighting (or memorising) the training
 * points; the error-vs-complexity chart shows training error falling while test
 * error — validation error — often bottoms out in the middle and climbs again.
 */
const TRAIN: Point[] = fixtures.train as Point[];
const TEST: Point[] = fixtures.test as Point[];
const DEG = biasVarianceExperiment.params[0];

/** The held-out points, faint, so "the model never saw these" is visible. */
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

export function BiasVarianceLab() {
  const [degree, setDegree] = useState(1);
  const w = useMemo(() => ridgeFit(TRAIN, degree, 0), [degree]);
  const trainErr = polyMSE(TRAIN, w);
  const testErr = polyMSE(TEST, w);

  const regime = degree <= 2 ? "underfitting" : testErr > trainErr * 3 ? "overfitting" : "balanced";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">
            {biasVarianceExperiment.scenarios[0].prompt}
          </p>

          <ParamSlider
            def={DEG}
            value={degree}
            onChange={(v) => {
              whenHydrated(() => useLearner.getState().recordPractice("bias-variance"));
              setDegree(Math.round(v));
            }}
          />

          <StatGrid
            direction="col"
            caption={`Degree ${degree} — ${regime}`}
            stats={[
              { label: "training error", value: trainErr.toFixed(3), hue: "var(--viz-neutral-ink)", note: "on data it has seen" },
              { label: "test error", value: testErr.toFixed(3), hue: "var(--viz-error)", note: "on data it hasn't — the honest one" },
            ]}
          />

          <ErrorCurves train={TRAIN} test={TEST} degree={degree} maxDegree={DEG.max} />
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={640}
            height={520}
            xDomain={[-0.02, 1.02]}
            yDomain={[-1.8, 1.8]}
            ariaLabel={`A degree-${degree} polynomial fitted to ${TRAIN.length} training points. Training error ${trainErr.toFixed(3)}, test error ${testErr.toFixed(3)} on held-out points. ${regime}.`}
          >
            <Axes />
            <TestPoints points={TEST} />
            <PolyCurve predict={(xv) => predictPoly(w, xv)} />
            <DataPoints points={TRAIN} />
          </Plot>
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">
            Gold dots are the training data; hollow rings are held-out test points the
            model never sees. Watch the blue curve go from too stiff, to just right,
            to a frantic wiggle that nails every training dot and misses the rings.
          </p>
        </div>
      </div>
    </div>
  );
}
