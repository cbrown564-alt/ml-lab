"use client";

import { useEffect, useMemo } from "react";
import { Annotation, Axes, DataPoints, FitLine, Plot, ResidualLines, ResidualSquares, usePlot } from "@/components/viz/Plot";
import { StatGrid } from "@/components/viz/StatGrid";
import { LossShapes } from "@/components/exhibits/LossShapes";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { LossFunctionsFrame } from "@content/exhibits/loss-functions/spine";
import { createExperimentStore } from "@/lib/experiment/store";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { mse, type LinearParams } from "@/lib/models/linear-regression";
import { fitUnder, meanAbsError, meanHuber, type LossKind } from "@/lib/models/loss-functions";
import { lossFunctionsExperiment } from "@content/exhibits/loss-functions/experiment";

/**
 * The guided graphic for the See-it story. The spine asserts the dataset and which
 * judge to emphasise at each beat; the learner can drag a point but cannot wander
 * off the rails. Object constancy: stepping re-frames this one plot rather than
 * replacing it.
 */
const useExperiment = createExperimentStore(lossFunctionsExperiment);

const LABEL: Record<LossKind, string> = { squared: "squared", absolute: "absolute", huber: "Huber" };
const lossValue = (kind: LossKind, points: import("@/lib/models/linear-regression").Point[], fit: LinearParams) =>
  kind === "squared" ? mse(points, fit) : kind === "absolute" ? meanAbsError(points, fit) : meanHuber(points, fit);

function GhostLine({ params, label, below = false }: { params: LinearParams; label: string; below?: boolean }) {
  const { x, y } = usePlot();
  if (!Number.isFinite(params.slope + params.intercept)) return null;
  const [d0, d1] = x.domain;
  const yEnd = params.slope * d1 + params.intercept;
  return (
    <g aria-hidden>
      <line
        x1={x(d0)} y1={y(params.slope * d0 + params.intercept)}
        x2={x(d1)} y2={y(yEnd)}
        stroke="var(--viz-neutral)" strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="5 4"
      />
      {/* The two ghosts ride close together (both robust to outliers), so stagger
          their labels above / below the line — otherwise they stack and collide. */}
      <text
        x={x(d1) - 4}
        y={y(yEnd) + (below ? 14 : -5)}
        textAnchor="end"
        fontSize={11}
        fontFamily="var(--font-mono)"
        paintOrder="stroke"
        stroke="var(--surface-bg)"
        strokeWidth={3}
        fill="var(--viz-neutral)"
      >
        {label}
      </text>
    </g>
  );
}

export function LossFunctionsStory() {
  const { points, movePoint, loadScenario } = useExperiment();
  const frame = useActiveFrame<LossFunctionsFrame>();
  const judge = frame?.judge ?? "squared";
  const showAll = frame?.showAll ?? true;

  useEffect(() => {
    if (frame && frame.scenarioId !== useExperiment.getState().scenarioId) {
      loadScenario(frame.scenarioId);
    }
  }, [frame, loadScenario]);

  const fits = useMemo(
    () => ({ squared: fitUnder("squared", points), absolute: fitUnder("absolute", points), huber: fitUnder("huber", points) }),
    [points],
  );
  const fit = fits[judge];
  const practiced = () => whenHydrated(() => useLearner.getState().recordPractice("loss-functions"));

  const worst = useMemo(() => {
    let best: { p: (typeof points)[number]; r: number } | null = null;
    for (const p of points) {
      const r = Math.abs(p.y - (fit.slope * p.x + fit.intercept));
      if (!best || r > best.r) best = { p, r };
    }
    return best && best.r > 4 ? best.p : null;
  }, [points, fit]);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          One cloud, three judges
        </span>
        <span className="hidden text-[11px] text-ink-faint sm:inline">drag a point to refit all three</span>
      </figcaption>
      <Plot
        width={640}
        height={440}
        xDomain={[-1, 11]}
        yDomain={[-6, 40]}
        interactive
        ariaLabel={`Scatter plot fitted three ways; the ${LABEL[judge]} judge is emphasised at slope ${fit.slope.toFixed(2)}, intercept ${fit.intercept.toFixed(2)}. Squared ${fits.squared.slope.toFixed(2)}, absolute ${fits.absolute.slope.toFixed(2)}, Huber ${fits.huber.slope.toFixed(2)}.`}
      >
        <Axes />
        {showAll &&
          (["squared", "absolute", "huber"] as LossKind[])
            .filter((k) => k !== judge)
            .map((k, i) => <GhostLine key={k} params={fits[k]} label={LABEL[k]} below={i === 1} />)}
        {judge === "squared" ? <ResidualSquares points={points} params={fit} /> : <ResidualLines points={points} params={fit} />}
        <FitLine params={fit} />
        {worst && (
          <Annotation at={worst} dx={worst.x > 8 ? -16 : 16} dy={-16} label={judge === "squared" ? "the square it chases" : "barely a vote"} color="var(--viz-error)" />
        )}
        <DataPoints points={points} onChange={(i, p) => { practiced(); movePoint(i, p); }} />
      </Plot>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <StatGrid
          caption={`The ${LABEL[judge]} verdict`}
          stats={[
            { label: "slope ŵ", value: fit.slope.toFixed(2), hue: "var(--viz-prediction)" },
            { label: "intcpt b̂", value: fit.intercept.toFixed(2), hue: "var(--viz-prediction)" },
            { label: "loss", value: lossValue(judge, points, fit).toFixed(2), hue: "var(--viz-error)", note: "this judge's score" },
          ]}
        />
        <LossShapes selected={judge} width={320} height={150} />
      </div>
    </figure>
  );
}
