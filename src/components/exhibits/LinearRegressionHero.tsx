"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPoints, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { mse, olsFit, type LinearParams } from "@/lib/models/linear-regression";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";

/**
 * The specimen hero — the first frame of the Linear Regression exhibit. On load the
 * line eases up from the flat baseline and pivots into the line of best fit; once
 * settled, residual areas draw in and accumulate into MSE. A PinAndCompare scrubber
 * lets the learner drag between candidate lines (flat → best fit) and watch the
 * squared-error stack respond. Reduced motion renders already settled.
 */

const SPECIMEN = linearRegressionExperiment.datasets.find(
  (d) => d.id === "clean-linear",
)!.points;

const XS = SPECIMEN.map((p) => p.x);
const YS = SPECIMEN.map((p) => p.y);
const X_DOMAIN: [number, number] = [Math.min(...XS) - 0.5, Math.max(...XS) + 0.5];
const Y_DOMAIN: [number, number] = [Math.min(...YS) - 2.5, Math.max(...YS) + 2.5];

const FLAT = {
  slope: 0,
  intercept: SPECIMEN.reduce((s, p) => s + p.y, 0) / SPECIMEN.length,
};

function lerpParams(a: LinearParams, b: LinearParams, t: number): LinearParams {
  return {
    slope: a.slope + (b.slope - a.slope) * t,
    intercept: a.intercept + (b.intercept - a.intercept) * t,
  };
}

/** ContributionStack — residual squares whose total area is MSE. */
function MseStack({ fit, t }: { fit: LinearParams; t: number }) {
  const { x, y, width, height } = usePlot();
  const stackX = width - 64;
  const maxArea = Math.max(
    ...SPECIMEN.map((p) => {
      const r = p.y - (fit.slope * p.x + fit.intercept);
      return r * r;
    }),
  );
  const areas = SPECIMEN.map((p) => {
    const r = p.y - (fit.slope * p.x + fit.intercept);
    return r * r;
  });
  const shown = Math.max(1, Math.round(t * SPECIMEN.length));
  const partialMse = areas.slice(0, shown).reduce((s, a) => s + a, 0) / SPECIMEN.length;
  const barH = (height - 44) / SPECIMEN.length;

  return (
    <g aria-hidden>
      <text x={stackX + 20} y={12} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        MSE stack
      </text>
      {areas.map((area, i) => {
        const side = Math.sqrt(area / maxArea) * barH * 0.8;
        const visible = i < shown;
        return (
          <rect
            key={i}
            x={stackX + (barH - side) / 2}
            y={22 + i * barH}
            width={visible ? side : 0}
            height={visible ? side : 0}
            fill="var(--viz-error)"
            opacity={0.55}
            rx={1}
          />
        );
      })}
      <text x={stackX + 20} y={height - 8} textAnchor="middle" fontSize={12} fontFamily="var(--font-mono)" fontWeight={600} fill="var(--viz-error-ink)">
        {partialMse.toFixed(2)}
      </text>
    </g>
  );
}

function HeroResiduals({ fit, t }: { fit: LinearParams; t: number }) {
  const { x, y } = usePlot();
  const shown = Math.max(1, Math.round(t * SPECIMEN.length));
  return (
    <g aria-hidden>
      {SPECIMEN.slice(0, shown).map((p, i) => (
        <line
          key={i}
          x1={x(p.x)}
          y1={y(p.y)}
          x2={x(p.x)}
          y2={y(fit.slope * p.x + fit.intercept)}
          stroke="var(--viz-error)"
          strokeWidth={2.25}
          strokeLinecap="round"
          opacity={0.85}
        />
      ))}
    </g>
  );
}

function HeroLabels({ fit }: { fit: LinearParams }) {
  const { x, y } = usePlot();
  const d1 = X_DOMAIN[1];
  const demo = SPECIMEN.reduce(
    (a, b) =>
      Math.abs(b.y - (fit.slope * b.x + fit.intercept)) > Math.abs(a.y - (fit.slope * a.x + fit.intercept)) ? b : a,
    SPECIMEN[0],
  );
  return (
    <g aria-hidden>
      <text
        x={x(d1) - 6}
        y={y(fit.slope * d1 + fit.intercept) - 9}
        textAnchor="end"
        fontSize={12}
        fontFamily="var(--font-mono)"
        paintOrder="stroke"
        stroke="var(--surface-bg)"
        strokeWidth={3}
        fill="var(--viz-prediction-ink)"
      >
        the line of best fit
      </text>
      <text
        x={x(demo.x) + 9}
        y={(y(demo.y) + y(fit.slope * demo.x + fit.intercept)) / 2}
        fontSize={12}
        fontFamily="var(--font-mono)"
        paintOrder="stroke"
        stroke="var(--surface-bg)"
        strokeWidth={3}
        fill="var(--viz-error-ink)"
      >
        residuals → MSE
      </text>
    </g>
  );
}

export function LinearRegressionHero() {
  const bestFit = useMemo(() => olsFit(SPECIMEN), []);
  const [settled, setSettled] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [scrub, setScrub] = useState(1);
  const [residT, setResidT] = useState(0);

  const candidate = useMemo(() => lerpParams(FLAT, bestFit, scrub), [bestFit, scrub]);
  const loss = useMemo(() => mse(SPECIMEN, candidate), [candidate]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => {
        setSettled(true);
        setResidT(1);
      });
      return () => cancelAnimationFrame(id);
    }
    let timer = 0;
    const id = requestAnimationFrame(() => {
      setAnimate(true);
      timer = window.setTimeout(() => setSettled(true), 260);
    });
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!settled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setResidT(1);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / 900);
      setResidT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [settled]);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The line of best fit
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          MSE {loss.toFixed(2)} · scrub candidates
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <Plot
          width={1200}
          height={360}
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          ariaLabel={`Thirty observations with a candidate line. Residual squares accumulate into mean squared error ${loss.toFixed(2)}. Scrub between a flat baseline and the least-squares fit.`}
        >
          {settled && (
            <g style={{ opacity: animate ? 1 : 0, transition: "opacity 600ms ease" }}>
              <HeroResiduals fit={candidate} t={residT} />
              <MseStack fit={candidate} t={residT} />
            </g>
          )}
          <FitLine params={settled ? candidate : FLAT} ease={animate && scrub === 1} />
          <DataPoints points={SPECIMEN} />
          {settled && <HeroLabels fit={candidate} />}
        </Plot>
        {settled && (
          <label className="mt-2 flex items-center gap-3 px-1">
            <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">flat</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(scrub * 100)}
              onChange={(e) => setScrub(Number(e.target.value) / 100)}
              className="min-w-0 flex-1 accent-[var(--viz-prediction)]"
              aria-label="Scrub between flat baseline and best-fit line"
            />
            <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">best fit</span>
          </label>
        )}
      </div>
    </figure>
  );
}
