"use client";

import { useMemo, useState } from "react";
import {
  Annotation,
  Axes,
  DataPoints,
  FitLine,
  PaintLayer,
  Plot,
  ResidualLines,
  ResidualSquares,
  usePlot,
} from "@/components/viz/Plot";
import { StatGrid } from "@/components/viz/StatGrid";
import { ScenarioBar } from "@/components/exhibits/ScenarioBar";
import { LossShapes } from "@/components/exhibits/LossShapes";
import { createExperimentStore } from "@/lib/experiment/store";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { mse, type LinearParams } from "@/lib/models/linear-regression";
import { fitUnder, meanAbsError, meanHuber, type LossKind } from "@/lib/models/loss-functions";
import { lossFunctionsExperiment } from "@content/exhibits/loss-functions/experiment";

const useExperiment = createExperimentStore(lossFunctionsExperiment);

const JUDGES: { kind: LossKind; label: string }[] = [
  { kind: "squared", label: "Squared" },
  { kind: "absolute", label: "Absolute" },
  { kind: "huber", label: "Huber" },
];
const lossValue = (kind: LossKind, points: import("@/lib/models/linear-regression").Point[], fit: LinearParams) =>
  kind === "squared" ? mse(points, fit) : kind === "absolute" ? meanAbsError(points, fit) : meanHuber(points, fit);

/** A non-selected judge's line — ghosted and labelled, so all three verdicts are
 * visible at once and the selected one stands out against them. */
function GhostLine({ params, label }: { params: LinearParams; label: string }) {
  const { x, y } = usePlot();
  if (!Number.isFinite(params.slope + params.intercept)) return null;
  const [d0, d1] = x.domain;
  return (
    <g aria-hidden>
      <line
        x1={x(d0)}
        y1={y(params.slope * d0 + params.intercept)}
        x2={x(d1)}
        y2={y(params.slope * d1 + params.intercept)}
        stroke="var(--viz-neutral)"
        strokeWidth={1.5}
        strokeOpacity={0.5}
        strokeDasharray="5 4"
      />
      <text
        x={x(d1) - 4}
        y={y(params.slope * d1 + params.intercept) - 5}
        textAnchor="end"
        fontSize={11}
        fontFamily="var(--font-mono)"
        fill="var(--viz-neutral)"
      >
        {label}
      </text>
    </g>
  );
}

export function LossFunctionsLab() {
  const { points, datasetId, spec, scenarioId, movePoint, addPoint, removePoint, loadScenario, reset } =
    useExperiment();
  const [judge, setJudge] = useState<LossKind>("squared");

  const fits = useMemo(
    () => ({
      squared: fitUnder("squared", points),
      absolute: fitUnder("absolute", points),
      huber: fitUnder("huber", points),
    }),
    [points],
  );
  const fit = fits[judge];
  const editable = spec.datasets.find((d) => d.id === datasetId)?.editable ?? false;
  const scenario = spec.scenarios.find((s) => s.id === scenarioId) ?? spec.scenarios[0];
  const practiced = () => whenHydrated(() => useLearner.getState().recordPractice(spec.id));

  const xDomain: [number, number] = [-1, 11];
  const yDomain: [number, number] = [-6, 40];

  // The worst miss under the current judge — the point the selected line is most
  // arguing with — gets the callout.
  const worst = useMemo(() => {
    let best: { p: (typeof points)[number]; r: number } | null = null;
    for (const p of points) {
      const r = Math.abs(p.y - (fit.slope * p.x + fit.intercept));
      if (!best || r > best.r) best = { p, r };
    }
    return best && best.r > 4 ? best.p : null;
  }, [points, fit]);

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <ScenarioBar
        scenarios={spec.scenarios}
        activeId={scenario.id}
        onSelect={loadScenario}
        onReset={reset}
        resetLabel="Reset data"
      />

      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{scenario.prompt}</p>

          <div role="group" aria-label="Which loss judges the fit" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
            {JUDGES.map(({ kind, label }) => (
              <button
                key={kind}
                type="button"
                aria-pressed={judge === kind}
                onClick={() => {
                  practiced();
                  setJudge(kind);
                }}
                className={`rounded-full px-4 py-1 transition-colors ${
                  judge === kind ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <StatGrid
            direction="col"
            caption="The chosen judge's verdict"
            stats={[
              { label: "slope ŵ", value: fit.slope.toFixed(2), hue: "var(--viz-prediction)" },
              { label: "intcpt b̂", value: fit.intercept.toFixed(2), hue: "var(--viz-prediction)" },
              { label: `${judge} loss`, value: lossValue(judge, points, fit).toFixed(2), hue: "var(--viz-error)", note: "what this judge minimised" },
            ]}
          />

          <LossShapes selected={judge} />
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={640}
            height={480}
            xDomain={xDomain}
            yDomain={yDomain}
            interactive
            ariaLabel={`Scatter plot fitted three ways. The ${judge}-error line has slope ${fit.slope.toFixed(2)}, intercept ${fit.intercept.toFixed(2)}. Squared error gives slope ${fits.squared.slope.toFixed(2)}, absolute ${fits.absolute.slope.toFixed(2)}, Huber ${fits.huber.slope.toFixed(2)} — the judges disagree most where outliers pull. Drag a point to refit all three; click empty space to add one.`}
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
            {/* the two judges you didn't pick, ghosted behind the chosen line */}
            {JUDGES.filter((j) => j.kind !== judge).map((j) => (
              <GhostLine key={j.kind} params={fits[j.kind]} label={j.label.toLowerCase()} />
            ))}
            {judge === "squared" ? (
              <ResidualSquares points={points} params={fit} />
            ) : (
              <ResidualLines points={points} params={fit} />
            )}
            <FitLine params={fit} />
            {worst && (
              <Annotation
                at={worst}
                dx={worst.x > 8 ? -16 : 16}
                dy={-16}
                label={judge === "squared" ? "the square it chases" : "barely a vote here"}
                color="var(--viz-error)"
              />
            )}
            <DataPoints
              points={points}
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
        </div>
      </div>
    </div>
  );
}
