"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Axes, DataPoints, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { LossSurface } from "@/components/viz/LossSurface";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { TrainingCurve } from "@/components/viz/TrainingCurve";
import { ScenarioBar } from "@/components/exhibits/ScenarioBar";
import { useActiveFrame } from "@/components/exhibits/StoryScroller";
import type { GradientDescentFrame } from "@content/exhibits/gradient-descent/spine";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { createExperimentStore } from "@/lib/experiment/store";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  createGradientDescent,
  olsFit,
  type DescentStep,
  type GradientDescentRun,
  type LinearParams,
} from "@/lib/models/linear-regression";
import { gradientDescentExperiment } from "@content/exhibits/gradient-descent/experiment";

const useExperiment = createExperimentStore(gradientDescentExperiment);

/** Step budget — experiment.test.ts verifies every scenario claim at this budget. */
const MAX_STEPS = 500;
const PLAY_INTERVAL_MS = 100;
/** Past this the walk is officially off the cliff; playback stops itself. */
const DIVERGENCE_CEILING = 1e12;

const offTheCliff = (s: DescentStep) =>
  !Number.isFinite(s.loss) || s.loss > DIVERGENCE_CEILING;

/** Where the descent is headed — OLS destination, neutral and dashed. */
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

const formatLoss = (loss: number) =>
  !Number.isFinite(loss) ? "∞" : loss >= 1000 ? loss.toExponential(1) : loss.toFixed(2);

/**
 * The gradient-descent experiment island. The learner controls time itself
 * (docs/06, B3): play, pause, single-step, scrub back through the trace, and
 * turn the learning-rate knob mid-descent. Three scenarios, one loss surface
 * — step size is the only variable, and "over the edge" is the failure beat.
 */
export function GradientDescentLab() {
  const { points, params, scenarioId, spec, setParam, loadScenario, reset } =
    useExperiment();
  const learningRate = params.learningRate;

  const runRef = useRef<GradientDescentRun | null>(null);
  const lrRef = useRef(learningRate);
  // Once the learner takes the controls — any pointer or key press inside the
  // lab — the scroll spine stops switching the experiment under them. The
  // guided tour yields to manual exploration (and a scroll never resets the
  // descent mid-walk).
  const manualRef = useRef(false);
  const takeControl = () => {
    manualRef.current = true;
  };

  // The step-0 trace is computed synchronously so the island has its full
  // shape from the very first (and server) render — a lab that pops in
  // after hydration is a layout shift, and CLS is gated in CI (A3).
  const [trace, setTrace] = useState<ReadonlyArray<DescentStep>>(() => [
    ...createGradientDescent(points, { learningRate }).trace,
  ]);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Which face of the graphic is showing. The loss surface is too tall to
  // stack beneath the line in a pinned sticky panel, so it is a switch, not a
  // reveal — and the swap from data space to parameter space is itself the
  // "lift the fog" beat.
  const [view, setView] = useState<"line" | "surface">("line");

  // Declared before the run-creation effect: when a scenario load changes
  // points and learning rate in one commit, the ref must sync first.
  useEffect(() => {
    lrRef.current = learningRate;
    runRef.current?.setLearningRate(learningRate);
  }, [learningRate]);

  // A new dataset identity (scenario load or reset) means a new loss surface:
  // start a fresh run from step 0. The learning rate is read through a ref so
  // mid-run knob turns go through setLearningRate instead of restarting.
  useEffect(() => {
    const run = createGradientDescent(points, { learningRate: lrRef.current });
    runRef.current = run;
    setTrace([...run.trace]);
    setCursor(0);
    setPlaying(false);
  }, [points]);

  const syncFromRun = (run: GradientDescentRun) => {
    setTrace([...run.trace]);
    setCursor(run.trace.length - 1);
  };

  const advance = (steps: number) => {
    const run = runRef.current;
    if (!run || offTheCliff(run.current) || run.current.step >= MAX_STEPS) return;
    // Driving the descent is the moment "seen" becomes "practiced".
    whenHydrated(() => useLearner.getState().recordPractice(spec.id));
    run.run(Math.min(steps, MAX_STEPS - run.current.step));
    syncFromRun(run);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const run = runRef.current;
      if (!run || offTheCliff(run.current) || run.current.step >= MAX_STEPS) {
        setPlaying(false);
        return;
      }
      run.step();
      syncFromRun(run);
    }, PLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [playing]);

  const viewing = trace[Math.min(cursor, Math.max(0, trace.length - 1))];
  const latest = trace[trace.length - 1];
  const target = useMemo(() => olsFit(points), [points]);
  const scenario = spec.scenarios.find((s) => s.id === scenarioId) ?? spec.scenarios[0];
  const diverged = latest !== undefined && offTheCliff(latest);
  const exhausted = latest !== undefined && latest.step >= MAX_STEPS;

  // The "break it on purpose" lab task (docs/06, B5) listens for this.
  useEffect(() => {
    if (diverged) reportTaskEvent("gradient-descent:diverged");
  }, [diverged]);

  // Scroll spine (Stream 2): each beat hands the lab a scenario + which face to
  // show. We only reload when the scenario actually changes, so the walk the
  // learner already played survives a beat that merely lifts the fog (object
  // constancy). Outside a spine `frame` is null and the lab runs free.
  const frame = useActiveFrame<GradientDescentFrame>();
  useEffect(() => {
    if (!frame || manualRef.current) return;
    setView(frame.view);
    if (frame.scenarioId !== useExperiment.getState().scenarioId) {
      loadScenario(frame.scenarioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame]);

  const xDomain: [number, number] = [-1, 11];
  const yDomain: [number, number] = [-5, 30];

  if (!viewing) return null;

  return (
    <div
      className="rounded-xl border border-line bg-raised p-6"
      onPointerDownCapture={takeControl}
      onKeyDownCapture={takeControl}
    >
      <ScenarioBar
        scenarios={spec.scenarios}
        activeId={scenario.id}
        onSelect={loadScenario}
        onReset={reset}
        resetLabel="Restart descent"
      />

      <p className="mt-4 max-w-[70ch] leading-relaxed text-ink-muted">{scenario.prompt}</p>

      <div
        role="group"
        aria-label="Which face of the graphic to show"
        className="mt-6 inline-flex rounded-full border border-line p-0.5 text-sm"
      >
        {(
          [
            ["line", "The line"],
            ["surface", "The surface"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
            className={`rounded-full px-4 py-1 transition-colors ${
              view === value
                ? "bg-accent text-accent-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "line" ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-[3fr_2fr]">
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
        <div className="lift-fog mt-4">
          <LossSurface points={points} trace={trace} cursor={cursor} />
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Every point on this map is a candidate line — slope across, intercept
            up — and the shading is how wrong that line is, in log bands. The{" "}
            <span style={{ color: "var(--viz-param-ink)" }}>purple path</span> is
            the walk so far; the dot is where the scrubber is standing. Step,
            scrub, and switch scenarios — watch the careful walk curve into the
            valley, and the reckless one rocket off the map.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            whenHydrated(() => useLearner.getState().recordPractice(spec.id));
            setPlaying((p) => !p);
          }}
          disabled={diverged || exhausted}
          className="rounded-full border border-accent px-5 py-1.5 text-sm font-medium text-accent hover:bg-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={() => advance(1)}
          disabled={playing || diverged || exhausted}
          className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted hover:border-ink-faint disabled:cursor-not-allowed disabled:opacity-40"
        >
          Step
        </button>
        <button
          type="button"
          onClick={() => advance(10)}
          disabled={playing || diverged || exhausted}
          className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted hover:border-ink-faint disabled:cursor-not-allowed disabled:opacity-40"
        >
          Step ×10
        </button>
        <div className="ml-auto">
          <ParamSlider
            def={spec.params[0]}
            value={learningRate}
            onChange={(v) => setParam("learningRate", v)}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
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
          className="w-full accent-[var(--accent)] disabled:opacity-40"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-sm">
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

      {diverged && (
        <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--viz-error)" }}>
          The loss has left the chart — each step overshot the valley and landed
          higher than the last. This is divergence. Scrub back to watch the
          first overshoot, or lower the learning rate and restart the descent.
        </p>
      )}

      {exhausted && !diverged && (
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          Step budget reached ({MAX_STEPS} steps). Restart the descent to keep
          experimenting.
        </p>
      )}
    </div>
  );
}
