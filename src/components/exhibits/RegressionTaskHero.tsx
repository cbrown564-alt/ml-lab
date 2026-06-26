"use client";

import { useEffect, useMemo, useState } from "react";
import { Plot, usePlot } from "@/components/viz/Plot";
import { PlotContributionStack } from "@/components/viz/primitives";
import { allExamples, regressionTrend } from "@content/exhibits/regression-task/experiment";

/**
 * The specimen hero — what a regression task is, in one picture. The model's rule
 * is a line through study-hours → exam-score; each student's actual score sits off
 * it by some amount, and on load those gaps draw in as vertical error-hued stems.
 * An error ruler and ContributionStack on the right accumulate the residuals into
 * a running mean absolute error as they grow. Reduced motion renders stems drawn.
 */

const XS = allExamples.map((e) => e.x);
const YS = allExamples.map((e) => e.y);
const X_DOMAIN: [number, number] = [Math.min(...XS) - 0.7, Math.max(...XS) + 0.7];
const Y_DOMAIN: [number, number] = [Math.min(...YS) - 10, Math.max(...YS) + 10];
const DEMO = [...allExamples].sort(
  (a, b) => Math.abs(b.y - regressionTrend(b.x)) - Math.abs(a.y - regressionTrend(a.x)),
)[2];

const residuals = allExamples.map((e) => Math.abs(e.y - regressionTrend(e.x)));

function HeroGraphic({ t }: { t: number }) {
  const { x, y } = usePlot();
  const [x0, x1] = X_DOMAIN;
  const shown = Math.max(1, Math.round(t * allExamples.length));
  const partial = residuals.slice(0, shown);
  const mae = partial.reduce((s, r) => s + r, 0) / partial.length;

  return (
    <g>
      <line
        x1={x(x0)}
        y1={y(regressionTrend(x0))}
        x2={x(x1)}
        y2={y(regressionTrend(x1))}
        stroke="var(--viz-prediction)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text
        x={x(x1) - 6}
        y={y(regressionTrend(x1)) - 9}
        textAnchor="end"
        fontSize={12}
        fontFamily="var(--font-mono)"
        paintOrder="stroke"
        stroke="var(--surface-bg)"
        strokeWidth={3}
        fill="var(--viz-prediction-ink)"
      >
        the prediction
      </text>
      {allExamples.map((e, i) => {
        const yhat = regressionTrend(e.x);
        const isDemo = e === DEMO;
        const landed = i < shown;
        return (
          <line
            key={i}
            x1={x(e.x)}
            y1={y(yhat)}
            x2={x(e.x)}
            y2={y(yhat + (e.y - yhat) * (landed ? 1 : 0))}
            stroke="var(--viz-error)"
            strokeWidth={isDemo ? 2.5 : 1.5}
            opacity={isDemo ? 0.92 : landed ? 0.62 : 0.15}
          />
        );
      })}
      {allExamples.map((e, i) => {
        const isDemo = e === DEMO;
        const landed = i < shown;
        return (
          <g key={`p${i}`}>
            {isDemo && landed && (
              <circle
                cx={x(e.x)}
                cy={y(e.y)}
                r={11}
                fill="none"
                stroke="var(--viz-error)"
                strokeWidth={1.5}
                opacity={0.55}
              />
            )}
            <circle
              cx={x(e.x)}
              cy={y(e.y)}
              r={isDemo ? 6.5 : (landed ? 5 : 4)}
              fill="var(--viz-truth)"
              stroke={isDemo && landed ? "var(--viz-error)" : "var(--surface-bg)"}
              strokeWidth={isDemo && landed ? 2 : 1.5}
              opacity={landed ? 1 : 0.35}
            />
          </g>
        );
      })}
      {DEMO && (
        <text
          x={x(DEMO.x) + 10}
          y={(y(DEMO.y) + y(regressionTrend(DEMO.x))) / 2}
          fontSize={12}
          fontFamily="var(--font-mono)"
          paintOrder="stroke"
          stroke="var(--surface-bg)"
          strokeWidth={3}
          fill="var(--viz-error-ink)"
          opacity={t}
        >
          error = distance
        </text>
      )}
      <PlotContributionStack
        values={residuals}
        progress={t}
        total={mae}
        totalLabel="avg miss"
        variant="bar"
        width={48}
        insetRight={20}
      />
    </g>
  );
}

export function RegressionTaskHero() {
  const [t, setT] = useState(0);
  const meanAbs = useMemo(
    () =>
      allExamples.reduce((s, e) => s + Math.abs(e.y - regressionTrend(e.x)), 0) /
      allExamples.length,
    [],
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setT(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const DURATION = 1100;
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
          A regression task
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          judged on how close · avg miss {meanAbs.toFixed(1)} pts
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <Plot
          width={1200}
          height={360}
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          ariaLabel={`Students' exam scores against study hours, with the model's prediction line through them. Each student's score sits off the line by some distance — that gap accumulates into the average miss readout on the right. The average miss is about ${meanAbs.toFixed(0)} points.`}
        >
          <HeroGraphic t={t} />
        </Plot>
      </div>
    </figure>
  );
}
