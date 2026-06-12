"use client";

import { useMemo, useState } from "react";
import { Axes, DataPoints, FitLine, Plot, ResidualLines } from "@/components/viz/Plot";
import { ScenarioBar } from "@/components/exhibits/ScenarioBar";
import { createExperimentStore } from "@/lib/experiment/store";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { mse, olsFit } from "@/lib/models/linear-regression";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";

const useExperiment = createExperimentStore(linearRegressionExperiment);

/**
 * The linear-regression experiment island. The manipulation→insight chain
 * (docs/06, B1): drag data, the OLS line refits live, residuals expose the
 * errors being minimized, and the outlier scenario shows squared error's
 * obsession with big mistakes.
 */
export function LinearRegressionLab() {
  const { points, scenarioId, spec, movePoint, loadScenario, reset } = useExperiment();
  const [showResiduals, setShowResiduals] = useState(true);

  const fit = useMemo(() => olsFit(points), [points]);
  const loss = useMemo(() => mse(points, fit), [points, fit]);
  const scenario = spec.scenarios.find((s) => s.id === scenarioId) ?? spec.scenarios[0];

  // Fixed domains so dragging a point never reshapes the axes under the
  // learner's pointer (and outliers visibly leave the trend, not the frame).
  const xDomain: [number, number] = [-1, 11];
  const yDomain: [number, number] = [-25, 50];

  return (
    <div data-surface="lab" className="rounded-xl border border-line p-6">
      <ScenarioBar
        scenarios={spec.scenarios}
        activeId={scenario.id}
        onSelect={loadScenario}
        onReset={reset}
      />

      <p className="mt-4 max-w-[70ch] leading-relaxed text-ink-muted">{scenario.prompt}</p>

      <div className="mt-6">
        <Plot
          xDomain={xDomain}
          yDomain={yDomain}
          ariaLabel={`Scatter plot of ${points.length} data points with the least-squares line fitted live. Slope ${fit.slope.toFixed(2)}, intercept ${fit.intercept.toFixed(2)}, mean squared error ${loss.toFixed(2)}. Dragging points refits the line.`}
        >
          <Axes />
          {showResiduals && <ResidualLines points={points} params={fit} />}
          <FitLine params={fit} />
          <DataPoints
            points={points}
            onChange={(i, p) => {
              // Manipulating the data is the moment "seen" becomes "practiced".
              whenHydrated(() => useLearner.getState().recordPractice(spec.id));
              movePoint(i, p);
            }}
          />
        </Plot>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-sm">
        <span style={{ color: "var(--viz-prediction)" }}>
          ŷ = {fit.slope.toFixed(2)}·x {fit.intercept < 0 ? "−" : "+"}{" "}
          {Math.abs(fit.intercept).toFixed(2)}
        </span>
        <span style={{ color: "var(--viz-error)" }}>MSE = {loss.toFixed(2)}</span>
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
  );
}
