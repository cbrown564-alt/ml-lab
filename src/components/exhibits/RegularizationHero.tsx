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
import { REG_DEGREE } from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";
import type { Point } from "@/lib/models/linear-regression";

/**
 * The specimen hero — regularisation as one dial on one model. CausalTrace shrinkage:
 * λ increases → coefficients contract → curve smooths → test error responds in chain.
 * Two panels compare no-penalty vs penalised; a hero scrubber animates the causal link.
 */

const TRAIN = fixtures.train as Point[];
const TEST = fixtures.test as Point[];
const LAMBDA_LOW = 1e-4;
const LAMBDA_HIGH = 0.3;

function PanelBody({
  model,
  clipId,
  reveal,
}: {
  model: ChebModel;
  clipId: string;
  reveal: number;
}) {
  const { x, y } = usePlot();
  const [rxA, rxB] = x.range;
  const [ryBottom, ryTop] = y.range;
  const fx = Math.min(rxA, rxB);
  const fy = Math.min(ryTop, ryBottom);
  const fw = Math.abs(rxB - rxA);
  const fh = Math.abs(ryBottom - ryTop);
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={fx} y={fy} width={fw} height={fh} />
        </clipPath>
      </defs>
      <rect x={fx} y={fy} width={fw} height={fh} fill="var(--surface-bg)" stroke="var(--line)" />
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
      <g clipPath={`url(#${clipId})`} style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
        <PolyCurve predict={(xv) => predictCheb(model, xv)} />
      </g>
      <DataPoints points={TRAIN} />
    </>
  );
}

/** CausalTrace — coefficient bars that shrink as λ rises. */
function CoefTrace({ model, lambdaT }: { model: ChebModel; lambdaT: number }) {
  const maxW = Math.max(...model.weights.map(Math.abs), 0.01);
  return (
    <div className="flex items-end gap-0.5 px-1" aria-hidden>
      {model.weights.slice(1).map((w, i) => (
        <div
          key={i}
          className="w-3 rounded-t bg-[var(--viz-prediction)] transition-all duration-300"
          style={{
            height: `${Math.max(4, (Math.abs(w) / maxW) * 36 * (1 - lambdaT * 0.15))}px`,
            opacity: 0.45 + (1 - lambdaT) * 0.55,
          }}
        />
      ))}
    </div>
  );
}

function Panel({
  panel,
  clipId,
  reveal,
  lambdaT,
}: {
  panel: { lambda: number; kicker: string; model: ChebModel; trainErr: number; testErr: number };
  clipId: string;
  reveal: number;
  lambdaT: number;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="px-1 pb-1.5">
        <div className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          {panel.kicker}
        </div>
        <div className="mt-1 flex items-baseline gap-4 font-mono text-[11px] tabular-nums">
          <span style={{ color: "var(--viz-truth-ink)" }}>
            train {panel.trainErr.toFixed(2)}
          </span>
          <span style={{ color: "var(--viz-error-ink)" }}>
            test {panel.testErr.toFixed(2)}
          </span>
        </div>
        <CoefTrace model={panel.model} lambdaT={lambdaT} />
      </div>
      <Plot
        width={400}
        height={270}
        xDomain={[-0.02, 1.02]}
        yDomain={[-1.55, 1.55]}
        ariaLabel={`A degree-${REG_DEGREE} fit, ${panel.kicker}: train ${panel.trainErr.toFixed(2)}, test ${panel.testErr.toFixed(2)}.`}
      >
        <PanelBody model={panel.model} clipId={clipId} reveal={reveal} />
      </Plot>
    </div>
  );
}

export function RegularizationHero() {
  const [reveal, setReveal] = useState(0);
  const [lambdaT, setLambdaT] = useState(0);

  const scrubLambda = LAMBDA_LOW * Math.pow(LAMBDA_HIGH / LAMBDA_LOW, lambdaT);
  const scrubModel = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, scrubLambda), [scrubLambda]);
  const scrubTrain = useMemo(() => chebMSE(TRAIN, scrubModel), [scrubModel]);
  const scrubTest = useMemo(() => chebMSE(TEST, scrubModel), [scrubModel]);

  const panels = useMemo(
    () =>
      [
        { lambda: LAMBDA_LOW, kicker: "no penalty (λ≈0) — overfits" },
        { lambda: LAMBDA_HIGH, kicker: "penalised (λ=0.3) — smooth" },
      ].map((p) => {
        const model = ridgeFitCheb(TRAIN, REG_DEGREE, p.lambda);
        return {
          ...p,
          model,
          trainErr: chebMSE(TRAIN, model),
          testErr: chebMSE(TEST, model),
        };
      }),
    [],
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => {
        setReveal(1);
        setLambdaT(1);
      });
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
          λ {scrubLambda.toFixed(3)} · test {scrubTest.toFixed(2)}
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        {panels.map((panel, i) => (
          <Panel
            key={panel.lambda}
            panel={panel}
            clipId={`reg-clip-${i}`}
            reveal={reveal}
            lambdaT={lambdaT}
          />
        ))}
      </div>
      {reveal > 0 && (
        <div className="border-t border-line px-4 py-3">
          <label className="flex items-center gap-3">
            <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">λ low</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(lambdaT * 100)}
              onChange={(e) => setLambdaT(Number(e.target.value) / 100)}
              className="min-w-0 flex-1 accent-[var(--accent)]"
              aria-label="Causal trace: increase penalty lambda to shrink coefficients and smooth the curve"
            />
            <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">λ high</span>
          </label>
          <p className="mt-2 text-center font-mono text-[10px] text-ink-faint">
            causal chain: λ ↑ → weights shrink → curve smooths → train {scrubTrain.toFixed(2)} · test {scrubTest.toFixed(2)}
          </p>
        </div>
      )}
      <div className="flex items-center justify-center gap-6 border-t border-line px-3 py-2 font-mono text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden style={{ color: "var(--viz-truth)" }}>●</span>
          train — the points it fits
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden style={{ color: "var(--viz-truth)" }}>○</span>
          test — held-out, where error is judged
        </span>
      </div>
    </figure>
  );
}
