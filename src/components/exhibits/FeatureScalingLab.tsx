"use client";

import { useEffect, useMemo, useState } from "react";
import { LossSurface } from "@/components/viz/LossSurface";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  createGradientDescent,
  mse,
  olsFit,
  type DescentStep,
  type Point,
} from "@/lib/models/linear-regression";
import { conditionNumber, stableLearningRate, standardizeX } from "@/lib/models/conditioning";
import { featureScalingExperiment } from "@content/exhibits/feature-scaling/experiment";

/**
 * Feature scaling, made visible on the loss surface. Raw units give a long, thin,
 * tilted bowl that descent must zig-zag down with tiny steps; standardising x
 * rounds the bowl, so the same walk takes a big confident step almost straight to
 * the floor. The toggle is the whole lesson — same data, a kinder surface.
 */
const RAW: Point[] = featureScalingExperiment.datasets[0].points;
const MAX_STEPS = 300;
const PLAY_MS = 90;

type Scaling = "raw" | "standardised";

/** Run descent to convergence (or the budget) at this surface's best stable rate. */
function walk(points: Point[]): { trace: DescentStep[]; lr: number; steps: number } {
  const lr = stableLearningRate(points);
  const run = createGradientDescent(points, { learningRate: lr });
  const floor = mse(points, olsFit(points));
  while (run.current.step < MAX_STEPS && run.current.loss > floor * 1.01 + 1e-9) run.step();
  return { trace: [...run.trace], lr, steps: run.current.step };
}

export function FeatureScalingLab() {
  const [scaling, setScaling] = useState<Scaling>("raw");
  const points = useMemo(() => (scaling === "raw" ? RAW : standardizeX(RAW)), [scaling]);
  const { trace, lr, steps } = useMemo(() => walk(points), [points]);
  const kappa = useMemo(() => conditionNumber(points), [points]);

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  // New surface (toggle): rewind so the walk replays from the flat line.
  const [prevTrace, setPrevTrace] = useState(trace);
  if (trace !== prevTrace) {
    setPrevTrace(trace);
    setCursor(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setCursor((c) => {
        if (c >= trace.length - 1) {
          setPlaying(false);
          return c;
        }
        return c + 1;
      });
    }, PLAY_MS);
    return () => clearInterval(t);
  }, [playing, trace.length]);

  const atEnd = cursor >= trace.length - 1;

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">
            {featureScalingExperiment.scenarios[0].prompt}
          </p>

          <div role="group" aria-label="Whether the input is scaled" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
            {(
              [
                ["raw", "Raw units"],
                ["standardised", "Standardised"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={scaling === value}
                onClick={() => {
                  whenHydrated(() => useLearner.getState().recordPractice("feature-scaling"));
                  setScaling(value);
                }}
                className={`rounded-full px-4 py-1 transition-colors ${
                  scaling === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <StatGrid
            direction="col"
            caption="The shape of the walk"
            stats={[
              { label: "condition #", value: kappa < 10 ? kappa.toFixed(1) : Math.round(kappa).toString(), hue: "var(--viz-error)", note: "bowl stretch — 1 is round" },
              { label: "stable step η", value: lr.toFixed(3), hue: "var(--viz-param)", note: "largest safe rate here" },
              { label: "steps to floor", value: steps >= MAX_STEPS ? `${MAX_STEPS}+` : String(steps), hue: "var(--viz-prediction)" },
            ]}
          />

          <p className="text-sm leading-relaxed text-ink-faint">
            {scaling === "raw"
              ? "The bowl is stretched, so the biggest safe step is tiny and the walk has to zig-zag — many steps to reach the floor."
              : "Round bowl: one big step points almost at the floor, and the walk is over in a handful of steps."}
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <LossSurface points={points} trace={trace} cursor={cursor} width={720} height={560} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                whenHydrated(() => useLearner.getState().recordPractice("feature-scaling"));
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
        </div>
      </div>
    </div>
  );
}
