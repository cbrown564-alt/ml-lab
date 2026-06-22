"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Annotation,
  Axes,
  DataPoints,
  FitLine,
  PaintLayer,
  Plot,
  ResidualLines,
  ResidualSquares,
} from "@/components/viz/Plot";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { LinearRegressionFrame } from "@content/exhibits/linear-regression/spine";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { createExperimentStore } from "@/lib/experiment/store";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { mse, olsFit } from "@/lib/models/linear-regression";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";

/**
 * The guided graphic for the Story view. Stripped of all control chrome — the
 * scroll spine sets the scene (which scenario, which error view) and the prose
 * beside it does the explaining. The only interaction is direct: drag a point,
 * click to add one, double-click to remove. The learner can feel the line
 * respond, but cannot wander off the narrative's rails.
 */

const useExperiment = createExperimentStore(linearRegressionExperiment);

export function LinearRegressionStory() {
  const { points, datasetId, spec, movePoint, addPoint, removePoint, loadScenario } =
    useExperiment();
  const [errorView, setErrorView] = useState<"lines" | "squares" | "hidden">("hidden");

  // Scenario swaps morph for one beat (object constancy); drags stay instant.
  const [easing, setEasing] = useState(false);
  const easeTimer = useRef<number | null>(null);
  const beginEase = () => {
    setEasing(true);
    if (easeTimer.current !== null) clearTimeout(easeTimer.current);
    easeTimer.current = window.setTimeout(() => setEasing(false), 450);
  };

  // The spine drives the scene. Reload the dataset only when the scenario
  // actually changes, so points the learner dragged survive a beat that only
  // swaps the error view (residuals → squares are the same dataset).
  const frame = useActiveFrame<LinearRegressionFrame>();
  useEffect(() => {
    if (!frame) return;
    beginEase();
    if (frame.scenarioId !== useExperiment.getState().scenarioId) {
      loadScenario(frame.scenarioId);
    }
    setErrorView(frame.errorView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  const editable = spec.datasets.find((d) => d.id === datasetId)?.editable ?? false;
  const practiced = () =>
    whenHydrated(() => useLearner.getState().recordPractice(spec.id));

  const fit = useMemo(() => olsFit(points), [points]);
  const loss = useMemo(() => mse(points, fit), [points, fit]);
  const means = useMemo(() => {
    if (points.length === 0) return { x: 0, y: 0 };
    const x = points.reduce((s, p) => s + p.x, 0) / points.length;
    const y = points.reduce((s, p) => s + p.y, 0) / points.length;
    return { x, y };
  }, [points]);

  // The "evict the outliers" lab task (docs/06, B5) — tamable right here.
  const outliersTamed =
    datasetId === "with-outliers" && points.length >= 26 && loss < 2;
  useEffect(() => {
    if (outliersTamed) reportTaskEvent("linear-regression:outliers-tamed");
  }, [outliersTamed]);

  const worst = useMemo(() => {
    if (points.length < 2 || errorView !== "squares") return null;
    let best: { p: (typeof points)[number]; r: number } | null = null;
    for (const p of points) {
      const r = Math.abs(p.y - (fit.slope * p.x + fit.intercept));
      if (!best || r > best.r) best = { p, r };
    }
    return best && best.r > 3 ? best.p : null;
  }, [points, fit, errorView]);

  // Cropped close to the data extent so the graphic reads full (FINDINGS F7).
  const xDomain: [number, number] = [-1, 11];
  const yDomain: [number, number] = [-12, 40];

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          One claim about every point at once
        </span>
        <span className="hidden text-[11px] text-ink-faint sm:inline">
          drag a point · click to add · double-click to remove
        </span>
      </figcaption>
      <Plot
        width={640}
        height={560}
        xDomain={xDomain}
        yDomain={yDomain}
        interactive
        ariaLabel={`Scatter plot of ${points.length} data points with the least-squares line fitted live. Slope ${fit.slope.toFixed(2)}, intercept ${fit.intercept.toFixed(2)}, mean squared error ${loss.toFixed(2)}. Drag a point to refit the line; click empty space to add one; double-click a point to remove it.`}
      >
        <Axes />
        {editable && (
          <PaintLayer
            onAdd={(p) => {
              practiced();
              addPoint(p);
            }}
          />
        )}
        {!easing && errorView === "lines" && <ResidualLines points={points} params={fit} />}
        {!easing && errorView === "squares" && <ResidualSquares points={points} params={fit} />}
        <FitLine params={fit} ease={easing} />
        {!easing &&
          points.length >= 2 &&
          (() => {
            const ly = fit.slope * 10.3 + fit.intercept;
            return ly > yDomain[0] + 3 && ly < yDomain[1] - 4 ? (
              <Annotation
                at={{ x: 10.3, y: ly }}
                dx={-6}
                dy={-18}
                label="ŷ — the model's line"
                color="var(--viz-prediction)"
              />
            ) : null;
          })()}
        {!easing && worst && (
          <Annotation
            at={worst}
            dx={worst.x > 8 ? -16 : 16}
            dy={-16}
            label="area = the penalty it pays here"
            color="var(--viz-error)"
          />
        )}
        <DataPoints
          points={points}
          ease={easing}
          onChange={(i, p) => {
            practiced();
            movePoint(i, p);
          }}
          onRemove={(i) => {
            practiced();
            removePoint(i);
          }}
        />
      </Plot>

      <div className="mt-4">
        <StatGrid
          caption="The fit, live"
          stats={[
            { label: "n", value: String(points.length) },
            { label: "mean x̄", value: means.x.toFixed(1) },
            { label: "mean ȳ", value: means.y.toFixed(1) },
            {
              label: "slope ŵ",
              value: fit.slope.toFixed(2),
              hue: "var(--viz-prediction)",
            },
            {
              label: "intcpt b̂",
              value: fit.intercept.toFixed(2),
              hue: "var(--viz-prediction)",
            },
            {
              label: "MSE",
              value: loss.toFixed(2),
              hue: "var(--viz-error)",
              note: "avg squared miss",
            },
          ]}
        />
      </div>
    </figure>
  );
}
