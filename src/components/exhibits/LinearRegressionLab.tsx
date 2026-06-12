"use client";

import { useMemo, useState } from "react";
import {
  Axes,
  DataPoints,
  FitLine,
  PaintLayer,
  Plot,
  ResidualLines,
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
  const [showResiduals, setShowResiduals] = useState(true);
  // Mode preference persists lab-wide (docs/06, A4); render the server
  // default until the persisted value has hydrated.
  const hydrated = useHydrated();
  const storedMode = useSettings((s) => s.mode);
  const setMode = useSettings((s) => s.setMode);
  const mode = hydrated ? storedMode : "visual";

  const editable =
    spec.datasets.find((d) => d.id === datasetId)?.editable ?? false;
  const practiced = () =>
    whenHydrated(() => useLearner.getState().recordPractice(spec.id));

  const fit = useMemo(() => olsFit(points), [points]);
  const loss = useMemo(() => mse(points, fit), [points, fit]);
  const scenario = spec.scenarios.find((s) => s.id === scenarioId) ?? spec.scenarios[0];

  // Fixed domains so dragging a point never reshapes the axes under the
  // learner's pointer (and outliers visibly leave the trend, not the frame).
  const xDomain: [number, number] = [-1, 11];
  const yDomain: [number, number] = [-25, 50];

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <ScenarioBar
        scenarios={spec.scenarios}
        activeId={scenario.id}
        onSelect={loadScenario}
        onReset={reset}
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
          {showResiduals && <ResidualLines points={points} params={fit} />}
          <FitLine params={fit} />
          <DataPoints
            points={points}
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
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-ink-muted">
            <input
              type="checkbox"
              checked={showResiduals}
              onChange={(e) => setShowResiduals(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Show residuals
          </label>
        </div>
      </div>
      )}
    </div>
  );
}
