"use client";

import { useState } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { absError } from "@/lib/models/regression-task";
import {
  queryPoints,
  regressionTaskScenario,
  shownExamples,
  X_LABEL,
  Y_LABEL,
  type Example,
} from "@content/exhibits/regression-task/experiment";

/**
 * "Be the model": for each query the learner is shown only the study hours and drags a
 * predicted score, then reveals the truth and reads the error as a vertical distance. The
 * running total of those distances is the loss — the quantity a regression model exists to
 * minimise. Predicting a continuous value, scored by how far off, *is* the regression task.
 */
const clamp = (v: number) => Math.max(0, Math.min(100, v));

type Done = { x: number; pred: number; truth: number };

/** The interactive prediction layer: a draggable marker at the query's hours, the
 * revealed truth, and the residual between them. */
function PredictionLayer({
  query,
  pred,
  onPred,
  revealed,
  done,
}: {
  query: Example;
  pred: number;
  onPred: (v: number) => void;
  revealed: boolean;
  done: Done[];
}) {
  const { x, y, svgRef, height } = usePlot();
  const toScore = (clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return pred;
    const py = ((clientY - rect.top) / rect.height) * height;
    return Math.round(clamp(y.invert(py)));
  };

  return (
    <g>
      {/* settled past queries: faded truth dots + residuals */}
      {done.map((d, i) => (
        <g key={i} opacity={0.4}>
          <line x1={x(d.x)} x2={x(d.x)} y1={y(d.pred)} y2={y(d.truth)} stroke="var(--viz-error)" strokeWidth={2} />
          <circle cx={x(d.x)} cy={y(d.truth)} r={4} fill="var(--viz-truth)" />
        </g>
      ))}

      {/* the current query: vertical guide at its hours */}
      <line x1={x(query.x)} x2={x(query.x)} y1={y(0)} y2={y(100)} stroke="var(--viz-prediction)" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />

      {revealed && (
        <>
          <line x1={x(query.x)} x2={x(query.x)} y1={y(pred)} y2={y(query.y)} stroke="var(--viz-error)" strokeWidth={2.5} />
          <circle cx={x(query.x)} cy={y(query.y)} r={6} fill="var(--viz-truth)" stroke="var(--surface-bg)" strokeWidth={1.5} />
          <text x={x(query.x) + 10} y={(y(pred) + y(query.y)) / 2} fontSize={12} fontWeight={600} fill="var(--viz-error-ink)">
            off by {absError(pred, query.y).toFixed(0)}
          </text>
        </>
      )}

      {/* the learner's prediction marker */}
      <line x1={x(query.x) - 26} x2={x(query.x) + 26} y1={y(pred)} y2={y(pred)} stroke="var(--viz-prediction)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={x(query.x)} cy={y(pred)} r={6} fill="var(--viz-prediction)" stroke="var(--surface-bg)" strokeWidth={1.5} />

      {/* drag surface (vertical), active until revealed */}
      {!revealed && (
        <rect
          x={x.range[0]}
          y={0}
          width={x.range[1] - x.range[0]}
          height={height}
          fill="transparent"
          className="cursor-ns-resize"
          onPointerDown={(e) => {
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            onPred(toScore(e.clientY));
          }}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            onPred(toScore(e.clientY));
          }}
        />
      )}
    </g>
  );
}

/** Axis captions, positioned from the plot scales. */
function AxisCaptions({ xLabel, yLabel }: { xLabel: string; yLabel: string }) {
  const { x, y, height } = usePlot();
  return (
    <g aria-hidden fill="var(--ink-faint)" fontSize={11} fontFamily="var(--font-mono)">
      <text x={(x.range[0] + x.range[1]) / 2} y={height - 4} textAnchor="middle">{xLabel}</text>
      <text transform={`translate(12, ${(y.range[0] + y.range[1]) / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>
    </g>
  );
}

export function RegressionTaskLab() {
  const [idx, setIdx] = useState(0);
  const [pred, setPred] = useState(65);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState<Done[]>([]);

  const finished = idx >= queryPoints.length;
  const query = finished ? queryPoints[queryPoints.length - 1] : queryPoints[idx];
  const totalDist = done.reduce((s, d) => s + absError(d.pred, d.truth), 0);
  const avgDist = done.length ? totalDist / done.length : 0;

  const reveal = () => {
    whenHydrated(() => useLearner.getState().recordPractice("regression-task"));
    setRevealed(true);
  };
  const next = () => {
    setDone((d) => [...d, { x: query.x, pred, truth: query.y }]);
    setIdx((i) => i + 1);
    setPred(65);
    setRevealed(false);
  };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{regressionTaskScenario.prompt}</p>

          {!finished ? (
            <div className="rounded-lg border border-line bg-sunken p-4">
              <p className="text-sm text-ink-muted">
                Query {idx + 1} of {queryPoints.length} — a student who studied{" "}
                <span className="font-mono text-ink">{query.x}</span> hours.
              </p>
              <p className="mt-1 font-mono text-sm text-ink">your guess: {pred} / 100</p>
              <div className="mt-3 flex gap-2">
                {!revealed ? (
                  <button type="button" onClick={reveal} className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink hover:opacity-90">
                    Reveal the score
                  </button>
                ) : (
                  <button type="button" onClick={next} className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink hover:bg-sunken">
                    {idx + 1 < queryPoints.length ? "Next query →" : "See your loss →"}
                  </button>
                )}
              </div>
              {revealed && (
                <p className="mt-3 text-sm leading-relaxed text-ink-faint">
                  True score <span className="font-mono text-[var(--viz-truth-ink)]">{query.y}</span> — you were off by{" "}
                  <span className="font-mono text-[var(--viz-error-ink)]">{absError(pred, query.y).toFixed(0)}</span>. That distance is
                  your error on this one.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-accent bg-sunken p-4">
              <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Your loss</p>
              <p className="mt-2 leading-relaxed text-ink">
                Total distance <span className="font-mono text-[var(--viz-error-ink)]">{totalDist.toFixed(0)}</span> across{" "}
                {done.length} predictions — an average of{" "}
                <span className="font-mono text-[var(--viz-error-ink)]">{avgDist.toFixed(1)}</span> points off. A regression model is
                just an automatic predictor that makes exactly this total as small as it can.
              </p>
            </div>
          )}

          <StatGrid
            direction="col"
            caption="Scored by distance, not right/wrong"
            stats={[
              { label: "predictions made", value: `${done.length} / ${queryPoints.length}`, hue: "var(--viz-prediction-ink)" },
              { label: "total distance (your loss)", value: totalDist.toFixed(0), hue: "var(--viz-error-ink)", note: "lower is better" },
              { label: "average miss", value: done.length ? `${avgDist.toFixed(1)} pts` : "—", hue: "var(--viz-neutral-ink)" },
            ]}
          />
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={620}
            height={440}
            xDomain={[0, 10.4]}
            yDomain={[0, 100]}
            ariaLabel={`Study hours versus exam score. Predict the score for a student who studied ${query.x} hours by dragging the blue marker, then reveal the true score and read the error as a vertical distance.`}
            interactive
          >
            <Axes />
            <AxisCaptions xLabel={X_LABEL} yLabel={Y_LABEL} />
            <DataPoints points={shownExamples} />
            <PredictionLayer query={query} pred={pred} onPred={setPred} revealed={revealed || finished} done={done} />
          </Plot>
        </div>
      </div>
    </div>
  );
}
