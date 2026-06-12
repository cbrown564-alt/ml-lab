"use client";

import { useMemo, useRef, useState } from "react";
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
import { CodePanel } from "@/components/code/CodePanel";
import { ScenarioBar } from "@/components/exhibits/ScenarioBar";
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
  const xDomain: [number, number] = [-1, 11];
  const yDomain: [number, number] = [-25, 50];

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <ScenarioBar
        scenarios={spec.scenarios}
        activeId={scenario.id}
        onSelect={handleScenario}
        onReset={handleReset}
      />

      <p className="mt-4 max-w-[70ch] leading-relaxed text-ink-muted">{scenario.prompt}</p>

      <div
        role="group"
        aria-label="Experiment mode"
        className="mt-6 inline-flex rounded-full border border-line p-0.5 text-sm"
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

      {mode === "code" ? (
        <div className="mt-4">
          <CodePanel
            template={linearRegressionPython(points)}
            onRan={practiced}
          />
        </div>
      ) : (
      <div className="mt-4">
        <Plot
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
              return ly > -22 && ly < 46 ? (
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

        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-sm">
          <span style={{ color: "var(--viz-prediction)" }}>
            ŷ = {fit.slope.toFixed(2)}·x {fit.intercept < 0 ? "−" : "+"}{" "}
            {Math.abs(fit.intercept).toFixed(2)}
          </span>
          <span style={{ color: "var(--viz-error)" }}>MSE = {loss.toFixed(2)}</span>
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
              className="rounded-full border border-line px-4 py-1 font-sans text-sm text-ink-muted hover:border-ink-faint"
            >
              Add point
            </button>
          )}
          <div
            role="group"
            aria-label="How to show the errors"
            className="ml-auto flex items-center gap-2 font-sans"
          >
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
                    errorView === value
                      ? "bg-sunken text-ink"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
