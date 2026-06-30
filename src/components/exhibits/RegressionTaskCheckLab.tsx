"use client";

import { useState } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { exactMatchAccuracy, mae } from "@/lib/models/regression-task";
import { allExamples, regressionTrend } from "@content/exhibits/regression-task/experiment";

/**
 * The Explain-it companion. Act continuity: this carries the SAME protagonist from
 * See/Run/Break — the scatter, the prediction line, and each point's miss — into the
 * closing act instead of swapping it for two number tiles.
 *
 * Widen the "close enough" band and in-band points fill solid (out-of-band ring red),
 * while the red residual ticks — the honest distances MAE measures — never move. Accuracy is something you can buy by loosening the ruler;
 * distance is not. The tiles below put the numbers on what the scene shows.
 */
const XS = allExamples.map((e) => e.x);
const YS = allExamples.map((e) => e.y);
const X_DOMAIN: [number, number] = [Math.min(...XS) - 0.7, Math.max(...XS) + 0.7];
const Y_DOMAIN: [number, number] = [Math.min(...YS) - 10, Math.max(...YS) + 10];
const PREDS = allExamples.map((p) => regressionTrend(p.x));
const TRUTHS = allExamples.map((p) => p.y);
const MAE = mae(PREDS, TRUTHS);

function ToleranceScene({ tol }: { tol: number }) {
  const { x, y } = usePlot();
  const [x0, x1] = X_DOMAIN;
  const band = [
    [x(x0), y(regressionTrend(x0) + tol)],
    [x(x1), y(regressionTrend(x1) + tol)],
    [x(x1), y(regressionTrend(x1) - tol)],
    [x(x0), y(regressionTrend(x0) - tol)],
  ]
    .map((p) => p.join(","))
    .join(" ");
  return (
    <g>
      <polygon
        points={band}
        fill="var(--viz-prediction)"
        fillOpacity={0.13}
        stroke="var(--viz-prediction)"
        strokeOpacity={0.4}
        strokeDasharray="4 3"
        style={{ transition: "all var(--motion-move)" }}
      />
      <line
        x1={x(x0)}
        y1={y(regressionTrend(x0))}
        x2={x(x1)}
        y2={y(regressionTrend(x1))}
        stroke="var(--viz-prediction)"
        strokeWidth={2.5}
      />
      {allExamples.map((e, i) => {
        const inBand = Math.abs(e.y - regressionTrend(e.x)) <= tol;
        return (
          <g key={i}>
            <line
              x1={x(e.x)}
              y1={y(e.y)}
              x2={x(e.x)}
              y2={y(regressionTrend(e.x))}
              stroke="var(--viz-error)"
              strokeWidth={1}
              strokeOpacity={0.4}
            />
            <circle
              cx={x(e.x)}
              cy={y(e.y)}
              r={4.5}
              fill={inBand ? "var(--viz-truth)" : "var(--surface-bg)"}
              stroke={inBand ? "var(--surface-bg)" : "var(--viz-error)"}
              strokeWidth={inBand ? 1 : 1.75}
              style={{ transition: "fill var(--motion-move), stroke var(--motion-move), stroke-width var(--motion-move)" }}
            />
          </g>
        );
      })}
    </g>
  );
}

export function RegressionTaskCheckLab() {
  const [tol, setTol] = useState(2);
  const acc = Math.round(exactMatchAccuracy(PREDS, TRUTHS, tol) * 100);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          One model, two rulers
        </span>
        <span className="hidden font-mono text-[11px] tracking-wide text-ink-faint uppercase sm:inline">
          widen the band, buy accuracy — the misses don’t move
        </span>
      </figcaption>
      <Plot
        width={520}
        height={360}
        xDomain={X_DOMAIN}
        yDomain={Y_DOMAIN}
        ariaLabel={`Exam score against study hours with the prediction line and a ±${tol}-point "close enough" band. ${acc}% of points fall inside the band, but the average miss stays ${MAE.toFixed(
          1,
        )} points however wide the band gets.`}
      >
        <Axes />
        <ToleranceScene tol={tol} />
      </Plot>
      <div className="mt-4 rounded-lg border border-line bg-sunken p-3">
        <label className="flex items-center justify-between text-sm text-ink-muted">
          <span>“close enough” band</span>
          <span className="font-mono tabular-nums text-ink">±{tol}</span>
        </label>
        <input
          type="range"
          aria-label="Accuracy tolerance band in points"
          min={1}
          max={16}
          step={1}
          value={tol}
          onChange={(e) => setTol(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">accuracy</dt>
          <dd className="mt-1 font-mono text-xl text-[var(--viz-error-ink)]">{acc}%</dd>
          <dd className="text-[11px] text-ink-faint">moves with the band</dd>
        </div>
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">distance (MAE)</dt>
          <dd className="mt-1 font-mono text-xl text-accent">{MAE.toFixed(1)}</dd>
          <dd className="text-[11px] text-ink-faint">fixed &amp; honest</dd>
        </div>
      </dl>
    </figure>
  );
}
