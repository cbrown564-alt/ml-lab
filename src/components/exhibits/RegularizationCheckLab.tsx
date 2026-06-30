"use client";

import { useMemo, useState } from "react";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { DataPoints, Plot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import type { Point } from "@/lib/models/linear-regression";
import { chebMSE, predictCheb, ridgeFitCheb, type ChebModel } from "@/lib/models/polynomial";
import {
  REG_DEGREE,
  overfittingRegularizationExperiment as spec,
} from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The Explain-it companion. Act continuity: this carries the node's bespoke protagonist
 * from See/Run/Break — the wiggly fit threading the scatter AND the purple coefficient
 * bars — into the closing act, instead of the secondary error-vs-λ U-curve.
 *
 * Raise the penalty and the curve smooths while the coefficient bars contract toward the
 * baseline (‖w‖ falls); the train/test readout tracks the same chained movement the
 * checks ask about. Bars are scaled against the unpenalised model so the shrinkage is
 * honest, matching the hero.
 */
const TRAIN: Point[] = fixtures.train as Point[];
const TEST: Point[] = fixtures.test as Point[];
const REF_MAX_W = Math.max(
  ...ridgeFitCheb(TRAIN, REG_DEGREE, 1e-4).weights.slice(1).map(Math.abs),
  0.01,
);
const COEF_H = 64;

function CoefBars({ model }: { model: ChebModel }) {
  const coefs = model.weights.slice(1);
  const norm = Math.sqrt(coefs.reduce((s, w) => s + w * w, 0));
  return (
    <div className="mt-3 border-t border-line pt-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span
          className="font-mono text-[11px] tracking-widest uppercase"
          style={{ color: "var(--viz-param-ink)" }}
        >
          Coefficients
        </span>
        <span className="font-mono text-[11px] text-ink-muted tabular-nums">‖w‖ {norm.toFixed(1)}</span>
      </div>
      <div className="relative flex items-end gap-1" style={{ height: COEF_H }} aria-hidden>
        {coefs.map((w, i) => {
          const frac = Math.min(1, Math.abs(w) / REF_MAX_W);
          return (
            <div
              key={i}
              className="flex-1 rounded-t bg-[var(--viz-param)]"
              style={{
                height: `${Math.max(2, frac * COEF_H)}px`,
                opacity: 0.5 + 0.5 * frac,
                transition: "height var(--motion-move), opacity var(--motion-move)",
              }}
            />
          );
        })}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-line" />
      </div>
    </div>
  );
}

export function RegularizationCheckLab() {
  const [lambda, setLambda] = useState(0.3);
  const m = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, lambda), [lambda]);
  const trainErr = chebMSE(TRAIN, m);
  const testErr = chebMSE(TEST, m);
  const lambdaLabel = lambda < 0.01 ? lambda.toExponential(0) : lambda.toFixed(2);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Answer against the dial
        </span>
        <span className="hidden font-mono text-[11px] tracking-wide text-ink-faint uppercase sm:inline">
          curve smooths · weights shrink
        </span>
      </figcaption>
      <Plot
        width={460}
        height={240}
        xDomain={[0, 1]}
        yDomain={[-1.55, 1.55]}
        ariaLabel={`A degree-${REG_DEGREE} ridge fit at λ ${lambdaLabel}: train ${trainErr.toFixed(
          2,
        )}, test ${testErr.toFixed(2)}. Raising λ smooths the curve and shrinks the coefficient bars below.`}
      >
        <PolyCurve predict={(xv) => predictCheb(m, xv)} />
        <DataPoints points={TRAIN} />
      </Plot>
      <CoefBars model={m} />
      <div className="mt-3 rounded-lg border border-line bg-sunken p-3">
        <ParamSlider def={spec.params[0]} value={lambda} onChange={setLambda} />
      </div>
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">
        λ {lambdaLabel} · train {trainErr.toFixed(3)} · test {testErr.toFixed(3)}
      </p>
    </figure>
  );
}
