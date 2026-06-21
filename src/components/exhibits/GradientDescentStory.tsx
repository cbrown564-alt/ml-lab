"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Axes, DataPoints, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { LossSurface } from "@/components/viz/LossSurface";
import { TrainingCurve } from "@/components/viz/TrainingCurve";
import { useActiveFrame } from "@/components/exhibits/StoryScroller";
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
  useEffect(() => {
    setCursor(0);
    setPlaying(false);
  }, [trace]);

  // The spine sets scene + face. Reload only on a real scenario change.
  const frame = useActiveFrame<GradientDescentFrame>();
  const view = frame?.view ?? "line";
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

  const xDomain: [number, number] = [-1, 11];
  const yDomain: [number, number] = [-5, 30];

  if (!viewing) return null;

  const atEnd = cursor >= trace.length - 1;

  return (
    <div className="rounded-xl border border-line bg-raised p-5">
      {view === "line" ? (
        <div className="grid gap-5 lg:grid-cols-[3fr_2fr]">
          <Plot
            xDomain={xDomain}
            yDomain={yDomain}
            ariaLabel={`Scatter plot of ${points.length} data points. The line being learned by gradient descent is at step ${viewing.step}: slope ${viewing.params.slope.toFixed(2)}, intercept ${viewing.params.intercept.toFixed(2)}, loss ${formatLoss(viewing.loss)}. A dashed line marks the least-squares destination.`}
          >
            <Axes />
            <TargetLine params={target} />
            <FitLine params={viewing.params} />
            <DataPoints points={points} />
          </Plot>
          <TrainingCurve trace={trace} cursor={cursor} />
        </div>
      ) : (
        <div className="lift-fog">
          <LossSurface points={points} trace={trace} cursor={cursor} />
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

      <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-1 font-mono text-sm">
        <span className="text-ink-muted">
          step {viewing.step}
          {viewing.step !== latest.step ? ` / ${latest.step}` : ""}
        </span>
        <span style={{ color: "var(--viz-prediction)" }}>
          ŷ = {viewing.params.slope.toFixed(2)}·x{" "}
          {viewing.params.intercept < 0 ? "−" : "+"}{" "}
          {Math.abs(viewing.params.intercept).toFixed(2)}
        </span>
        <span style={{ color: "var(--viz-error)" }}>loss = {formatLoss(viewing.loss)}</span>
      </div>

      {diverged && atEnd && (
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--viz-error)" }}>
          The loss has left the chart — each step overshot the valley and landed
          higher than the last. This is divergence. Scrub back to watch the first
          overshoot.
        </p>
      )}
    </div>
  );
}
