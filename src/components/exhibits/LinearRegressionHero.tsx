"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPoints, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { olsFit, type LinearParams } from "@/lib/models/linear-regression";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";

/**
 * The specimen hero — the first frame of the Linear Regression exhibit. A wide,
 * quiet "specimen under glass": the same truth-hued cloud and prediction-hued
 * line as the working plot below, stripped to a portrait — no axes, no readouts,
 * no controls. On load the line eases up from the flat baseline (predict the
 * mean ȳ for everyone) and pivots into the line of best fit; once it settles, the
 * residuals draw in — the vertical misses least-squares makes as small as it can,
 * so the mechanism, not just the result, is in the picture. Motion is the lab's
 * sanctioned `--motion-move`; under reduced motion it renders already settled. The
 * specimen leads the masthead so the learner meets the living object before its tag.
 */

const SPECIMEN = linearRegressionExperiment.datasets.find(
  (d) => d.id === "clean-linear",
)!.points;

// Frame the cloud, not a big matte: the agent read the old wide-empty box as "a
// generic line in dead air". Hugging the data fills the frame and magnifies the
// residual misses so the mechanism (not just the line) reads.
const XS = SPECIMEN.map((p) => p.x);
const YS = SPECIMEN.map((p) => p.y);
const X_DOMAIN: [number, number] = [Math.min(...XS) - 0.5, Math.max(...XS) + 0.5];
const Y_DOMAIN: [number, number] = [Math.min(...YS) - 2.5, Math.max(...YS) + 2.5];

// The baseline guess before the data has any say: a flat line at the mean ȳ.
const FLAT = {
  slope: 0,
  intercept: SPECIMEN.reduce((s, p) => s + p.y, 0) / SPECIMEN.length,
};

export function LinearRegressionHero() {
  const fit = useMemo(() => olsFit(SPECIMEN), []);
  const [settled, setSettled] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // No journey to watch — rest on the fit straight away.
      const id = requestAnimationFrame(() => setSettled(true));
      return () => cancelAnimationFrame(id);
    }
    // Let the flat baseline paint once, then arm the ease and let the cloud
    // pull the line into its fit a beat later.
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

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The line of best fit
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          30 observations
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <Plot
          width={1200}
          height={360}
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          ariaLabel="Thirty observations scattered along a gentle upward trend, with the least-squares line — the single straight line that makes its total squared miss as small as possible — coming to rest on the data, the dashed residuals marking each point's miss."
        >
          {settled && (
            <g style={{ opacity: animate ? 1 : 0, transition: "opacity 600ms ease" }}>
              <HeroResiduals fit={fit} />
            </g>
          )}
          <FitLine params={settled ? fit : FLAT} ease={animate} />
          <DataPoints points={SPECIMEN} />
          {settled && <HeroLabels fit={fit} />}
        </Plot>
      </div>
    </figure>
  );
}

/** The residual misses, drawn bolder than the shared dashed version so they read
 *  even on clean data where each gap is small — the quantity least-squares minimises. */
function HeroResiduals({ fit }: { fit: LinearParams }) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {SPECIMEN.map((p, i) => (
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
  // The point with the biggest miss, to anchor the "residuals" label.
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
        residuals — the misses it minimises
      </text>
    </g>
  );
}

