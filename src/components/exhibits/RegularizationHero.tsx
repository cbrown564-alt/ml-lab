"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import {
  chebMSE,
  predictCheb,
  ridgeFitCheb,
  type ChebModel,
} from "@/lib/models/polynomial";
import { CausalTrace } from "@/components/viz/primitives";
import { REG_DEGREE } from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";
import type { Point } from "@/lib/models/linear-regression";

/**
 * The specimen hero — regularisation as one dial on one model. CausalTrace shrinkage:
 * λ increases → coefficients contract → curve smooths → test error responds in chain.
 * One live plot (not a static triptych) follows the scrubber; endpoint ghosts anchor
 * the overfit vs smooth extremes.
 */

const TRAIN = fixtures.train as Point[];
const TEST = fixtures.test as Point[];
const LAMBDA_LOW = 1e-4;
const LAMBDA_HIGH = 0.3;

function TestPoints() {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {TEST.map((p, i) => (
        <circle
          key={i}
          cx={x(p.x)}
          cy={y(p.y)}
          r={3.5}
          fill="none"
          stroke="var(--viz-truth)"
          strokeWidth={1.25}
          strokeOpacity={0.5}
        />
      ))}
    </g>
  );
}

/** Coefficient bars that shrink as λ rises — tension made visible. */
function CoefTrace({ model, lambdaT }: { model: ChebModel; lambdaT: number }) {
  const maxW = Math.max(...model.weights.map(Math.abs), 0.01);
  const tension = 0.65 + lambdaT * 0.35;
  return (
    <div className="flex items-end gap-0.5 px-1" aria-hidden>
      {model.weights.slice(1).map((w, i) => (
        <div
          key={i}
          className="w-3 rounded-t bg-[var(--viz-prediction)]"
          style={{
            height: `${Math.max(3, (Math.abs(w) / maxW) * 40)}px`,
            opacity: 0.35 + (1 - lambdaT) * 0.55,
            transform: `scaleY(${1 - lambdaT * 0.55})`,
            transformOrigin: "bottom",
            transition: "height var(--motion-move), opacity var(--motion-move), transform var(--motion-move)",
          }}
        />
      ))}
      <span
        className="ml-2 self-center font-mono text-[9px] tracking-wide text-ink-faint uppercase"
        style={{ opacity: tension }}
      >
        {lambdaT < 0.35 ? "weights free" : lambdaT < 0.7 ? "tension rising" : "weights pulled in"}
      </span>
    </div>
  );
}

export function RegularizationHero() {
  const [reveal, setReveal] = useState(0);
  const [lambdaT, setLambdaT] = useState(0);

  const scrubLambda = LAMBDA_LOW * Math.pow(LAMBDA_HIGH / LAMBDA_LOW, lambdaT);
  const lowModel = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, LAMBDA_LOW), []);
  const highModel = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, LAMBDA_HIGH), []);
  const scrubModel = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, scrubLambda), [scrubLambda]);
  const scrubTrain = useMemo(() => chebMSE(TRAIN, scrubModel), [scrubModel]);
  const scrubTest = useMemo(() => chebMSE(TEST, scrubModel), [scrubModel]);

  const kicker =
    lambdaT < 0.25
      ? "no penalty — overfits"
      : lambdaT < 0.75
        ? "penalty biting — smoothing"
        : "heavy penalty — limp";

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 360);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Overfitting &amp; regularisation
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          λ {scrubLambda < 0.01 ? scrubLambda.toExponential(1) : scrubLambda.toFixed(2)} · test{" "}
          {scrubTest.toFixed(2)}
        </span>
      </figcaption>
      <div className="px-3 py-3">
        <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
          <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
            {kicker}
          </span>
          <span className="font-mono text-[11px] tabular-nums">
            <span style={{ color: "var(--viz-truth-ink)" }}>train {scrubTrain.toFixed(2)}</span>
            <span className="mx-2 text-ink-faint">·</span>
            <span style={{ color: "var(--viz-error-ink)" }}>test {scrubTest.toFixed(2)}</span>
          </span>
        </div>
        <Plot
          width={1200}
          height={320}
          xDomain={[-0.02, 1.02]}
          yDomain={[-1.55, 1.55]}
          ariaLabel={`A degree-${REG_DEGREE} ridge fit with λ ${scrubLambda.toExponential(1)}: train ${scrubTrain.toFixed(2)}, test ${scrubTest.toFixed(2)}. ${kicker}.`}
        >
          <TestPoints />
          <g style={{ opacity: reveal * 0.28 }} aria-hidden>
            <PolyCurve predict={(xv) => predictCheb(lowModel, xv)} faint />
            <PolyCurve predict={(xv) => predictCheb(highModel, xv)} faint />
          </g>
          <g style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
            <PolyCurve predict={(xv) => predictCheb(scrubModel, xv)} />
          </g>
          <DataPoints points={TRAIN} />
        </Plot>
        <CoefTrace model={scrubModel} lambdaT={lambdaT} />
        <label className="mt-3 flex items-center gap-3 px-1">
          <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">λ low</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(lambdaT * 100)}
            onChange={(e) => setLambdaT(Number(e.target.value) / 100)}
            className="min-w-0 flex-1 accent-[var(--accent)] transition-[accent-color] duration-200"
            aria-label="Causal trace: increase penalty lambda to shrink coefficients and smooth the curve"
          />
          <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">λ high</span>
        </label>
        {reveal > 0 && (
          <div className="mt-3">
            <CausalTrace
              steps={[
                { id: "lambda", label: "λ ↑", hue: "param" },
                { id: "weights", label: "weights shrink", hue: "param" },
                { id: "curve", label: "curve smooths", hue: "prediction" },
                { id: "error", label: `test ${scrubTest.toFixed(2)}`, hue: "error" },
              ]}
              activeStepId={
                lambdaT < 0.25
                  ? "lambda"
                  : lambdaT < 0.55
                    ? "weights"
                    : lambdaT < 0.85
                      ? "curve"
                      : "error"
              }
              ariaLabel="Regularization causal chain from penalty to test error"
            />
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-6 border-t border-line px-3 py-2 font-mono text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden style={{ color: "var(--viz-truth)" }}>●</span>
          train — the points it fits
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden style={{ color: "var(--viz-truth)" }}>○</span>
          test — held-out, where error is judged
        </span>
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <span aria-hidden style={{ color: "var(--viz-prediction)", opacity: 0.4 }}>—</span>
          faint ghosts — λ endpoints
        </span>
      </div>
    </figure>
  );
}
