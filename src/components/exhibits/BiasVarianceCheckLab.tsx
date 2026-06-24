"use client";

import { useMemo, useState } from "react";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { ErrorCurves } from "@/components/exhibits/ErrorCurves";
import type { Point } from "@/lib/models/linear-regression";
import { polyMSE, ridgeFit } from "@/lib/models/polynomial";
import { biasVarianceExperiment } from "@content/exhibits/bias-variance/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The Explain-it companion: a compact error-vs-complexity chart pinned beside the
 * checks, so the learner answers against the live U. Slide the degree and watch
 * training error fall while test error traces its U.
 */
const TRAIN: Point[] = fixtures.train as Point[];
const TEST: Point[] = fixtures.test as Point[];
const DEG = biasVarianceExperiment.params[0];

export function BiasVarianceCheckLab() {
  const [degree, setDegree] = useState(4);
  const w = useMemo(() => ridgeFit(TRAIN, degree, 0), [degree]);
  const trainErr = polyMSE(TRAIN, w);
  const testErr = polyMSE(TEST, w);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the U</figcaption>
      <div className="mb-3 rounded-lg border border-line bg-sunken p-3">
        <ParamSlider def={DEG} value={degree} onChange={(v) => setDegree(Math.round(v))} />
      </div>
      <ErrorCurves train={TRAIN} test={TEST} degree={degree} maxDegree={DEG.max} width={360} height={190} />
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">
        degree {degree} · train {trainErr.toFixed(3)} · test {testErr.toFixed(3)}
      </p>
    </figure>
  );
}
