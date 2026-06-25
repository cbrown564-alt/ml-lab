"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Axes, DataPoints, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { TrainingCurve } from "@/components/viz/TrainingCurve";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActHandoffFrame } from "@/components/exhibits/ActHandoffContext";
import { ScenarioBar } from "@/components/exhibits/ScenarioBar";

const LossSurface = dynamic(
  () => import("@/components/viz/LossSurface").then((m) => m.LossSurface),
  { ssr: false, loading: () => <div className="h-[560px] rounded-xl border border-line bg-sunken" aria-hidden /> },
);
const GradientDescentMicroscope = dynamic(
  () => import("@/components/exhibits/GradientDescentMicroscope").then((m) => m.GradientDescentMicroscope),
  { ssr: false, loading: () => <div className="h-[420px] rounded-xl border border-line bg-sunken" aria-hidden /> },
);
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
  const storyFrame = useActHandoffFrame<GradientDescentFrame>();
  const appliedHandoff = useRef(false);
  const [handoffVisible, setHandoffVisible] = useState(false);

  const runRef = useRef<GradientDescentRun | null>(null);
  const lrRef = useRef(learningRate);

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
  const [view, setView] = useState<"line" | "surface" | "microscope">("line");

  // Declared before the run-creation effect: when a scenario load changes
  // points and learning rate in one commit, the ref must sync first.
  useEffect(() => {
    lrRef.current = learningRate;
    runRef.current?.setLearningRate(learningRate);
  }, [learningRate]);

  // Seed Run-it from the See-it story's final frame (scenario, view, microscope).
  useEffect(() => {
    if (appliedHandoff.current || !storyFrame) return;
    if (!spec.scenarios.some((s) => s.id === storyFrame.scenarioId)) return;
    appliedHandoff.current = true;
    loadScenario(storyFrame.scenarioId);
    if (storyFrame.microscope) setView("microscope");
    else setView(storyFrame.view);
    setHandoffVisible(true);
  }, [storyFrame, loadScenario, spec.scenarios]);

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

  const xDomain: [number, number] = [-0.5, 6.5];
  const yDomain: [number, number] = [-2, 22];

  if (!viewing) return null;

  const transport = (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
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
      </div>
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
  );

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      {handoffVisible && storyFrame && (
        <p
          className="mb-4 rounded-lg border px-3 py-2 font-mono text-[11px] leading-relaxed tracking-wide"
          style={{
            borderColor: "color-mix(in oklab, var(--viz-param) 35%, var(--line))",
            background: "color-mix(in oklab, var(--viz-param) 8%, var(--surface-raised))",
            color: "var(--viz-param-ink)",
          }}
          role="status"
        >
          Continuing from See it — scenario &ldquo;{storyFrame.scenarioId.replace(/-/g, " ")}&rdquo;
          {storyFrame.microscope ? " · microscope view" : ` · ${storyFrame.view} view`}
        </p>
      )}
      <ScenarioBar
        scenarios={spec.scenarios}
        activeId={scenario.id}
        onSelect={loadScenario}
        onReset={reset}
        resetLabel="Restart descent"
      />

      {/* Canvas-first (FINDINGS F6): the descent takes the dominant right column;
          the scene's prompt, the one knob, and the live readout sit in a rail. */}
      <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{scenario.prompt}</p>

          <div
            role="group"
            aria-label="Which face of the graphic to show"
            className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
          >
            {(
              [
                ["line", "The line"],
                ["surface", "The surface"],
                ["microscope", "One step"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={`rounded-full px-4 py-1 transition-colors ${
                  view === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <ParamSlider
            def={spec.params[0]}
            value={learningRate}
            onChange={(v) => setParam("learningRate", v)}
          />

          <StatGrid
            direction="col"
            caption="Where the walk stands"
            stats={[
              {
                label: "step",
                value:
                  viewing.step !== latest.step
                    ? `${viewing.step} / ${latest.step}`
                    : String(viewing.step),
              },
              { label: "slope ŵ", value: viewing.params.slope.toFixed(2), hue: "var(--viz-prediction)" },
              { label: "intcpt b̂", value: viewing.params.intercept.toFixed(2), hue: "var(--viz-prediction)" },
              { label: "loss", value: formatLoss(viewing.loss), hue: "var(--viz-error)", note: "lower is better" },
            ]}
          />

          {diverged && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--viz-error)" }}>
              The loss has left the chart — each step overshot the valley and
              landed higher than the last. This is divergence. Scrub back to watch
              the first overshoot, or lower the learning rate and restart.
            </p>
          )}
          {exhausted && !diverged && (
            <p className="text-sm leading-relaxed text-ink-muted">
              Step budget reached ({MAX_STEPS} steps). Restart the descent to keep
              experimenting.
            </p>
          )}
        </div>

        <div className="mt-6 lg:mt-0">
          {view === "line" ? (
            <div className="flex flex-col gap-2">
              <Plot
                width={640}
                height={460}
                xDomain={xDomain}
                yDomain={yDomain}
                ariaLabel={`Scatter plot of ${points.length} data points. The line being learned by gradient descent is at step ${viewing.step}: slope ${viewing.params.slope.toFixed(2)}, intercept ${viewing.params.intercept.toFixed(2)}, loss ${formatLoss(viewing.loss)}. A dashed line marks the least-squares destination.`}
              >
                <Axes />
                <TargetLine params={target} />
                <FitLine params={viewing.params} />
                <DataPoints points={points} />
              </Plot>
              <TrainingCurve trace={trace} cursor={cursor} width={640} height={168} />
            </div>
          ) : view === "surface" ? (
            <div className="lift-fog">
              <LossSurface
                points={points}
                trace={trace}
                cursor={cursor}
                width={760}
                height={560}
              />
            </div>
          ) : cursor > 0 ? (
            <div className="lift-fog">
              <GradientDescentMicroscope
                before={trace[cursor - 1]}
                after={trace[cursor]}
                learningRate={learningRate}
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-ink-muted">
              Step once (or scrub past step 0) to freeze an update and inspect its gradient, parameter delta, and loss change.
            </p>
          )}
          {transport}
        </div>
      </div>
    </div>
  );
}
