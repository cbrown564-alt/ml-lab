"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPoints, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { olsFit, type LinearParams, type Point } from "@/lib/models/linear-regression";
import {
  fitUnder,
  penaltyOf,
  type LossKind,
} from "@/lib/models/loss-functions";
import { lossFunctionsExperiment } from "@content/exhibits/loss-functions/experiment";

/**
 * The specimen hero — why the choice of loss matters. CounterfactualReplay toggles
 * the same miss under L2 / L1 / Huber judges; ContributionStack shows how each
 * penalty deforms and accumulates into total loss. Reduced motion renders drawn.
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

/** Penalty deformation for the outlier residual under each judge. */
function PenaltyDeform({ kind, fit }: { kind: LossKind; fit: LinearParams }) {
  const { x, y } = usePlot();
  const r = OUTLIER.y - (fit.slope * OUTLIER.x + fit.intercept);
  const penalty = penaltyOf(kind, r);
  const maxP = Math.max(penaltyOf("squared", r), penaltyOf("absolute", r), penaltyOf("huber", r));
  const barW = (penalty / maxP) * 80;
  const px = x(OUTLIER.x) + 14;
  const py = y(OUTLIER.y) - 20;

  return (
    <g aria-hidden>
      <rect x={px} y={py} width={barW} height={10} rx={2} fill="var(--viz-error)" opacity={0.75} />
      <text x={px + barW + 4} y={py + 9} fontSize={10} fontFamily="var(--font-mono)" fill="var(--viz-error-ink)">
        {penalty.toFixed(1)}
      </text>
    </g>
  );
}

/** ContributionStack — per-point penalties stacking into mean loss. */
function LossStack({ kind, fit, t }: { kind: LossKind; fit: LinearParams; t: number }) {
  const { width, height } = usePlot();
  const penalties = POINTS.map((p) => {
    const r = p.y - (fit.slope * p.x + fit.intercept);
    return penaltyOf(kind, r);
  });
  const maxP = Math.max(...penalties);
  const shown = Math.max(1, Math.round(t * POINTS.length));
  const mean = penalties.slice(0, shown).reduce((s, v) => s + v, 0) / POINTS.length;
  const stackX = width - 58;
  const barH = (height - 40) / POINTS.length;

  return (
    <g aria-hidden>
      {penalties.map((pen, i) => {
        const w = (pen / maxP) * 42;
        const visible = i < shown;
        return (
          <rect
            key={i}
            x={stackX}
            y={18 + i * barH}
            width={visible ? w : 0}
            height={barH * 0.7}
            fill="var(--viz-error)"
            opacity={0.5}
            rx={1}
          />
        );
      })}
      <text x={stackX + 21} y={height - 6} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fontWeight={600} fill="var(--viz-error-ink)">
        {mean.toFixed(2)}
      </text>
    </g>
  );
}

function OutlierLabel({ kind }: { kind: LossKind }) {
  const { x, y } = usePlot();
  return (
    <text
      x={x(OUTLIER.x)}
      y={y(OUTLIER.y) - 12}
      textAnchor="middle"
      fontSize={12}
      fontFamily="var(--font-mono)"
      paintOrder="stroke"
      stroke="var(--surface-bg)"
      strokeWidth={3}
      fill="var(--viz-error-ink)"
    >
      same miss · {LOSS_LABELS[kind]}
    </text>
  );
}

export function LossFunctionsHero() {
  const [kind, setKind] = useState<LossKind>("squared");
  const [t, setT] = useState(0);
  const fit = useMemo(() => fitUnder(kind, POINTS), [kind]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setT(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const DURATION = 1000;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / DURATION);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 340);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, [kind]);

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
              onClick={() => setKind(k)}
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
          <g opacity={0.25 + 0.75 * t}>
            <LossStack kind={kind} fit={fit} t={t} />
          </g>
          <FitLine params={fit} />
          <DataPoints points={POINTS} />
          <PenaltyDeform kind={kind} fit={fit} />
          <OutlierLabel kind={kind} />
        </Plot>
      </div>
    </figure>
  );
}
