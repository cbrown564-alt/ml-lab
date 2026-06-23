"use client";

import { useEffect, useState } from "react";
import { DataPoints, FitLine, Plot, ResidualSquares, usePlot } from "@/components/viz/Plot";
import { olsFit, type LinearParams, type Point } from "@/lib/models/linear-regression";
import { lossFunctionsExperiment } from "@content/exhibits/loss-functions/experiment";

/**
 * The specimen hero — why the choice of loss matters, in one picture. Squared loss
 * scores a miss by the AREA of its square, so error grows quadratically: on a cloud
 * with one outlier, that single far point's square dwarfs all the rest and bends the
 * least-squares line toward it. The squares draw in on load; the outlier's is
 * called out. This is the mechanism the three judges (squared / absolute / Huber)
 * then argue over. Reduced motion renders the squares already drawn.
 */

const POINTS: Point[] = lossFunctionsExperiment.datasets[0].points;
const FIT: LinearParams = olsFit(POINTS);
const resid = (p: Point) => Math.abs(p.y - (FIT.slope * p.x + FIT.intercept));
const OUTLIER = POINTS.reduce((a, b) => (resid(b) > resid(a) ? b : a), POINTS[0]);

const XS = POINTS.map((p) => p.x);
const YS = POINTS.map((p) => p.y);
const X_DOMAIN: [number, number] = [Math.min(...XS) - 0.6, Math.max(...XS) + 0.6];
// Extra bottom room so the lowest points and their squares don't kiss the axis.
const Y_DOMAIN: [number, number] = [Math.min(...YS) - 8, Math.max(...YS) + 4];

function OutlierLabel() {
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
      one big miss dominates
    </text>
  );
}

export function LossFunctionsHero() {
  const [t, setT] = useState(0);

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
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The price of a miss
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          squared loss = total area
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <Plot
          width={1200}
          height={420}
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          ariaLabel={`A cloud of points with one outlier and the least-squares line through it. Squared loss scores each miss by the area of a square drawn on its residual, so the single far outlier's square is far larger than all the rest and pulls the line toward it — the reason a robust loss is sometimes needed.`}
        >
          <g opacity={0.25 + 0.75 * t}>
            <ResidualSquares points={POINTS} params={FIT} />
          </g>
          <FitLine params={FIT} />
          <DataPoints points={POINTS} />
          <OutlierLabel />
        </Plot>
      </div>
    </figure>
  );
}
