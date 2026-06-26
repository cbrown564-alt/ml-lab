"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPoints, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { usePrefersReducedMotion } from "@/components/viz/primitives/shared";
import { olsFit, type LinearParams, type Point } from "@/lib/models/linear-regression";
import {
  fitUnder,
  penaltyOf,
  type LossKind,
} from "@/lib/models/loss-functions";
import { lossFunctionsExperiment } from "@content/exhibits/loss-functions/experiment";

/**
 * The specimen hero — why the choice of loss matters. Toggling the judge morphs
 * the same miss under L2 / L1 / Huber (CounterfactualReplay semantics in one
 * canvas); ContributionStack shows how each penalty deforms and accumulates.
 */

const POINTS: Point[] = lossFunctionsExperiment.datasets[0].points;
const OUTLIER = POINTS.reduce(
  (a, b) => {
    const fit = olsFit(POINTS);
    const ra = Math.abs(a.y - (fit.slope * a.x + fit.intercept));
    const rb = Math.abs(b.y - (fit.slope * b.x + fit.intercept));
    return rb > ra ? b : a;
  },
  POINTS[0],
);

const XS = POINTS.map((p) => p.x);
const YS = POINTS.map((p) => p.y);
const X_DOMAIN: [number, number] = [Math.min(...XS) - 0.6, Math.max(...XS) + 0.6];
const Y_DOMAIN: [number, number] = [Math.min(...YS) - 8, Math.max(...YS) + 4];

const LOSS_LABELS: Record<LossKind, string> = {
  squared: "L2 · squared",
  absolute: "L1 · absolute",
  huber: "Huber",
};

const MORPH_MS = 520;

function lerpParams(a: LinearParams, b: LinearParams, t: number): LinearParams {
  return {
    slope: a.slope + (b.slope - a.slope) * t,
    intercept: a.intercept + (b.intercept - a.intercept) * t,
  };
}

function lerpPenalty(from: LossKind, to: LossKind, r: number, t: number): number {
  return penaltyOf(from, r) + (penaltyOf(to, r) - penaltyOf(from, r)) * t;
}

/** Residual segment for the outlier — the fixed miss every judge prices. */
function OutlierMiss({ fit }: { fit: LinearParams }) {
  const { x, y } = usePlot();
  const yHat = fit.slope * OUTLIER.x + fit.intercept;
  return (
    <g aria-hidden>
      <line
        x1={x(OUTLIER.x)}
        y1={y(OUTLIER.y)}
        x2={x(OUTLIER.x)}
        y2={y(yHat)}
        stroke="var(--viz-error)"
        strokeWidth={2}
        strokeDasharray="4 3"
        opacity={0.85}
      />
      <circle cx={x(OUTLIER.x)} cy={y(OUTLIER.y)} r={7} fill="none" stroke="var(--viz-error)" strokeWidth={2} />
    </g>
  );
}


/** ContributionStack — per-point penalties stacking into mean loss. */
function LossStack({
  from,
  to,
  morphT,
  fit,
  stackT,
}: {
  from: LossKind;
  to: LossKind;
  morphT: number;
  fit: LinearParams;
  stackT: number;
}) {
  const { width, height } = usePlot();
  const penalties = POINTS.map((p) => {
    const r = p.y - (fit.slope * p.x + fit.intercept);
    return lerpPenalty(from, to, r, morphT);
  });
  const maxP = Math.max(...penalties, 1e-6);
  const shown = Math.max(1, Math.round(stackT * POINTS.length));
  const mean = penalties.slice(0, shown).reduce((s, v) => s + v, 0) / POINTS.length;
  const stackX = width - 62;
  const barH = (height - 52) / POINTS.length;

  return (
    <g aria-hidden>
      {penalties.map((pen, i) => {
        const w = (pen / maxP) * 46;
        const visible = i < shown;
        const isOutlier = POINTS[i] === OUTLIER;
        return (
          <g key={i}>
            <rect
              x={stackX}
              y={20 + i * barH}
              width={visible ? w : 0}
              height={barH * 0.72}
              fill="var(--viz-error)"
              opacity={isOutlier ? 0.85 : 0.45}
              rx={1}
              stroke={isOutlier ? "var(--viz-error-ink)" : "none"}
              strokeWidth={isOutlier ? 0.75 : 0}
            />
          </g>
        );
      })}
      <text
        x={stackX + 24}
        y={height - 18}
        textAnchor="middle"
        fontSize={9}
        fontFamily="var(--font-mono)"
        fill="var(--ink-faint)"
      >
        mean loss
      </text>
      <text
        x={stackX + 24}
        y={height - 4}
        textAnchor="middle"
        fontSize={12}
        fontFamily="var(--font-mono)"
        fontWeight={600}
        fill="var(--viz-error-ink)"
      >
        {mean.toFixed(2)}
      </text>
    </g>
  );
}

function OutlierLabel({ kind, morphing }: { kind: LossKind; morphing: boolean }) {
  const { x, y } = usePlot();
  return (
    <text
      x={x(OUTLIER.x)}
      y={y(OUTLIER.y) - 14}
      textAnchor="middle"
      fontSize={12}
      fontFamily="var(--font-mono)"
      paintOrder="stroke"
      stroke="var(--surface-bg)"
      strokeWidth={3}
      fill="var(--viz-error-ink)"
    >
      {morphing ? "same miss · judge morphing…" : `same miss · ${LOSS_LABELS[kind]}`}
    </text>
  );
}

export function LossFunctionsHero() {
  const reduceMotion = usePrefersReducedMotion();
  const [kind, setKind] = useState<LossKind>("squared");
  const [morphFrom, setMorphFrom] = useState<LossKind>("squared");
  const [morphT, setMorphT] = useState(1);
  const [stackT, setStackT] = useState(0);
  const fitFrom = useMemo(() => fitUnder(morphFrom, POINTS), [morphFrom]);
  const fitTo = useMemo(() => fitUnder(kind, POINTS), [kind]);
  const fit = useMemo(() => lerpParams(fitFrom, fitTo, morphT), [fitFrom, fitTo, morphT]);

  const pickKind = (k: LossKind) => {
    if (k === kind && morphT >= 1) return;
    setMorphFrom(kind);
    setKind(k);
    setMorphT(0);
    setStackT(0);
  };

  useEffect(() => {
    if (reduceMotion) {
      setMorphT(1);
      setStackT(1);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / MORPH_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setMorphT(eased);
      setStackT(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [kind, morphFrom, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      setStackT(1);
      return;
    }
    let raf = 0;
    let start = 0;
    const DURATION = 900;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / DURATION);
      setStackT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 280);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  const morphing = morphT < 0.98;

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The price of a miss
        </span>
        <div className="flex gap-1" role="group" aria-label="Choose loss judge">
          {(["squared", "absolute", "huber"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => pickKind(k)}
              className={`rounded px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase transition-colors ${kind === k ? "bg-accent/15 text-accent" : "text-ink-faint hover:text-ink-muted"}`}
            >
              {LOSS_LABELS[k]}
            </button>
          ))}
        </div>
      </figcaption>
      <div className="px-3 py-2">
        <Plot
          width={1200}
          height={420}
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          ariaLabel={`A cloud of points with one outlier and the ${LOSS_LABELS[kind]} fit. Toggle the judge to see how the same miss is penalised differently; penalties stack into mean loss on the right.`}
        >
          <g opacity={0.3 + 0.7 * stackT}>
            <LossStack from={morphFrom} to={kind} morphT={morphT} fit={fit} stackT={stackT} />
          </g>
          <FitLine params={fit} />
          <DataPoints points={POINTS} />
          <OutlierMiss fit={fit} />
          <OutlierLabel kind={kind} morphing={morphing} />
        </Plot>
      </div>
    </figure>
  );
}
