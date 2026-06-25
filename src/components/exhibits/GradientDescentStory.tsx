"use client";

import { useEffect, useMemo, useState } from "react";
import { Axes, DataPoints, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { LossSurface } from "@/components/viz/LossSurface";
import { GradientDescentMicroscope } from "@/components/exhibits/GradientDescentMicroscope";
import { TrainingCurve } from "@/components/viz/TrainingCurve";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { GradientDescentFrame } from "@content/exhibits/gradient-descent/spine";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { createExperimentStore } from "@/lib/experiment/store";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  createGradientDescent,
  olsFit,
  type DescentStep,
  type LinearParams,
} from "@/lib/models/linear-regression";
import { gradientDescentExperiment } from "@content/exhibits/gradient-descent/experiment";

/**
 * The guided graphic for the Story view. No control chrome: the scroll spine
 * sets the scenario (the learning-rate regime) and which face to show (the line
 * learning, or the loss surface it crosses). The only interaction is time —
 * play and scrub — because watching the walk happen is the whole lesson. The
 * learning rate itself is the narrative's to choose, not the learner's; that
 * freedom lives in the Experiment view.
 */

const useExperiment = createExperimentStore(gradientDescentExperiment);

const MAX_STEPS = 500;
const PLAY_INTERVAL_MS = 100;
const DIVERGENCE_CEILING = 1e12;
const offTheCliff = (s: DescentStep) =>
  !Number.isFinite(s.loss) || s.loss > DIVERGENCE_CEILING;
const formatLoss = (loss: number) =>
  !Number.isFinite(loss) ? "∞" : loss >= 1000 ? loss.toExponential(1) : loss.toFixed(2);

function TargetLine({ params }: { params: LinearParams }) {
  const { x, y } = usePlot();
  const [d0, d1] = x.domain;
  return (
    <line
      x1={x(d0)}
      y1={y(params.slope * d0 + params.intercept)}
      x2={x(d1)}
      y2={y(params.slope * d1 + params.intercept)}
      stroke="var(--viz-neutral)"
      strokeWidth={1.5}
      strokeDasharray="6 4"
      aria-hidden
    />
  );
}

/**
 * In-graphic mark labels so the chart narrates itself (Distill titles every curve
 * on the canvas, not just the axes). Bound to the marks: the data cloud, the OLS
 * target (right end of the dashed line), and the line being learned (its left end,
 * which it tracks as it tilts up). Each label has a surface-coloured halo so it
 * reads over any mark, in that mark's ink hue.
 */
function MarkLabels({
  points,
  target,
  fit,
}: {
  points: ReadonlyArray<{ x: number; y: number }>;
  target: LinearParams;
  fit: LinearParams;
}) {
  const { x, y } = usePlot();
  const [d0, d1] = x.domain;
  // A representative point low-left in the cloud, so "data" sits clear of the
  // top-right target label and the bottom fit-line label.
  const dp = [...points].sort((a, b) => a.x - b.x)[Math.floor(points.length * 0.25)];
  const label = (
    tx: number,
    ty: number,
    text: string,
    fill: string,
    anchor: "start" | "end" = "start",
  ) => (
    <text
      x={tx}
      y={ty}
      textAnchor={anchor}
      fontSize={12}
      paintOrder="stroke"
      stroke="var(--surface-bg)"
      strokeWidth={3.5}
      fill={fill}
    >
      {text}
    </text>
  );
  return (
    <g aria-hidden>
      {label(x(d1) - 6, y(target.slope * d1 + target.intercept) - 7, "least-squares fit", "var(--ink-muted)", "end")}
      {dp && label(x(dp.x) - 10, y(dp.y) - 9, "data", "var(--viz-truth-ink)", "end")}
      {label(x(d0) + 8, y(fit.slope * d0 + fit.intercept) - 9, "the line", "var(--viz-prediction-ink)")}
    </g>
  );
}

export function GradientDescentStory() {
  const { points, params, scenarioId, spec, loadScenario } = useExperiment();
  const learningRate = params.learningRate;

  // The whole walk is precomputed for the scene's fixed learning rate (no
  // mid-run knob here), then played and scrubbed through a cursor.
  const trace = useMemo(() => {
    const run = createGradientDescent(points, { learningRate });
    while (run.current.step < MAX_STEPS && !offTheCliff(run.current)) run.step();
    return [...run.trace];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, learningRate, scenarioId]);

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  // A new scene: rewind to the start so the learner watches it learn afresh.
  // Adjusting state during render (React's documented alternative to a reset
  // effect) keeps a scene change from scheduling a cascading post-render setState.
  const [prevTrace, setPrevTrace] = useState(trace);
  if (trace !== prevTrace) {
    setPrevTrace(trace);
    setCursor(0);
    setPlaying(false);
  }

  // The spine sets scene + face. Reload only on a real scenario change.
  const frame = useActiveFrame<GradientDescentFrame>();
  const view = frame?.view ?? "line";
  const microscopeBeat = frame?.microscope === true;
  useEffect(() => {
    if (!frame) return;
    if (frame.scenarioId !== useExperiment.getState().scenarioId) {
      loadScenario(frame.scenarioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCursor((c) => {
        if (c >= trace.length - 1) {
          setPlaying(false);
          return c;
        }
        return c + 1;
      });
    }, PLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [playing, trace.length]);

  const viewing = trace[Math.min(cursor, trace.length - 1)];
  const latest = trace[trace.length - 1];
  const target = useMemo(() => olsFit(points), [points]);
  const diverged = latest !== undefined && offTheCliff(latest);

  // The "break it on purpose" lab task (docs/06, B5) listens for this.
  useEffect(() => {
    if (diverged) reportTaskEvent("gradient-descent:diverged");
  }, [diverged]);

  const xDomain: [number, number] = [-0.5, 6.5];
  const yDomain: [number, number] = [-2, 22];

  if (!viewing) return null;

  const atEnd = cursor >= trace.length - 1;

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          {microscopeBeat && cursor > 0
            ? "Freeze one update"
            : view === "line"
              ? "Watch the line learn"
              : "The loss surface it is crossing"}
        </span>
        <span className="hidden text-[11px] text-ink-faint sm:inline">
          press play · scrub through time
        </span>
      </figcaption>

      {microscopeBeat && cursor > 0 ? (
        <GradientDescentMicroscope
          before={trace[cursor - 1]}
          after={trace[cursor]}
          learningRate={learningRate}
        />
      ) : view === "line" ? (
        <div className="flex flex-col gap-2">
          <Plot
            width={640}
            height={344}
            xDomain={xDomain}
            yDomain={yDomain}
            ariaLabel={`Scatter plot of ${points.length} data points. The line being learned by gradient descent is at step ${viewing.step}: slope ${viewing.params.slope.toFixed(2)}, intercept ${viewing.params.intercept.toFixed(2)}, loss ${formatLoss(viewing.loss)}. A dashed line marks the least-squares destination.`}
          >
            <Axes />
            <TargetLine params={target} />
            <FitLine params={viewing.params} />
            <DataPoints points={points} />
            <MarkLabels points={points} target={target} fit={viewing.params} />
          </Plot>
          <TrainingCurve trace={trace} cursor={cursor} width={640} height={150} />
        </div>
      ) : (
        <div className="lift-fog">
          <LossSurface
            points={points}
            trace={trace}
            cursor={cursor}
            width={760}
            height={600}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            whenHydrated(() => useLearner.getState().recordPractice(spec.id));
            if (atEnd) setCursor(0);
            setPlaying((p) => !p);
          }}
          disabled={trace.length < 2}
          className="rounded-full border border-accent px-5 py-1.5 text-sm font-medium text-accent hover:bg-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? "Pause" : atEnd ? "Replay" : "Play"}
        </button>
        <input
          type="range"
          aria-label="Scrub through descent steps"
          min={0}
          max={Math.max(0, trace.length - 1)}
          value={Math.min(cursor, trace.length - 1)}
          onChange={(e) => {
            setPlaying(false);
            setCursor(Number(e.target.value));
          }}
          disabled={trace.length < 2}
          className="flex-1 accent-[var(--accent)] disabled:opacity-40"
        />
      </div>

      <div className="mt-4">
        <StatGrid
          caption="Where the walk stands"
          stats={[
            {
              label: "step",
              value:
                viewing.step !== latest.step
                  ? `${viewing.step} / ${latest.step}`
                  : String(viewing.step),
            },
            {
              label: "loss",
              value: formatLoss(viewing.loss),
              hue: "var(--viz-error)",
              note: diverged && atEnd ? "left the chart" : "lower is better",
            },
          ]}
        />
      </div>

      {diverged && atEnd && (
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--viz-error)" }}>
          The loss has left the chart — each step overshot the valley and landed
          higher than the last. This is divergence. Scrub back to watch the first
          overshoot.
        </p>
      )}
    </figure>
  );
}
