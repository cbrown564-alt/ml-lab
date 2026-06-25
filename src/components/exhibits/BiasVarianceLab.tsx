"use client";

import { useEffect, useMemo, useState } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { ParamSlider } from "@/components/viz/ParamSlider";
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

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bootstrapFits(degree: number, n = 10): ReturnType<typeof ridgeFit>[] {
  const fits: ReturnType<typeof ridgeFit>[] = [];
  for (let s = 1; s <= n; s++) {
    const rng = mulberry32(s * 17 + degree);
    const idx = Array.from({ length: TRAIN.length }, () => Math.floor(rng() * TRAIN.length));
    const sample = idx.map((i) => TRAIN[i]);
    fits.push(ridgeFit(sample, degree, 0));
  }
  return fits;
}

/** Bootstrap resamples fan out as a variance swarm behind the main fit. */
function VarianceSwarm({ degree }: { degree: number }) {
  const [reveal, setReveal] = useState(1);
  const swarm = useMemo(() => bootstrapFits(degree), [degree]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    setReveal(0.2);
    const t = window.setTimeout(() => setReveal(1), 100);
    return () => window.clearTimeout(t);
  }, [degree]);

  return (
    <g style={{ opacity: reveal * 0.55, transition: "opacity 300ms ease" }} aria-hidden>
      {swarm.map((w, i) => (
        <PolyCurve key={`${degree}-${i}`} predict={(xv) => predictPoly(w, xv)} faint />
      ))}
    </g>
  );
}

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

          <p className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
            Degree {degree} — {regime}
          </p>

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
            <VarianceSwarm degree={degree} />
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
