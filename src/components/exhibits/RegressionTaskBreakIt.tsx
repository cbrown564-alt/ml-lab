"use client";

import { useEffect, useState } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { exactMatchAccuracy, mae } from "@/lib/models/regression-task";
import { allExamples, regressionTrend, X_LABEL, Y_LABEL } from "@content/exhibits/regression-task/experiment";

/**
 * The interactive "Break it": a genuinely good model (it tracks the trend within a few
 * points) is scored two ways. By exact-match accuracy it gets ~0% — it never lands on a
 * noisy score exactly — and even a generous tolerance band makes the score *anything you
 * like*, because the band is arbitrary. By distance (MAE) the model reads as what it is:
 * a couple of points off. The metric must match the target's type. Trigger → symptom →
 * diagnose → repair.
 */
const PREDS = allExamples.map((p) => regressionTrend(p.x));
const TRUTHS = allExamples.map((p) => p.y);
const MAE = mae(PREDS, TRUTHS);

type Metric = "accuracy" | "distance";

function Layer({ metric, tol }: { metric: Metric; tol: number }) {
  const { x, y } = usePlot();
  const x0 = 0;
  const x1 = 10.4;
  return (
    <g>
      {/* the model's predictions — the trend line */}
      <line x1={x(x0)} x2={x(x1)} y1={y(regressionTrend(x0))} y2={y(regressionTrend(x1))} stroke="var(--viz-prediction)" strokeWidth={2.5} />

      {metric === "accuracy" && (
        <polygon
          points={[
            [x(x0), y(regressionTrend(x0) - tol)],
            [x(x1), y(regressionTrend(x1) - tol)],
            [x(x1), y(regressionTrend(x1) + tol)],
            [x(x0), y(regressionTrend(x0) + tol)],
          ]
            .map((p) => p.join(","))
            .join(" ")}
          fill="var(--viz-prediction)"
          fillOpacity={0.13}
          stroke="var(--viz-prediction)"
          strokeOpacity={0.4}
          strokeDasharray="4 3"
        />
      )}

      {allExamples.map((p, i) => {
        const resid = regressionTrend(p.x) - p.y;
        const inBand = Math.abs(resid) <= tol;
        if (metric === "distance") {
          return (
            <g key={i}>
              <line x1={x(p.x)} x2={x(p.x)} y1={y(p.y)} y2={y(regressionTrend(p.x))} stroke="var(--viz-error)" strokeWidth={1.75} opacity={0.7} />
              <circle cx={x(p.x)} cy={y(p.y)} r={4.5} fill="var(--viz-truth)" />
            </g>
          );
        }
        return (
          <circle
            key={i}
            cx={x(p.x)}
            cy={y(p.y)}
            r={4.5}
            fill={inBand ? "var(--viz-truth)" : "var(--surface-bg)"}
            stroke={inBand ? "var(--surface-bg)" : "var(--viz-error)"}
            strokeWidth={inBand ? 1 : 1.75}
          />
        );
      })}
    </g>
  );
}

function AxisCaptions() {
  const { x, y, height } = usePlot();
  return (
    <g aria-hidden fill="var(--ink-faint)" fontSize={11} fontFamily="var(--font-mono)">
      <text x={(x.range[0] + x.range[1]) / 2} y={height - 4} textAnchor="middle">{X_LABEL}</text>
      <text transform={`translate(12, ${(y.range[0] + y.range[1]) / 2}) rotate(-90)`} textAnchor="middle">{Y_LABEL}</text>
    </g>
  );
}

export function RegressionTaskBreakIt() {
  const [metric, setMetric] = useState<Metric>("accuracy");
  const [tol, setTol] = useState(1);
  const [hasSeen, setHasSeen] = useState(false);

  const acc = exactMatchAccuracy(PREDS, TRUTHS, tol);

  const broken = metric === "accuracy";
  if (broken && !hasSeen) setHasSeen(true);
  useEffect(() => {
    if (hasSeen) reportTaskEvent("regression-task:metric-mismatch");
  }, [hasSeen]);
  const repaired = metric === "distance" && hasSeen;

  const choose = (m: Metric) => {
    whenHydrated(() => useLearner.getState().recordPractice("regression-task"));
    setMetric(m);
  };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance broken={broken} repaired={repaired} />

          <div role="group" aria-label="Scoring metric" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
            {(
              [
                ["accuracy", "accuracy"],
                ["distance (MAE)", "distance"],
              ] as const
            ).map(([label, m]) => (
              <button key={m} type="button" aria-pressed={metric === m} onClick={() => choose(m as Metric)} className={`rounded-full px-4 py-1 transition-colors ${metric === m ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}>
                {label}
              </button>
            ))}
          </div>

          {metric === "accuracy" ? (
            <div className="rounded-lg border border-line bg-sunken p-4">
              <label className="flex items-center justify-between text-sm text-ink-muted">
                <span>“close enough” band (± points)</span>
                <span className="font-mono tabular-nums text-ink">±{tol}</span>
              </label>
              <input type="range" aria-label="Accuracy tolerance band in points" min={1} max={16} step={1} value={tol} onChange={(e) => setTol(Number(e.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
              <p className="mt-2 font-mono text-sm">
                accuracy <span className="text-[var(--viz-error-ink)]">{Math.round(acc * 100)}%</span>
                <span className="text-ink-faint"> — and it moves with a band you invented</span>
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-accent bg-sunken p-4 font-mono text-sm">
              MAE <span className="text-accent">{MAE.toFixed(1)} points</span>
              <span className="text-ink-faint"> — fixed, honest: how far off on average</span>
            </p>
          )}
          <p className="text-sm leading-relaxed text-ink-faint">
            Same model both ways — the blue line tracks the trend within a few points. Only
            the ruler changed.
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={620}
            height={440}
            xDomain={[0, 10.4]}
            yDomain={[0, 100]}
            ariaLabel={`A good regression model (the trend line) over the true scores, scored by ${metric}. By accuracy within ±${tol} it gets ${Math.round(acc * 100)}%; by distance the mean absolute error is ${MAE.toFixed(1)}.`}
          >
            <Axes />
            <AxisCaptions />
            <Layer metric={metric} tol={tol} />
          </Plot>
        </div>
      </div>
    </div>
  );
}

function Guidance({ broken, repaired }: { broken: boolean; repaired: boolean }) {
  if (repaired) {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          By <span className="font-medium text-accent">distance</span> the model reads as what it is — a couple of points off, on
          average. No arbitrary band: the error of a continuous prediction is just how far
          from the truth, and MAE averages it.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> accuracy isn&apos;t bad — it&apos;s
          the right metric for the classification version (pass/fail), where a prediction
          genuinely is right or wrong. Match the metric to the target&apos;s type.
        </p>
      </div>
    );
  }
  if (broken) {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
        <p className="mt-2 leading-relaxed text-ink">
          A genuinely good model — the blue line tracks the trend within a few points —
          scored by <span className="font-medium text-[var(--viz-error-ink)]">accuracy</span> reads only a fraction “correct”. And that
          fraction is <span className="font-medium text-[var(--viz-error-ink)]">whatever band you invent</span>: widen it toward 100%,
          tighten it toward exact and it collapses to near zero.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> accuracy needs a notion of
          “correct”, and for a continuous target that takes an arbitrary threshold — so the
          number says nothing about the model. <span className="font-medium text-ink">Repair:</span> switch
          to a distance metric (MAE) that needs no band.
        </p>
      </div>
    );
  }
  return <div />;
}
