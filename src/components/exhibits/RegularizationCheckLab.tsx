"use client";

import { useMemo, useState } from "react";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { RegularizationCurves } from "@/components/exhibits/RegularizationCurves";
import type { Point } from "@/lib/models/linear-regression";
import { chebMSE, ridgeFitCheb } from "@/lib/models/polynomial";
import {
  REG_DEGREE,
  overfittingRegularizationExperiment as spec,
} from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The Explain-it companion: a compact error-vs-λ chart pinned beside the checks, so
 * the learner answers against the live U in λ. Slide the penalty and watch test error
 * fall, bottom out, then climb as it over-penalises.
 */
const TRAIN: Point[] = fixtures.train as Point[];
const TEST: Point[] = fixtures.test as Point[];

export function RegularizationCheckLab() {
  const [lambda, setLambda] = useState(0.3);
  const m = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, lambda), [lambda]);
  const trainErr = chebMSE(TRAIN, m);
  const testErr = chebMSE(TEST, m);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the dial</figcaption>
      <div className="mb-3 rounded-lg border border-line bg-sunken p-3">
        <ParamSlider def={spec.params[0]} value={lambda} onChange={setLambda} />
      </div>
      <RegularizationCurves train={TRAIN} test={TEST} degree={REG_DEGREE} lambda={lambda} width={360} height={190} />
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">
        λ {lambda < 0.01 ? lambda.toExponential(0) : lambda.toFixed(2)} · train {trainErr.toFixed(3)} · test {testErr.toFixed(3)}
      </p>
    </figure>
  );
}
