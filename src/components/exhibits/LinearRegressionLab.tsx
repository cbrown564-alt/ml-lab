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
import { CodePanel } from "@/components/code/CodePanel";
import { ScenarioBar } from "@/components/exhibits/ScenarioBar";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { createExperimentStore } from "@/lib/experiment/store";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { useSettings } from "@/lib/settings/store";
import { useHydrated } from "@/lib/use-hydrated";
import { mse, olsFit } from "@/lib/models/linear-regression";
import { linearRegressionPython } from "@/lib/models/linear-regression-py";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";

const useExperiment = createExperimentStore(linearRegressionExperiment);

/**
 * The linear-regression experiment island. The manipulation→insight chain
 * (docs/06, B1): drag data, the OLS line refits live, residuals expose the
 * errors being minimized, and the outlier scenario shows squared error's
 * obsession with big mistakes.
 */
export function LinearRegressionLab() {
  const {
    points,
    datasetId,
    scenarioId,
    spec,
    movePoint,
    addPoint,
    removePoint,
    loadScenario,
    reset,
  } = useExperiment();
  const [errorView, setErrorView] = useState<"lines" | "squares" | "hidden">("lines");
  // Mode preference persists lab-wide (docs/06, A4); render the server
  // default until the persisted value has hydrated.
  const hydrated = useHydrated();
  const storedMode = useSettings((s) => s.mode);
  const setMode = useSettings((s) => s.setMode);
  const mode = hydrated ? storedMode : "visual";

  // Scenario swaps morph instead of teleporting (docs/06, B3): points and
  // fit line ease for one beat, then everything is instant again so drags
  // stay perceived-instant.
  const [easing, setEasing] = useState(false);
  const easeTimer = useRef<number | null>(null);
  const beginEase = () => {
    setEasing(true);
    if (easeTimer.current !== null) clearTimeout(easeTimer.current);
    easeTimer.current = window.setTimeout(() => setEasing(false), 450);
  };

  const handleScenario = (id: string) => {
    beginEase();
    // The tyranny scenario's punchline is the squares (docs/06, B6): the
    // outlier's square dwarfing every other penalty IS the lesson. Stage it.
    if (id === "tyranny-of-the-outlier") setErrorView("squares");
    loadScenario(id);
  };

  const handleReset = () => {
    beginEase();
    reset();
  };

  const editable =
    spec.datasets.find((d) => d.id === datasetId)?.editable ?? false;
  const practiced = () =>
    whenHydrated(() => useLearner.getState().recordPractice(spec.id));

  const fit = useMemo(() => olsFit(points), [points]);
  const loss = useMemo(() => mse(points, fit), [points, fit]);

  // The "evict the outliers" lab task (docs/06, B5): on the outlier dataset,
  // both rogues tamed (dragged back or removed) without nuking the crowd.
  const outliersTamed =
    datasetId === "with-outliers" && points.length >= 26 && loss < 2;
  useEffect(() => {
    if (outliersTamed) reportTaskEvent("linear-regression:outliers-tamed");
  }, [outliersTamed]);
  const scenario = spec.scenarios.find((s) => s.id === scenarioId) ?? spec.scenarios[0];

  // The biggest mistake gets named in the graphic itself (docs/06, B2).
  const worst = useMemo(() => {
    if (points.length < 2 || errorView !== "squares") return null;
    let best: { p: (typeof points)[number]; r: number } | null = null;
    for (const p of points) {
      const r = Math.abs(p.y - (fit.slope * p.x + fit.intercept));
      if (!best || r > best.r) best = { p, r };
    }
    return best && best.r > 3 ? best.p : null;
  }, [points, fit, errorView]);

  // Fixed domains so dragging a point never reshapes the axes under the
  // learner's pointer (and outliers visibly leave the trend, not the frame).
  // Cropped close to the data extent (clean 0.8–26.4, outliers −9–34.4) so the
  // graphic reads full rather than half-empty (FINDINGS F7).
  const xDomain: [number, number] = [-1, 11];
  const yDomain: [number, number] = [-12, 40];

  const errorToggle = (
    <div role="group" aria-label="How to show the errors" className="flex items-center gap-2">
      <span className="text-sm text-ink-muted">Errors:</span>
      <div className="inline-flex rounded-full border border-line p-0.5 text-sm">
        {(
          [
            ["lines", "Lines"],
            ["squares", "Squares"],
            ["hidden", "Hide"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={errorView === value}
            onClick={() => setErrorView(value)}
            className={`rounded-full px-3 py-0.5 transition-colors ${
              errorView === value ? "bg-sunken text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <ScenarioBar
        scenarios={spec.scenarios}
        activeId={scenario.id}
        onSelect={handleScenario}
        onReset={handleReset}
      />

      {/* Canvas-first (FINDINGS F6): the plot takes the dominant right column and
          reaches above the fold; controls + the live readout sit in a left rail. */}
      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{scenario.prompt}</p>

          <div
            role="group"
            aria-label="Experiment mode"
            className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
          >
            {(["visual", "code"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1 capitalize transition-colors ${
                  mode === m ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {mode === "visual" && (
            <>
              {errorToggle}
              {editable && (
                <button
                  type="button"
                  onClick={() => {
                    practiced();
                    // Keyboard-accessible alternative to painting (docs/06, A6):
                    // the new point lands mid-plot, ready to be arrow-keyed.
                    addPoint({
                      x: (xDomain[0] + xDomain[1]) / 2,
                      y: (yDomain[0] + yDomain[1]) / 2,
                    });
                  }}
                  className="self-start rounded-full border border-line px-4 py-1 text-sm text-ink-muted hover:border-ink-faint"
                >
                  Add point
                </button>
              )}
              <StatGrid
                direction="col"
                caption="The fit, live"
                stats={[
                  { label: "MSE", value: loss.toFixed(2), hue: "var(--viz-error)", note: "avg squared miss" },
                  { label: "n points", value: String(points.length) },
                ]}
              />
            </>
          )}
        </div>

        {mode === "code" ? (
          <div className="mt-6 lg:mt-0">
            <CodePanel template={linearRegressionPython(points)} onRan={practiced} />
          </div>
        ) : (
          <div className="mt-6 lg:mt-0">
            <Plot
              width={640}
              height={520}
              xDomain={xDomain}
              yDomain={yDomain}
              interactive
              ariaLabel={`Scatter plot of ${points.length} data points with the least-squares line fitted live. Slope ${fit.slope.toFixed(2)}, intercept ${fit.intercept.toFixed(2)}, mean squared error ${loss.toFixed(2)}. Dragging points refits the line.${editable ? " Clicking empty space adds a point; double-clicking a point removes it." : ""}`}
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
              {/* Error layers and annotations sit out the morph: points fly,
                  the line sweeps, and the penalties snap back in on the new
                  configuration — the staging IS the reveal. */}
              {!easing && errorView === "lines" && (
                <ResidualLines points={points} params={fit} />
              )}
              {!easing && errorView === "squares" && (
                <ResidualSquares points={points} params={fit} />
              )}
              <FitLine params={fit} ease={easing} />
              {!easing &&
                points.length >= 2 &&
                (() => {
                  const ly = fit.slope * 10.3 + fit.intercept;
                  // Skip the label while the line is steep enough to put it
                  // outside the frame — mid-drag chaos needs no caption.
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
                  // Manipulating the data is the moment "seen" becomes "practiced".
                  practiced();
                  movePoint(i, p);
                }}
                onRemove={(i) => {
                  practiced();
                  removePoint(i);
                }}
              />
            </Plot>
          </div>
        )}
      </div>
    </div>
  );
}
