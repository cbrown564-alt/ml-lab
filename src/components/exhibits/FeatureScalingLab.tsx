"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LossSurface } from "@/components/viz/LossSurface";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActHandoffFrame } from "@/components/exhibits/ActHandoffContext";
import type { FeatureScalingFrame } from "@content/exhibits/feature-scaling/spine";
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
 * Feature scaling on the loss surface. Toggling raw ↔ standardised morphs the bowl
 * (axis deformation) while the descent path straightens — CounterfactualReplay in one
 * coordinated view instead of a before/after swap.
 */
const RAW: Point[] = featureScalingExperiment.datasets[0].points;
const MAX_STEPS = 300;
const PLAY_MS = 90;
const MORPH_MS = 480;

type Scaling = "raw" | "standardised";

function walk(points: Point[]): { trace: DescentStep[]; lr: number; steps: number } {
  const lr = stableLearningRate(points);
  const run = createGradientDescent(points, { learningRate: lr });
  const floor = mse(points, olsFit(points));
  while (run.current.step < MAX_STEPS && run.current.loss > floor * 1.01 + 1e-9) run.step();
  return { trace: [...run.trace], lr, steps: run.current.step };
}

export function FeatureScalingLab() {
  const storyFrame = useActHandoffFrame<FeatureScalingFrame>();
  const appliedHandoff = useRef(false);
  const [handoffVisible, setHandoffVisible] = useState(false);
  const [scaling, setScaling] = useState<Scaling>("raw");
  const [morphT, setMorphT] = useState(0);
  const morphRaf = useRef(0);

  const rawWalk = useMemo(() => walk(RAW), []);
  const stdWalk = useMemo(() => walk(standardizeX(RAW)), []);

  const targetT = scaling === "standardised" ? 1 : 0;
  const points = scaling === "raw" ? RAW : standardizeX(RAW);
  const { trace, lr, steps } = useMemo(() => (scaling === "raw" ? rawWalk : stdWalk), [scaling, rawWalk, stdWalk]);
  const kappa = useMemo(() => conditionNumber(points), [points]);

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (appliedHandoff.current || !storyFrame) return;
    appliedHandoff.current = true;
    setScaling(storyFrame.scaling);
    setMorphT(storyFrame.scaling === "standardised" ? 1 : 0);
    setHandoffVisible(true);
  }, [storyFrame]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMorphT(targetT);
      return;
    }
    const from = morphT;
    if (Math.abs(from - targetT) < 0.001) return;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / MORPH_MS);
      const eased = 1 - Math.pow(1 - p, 2);
      setMorphT(from + (targetT - from) * eased);
      if (p < 1) morphRaf.current = requestAnimationFrame(tick);
    };
    morphRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(morphRaf.current);
    // morphT captured once per target change — intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetT]);

  const handoffScaling = (next: Scaling) => {
    if (next === scaling) return;
    whenHydrated(() => useLearner.getState().recordPractice("feature-scaling"));
    setScaling(next);
    setCursor(0);
    setPlaying(false);
  };

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
  const isMorphing = Math.abs(morphT - targetT) > 0.02;
  const morphProp = isMorphing
    ? {
        t: morphT,
        fromPoints: RAW,
        toPoints: standardizeX(RAW),
        fromTrace: rawWalk.trace,
        toTrace: stdWalk.trace,
      }
    : undefined;

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
          Continuing from See it — {storyFrame.scaling === "standardised" ? "standardised bowl" : "raw stretched valley"}
        </p>
      )}
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
                onClick={() => handoffScaling(value)}
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
            {isMorphing
              ? "Watch the axes deform — the valley rounds out and the path straightens."
              : scaling === "raw"
                ? "The bowl is stretched, so the biggest safe step is tiny and the walk zig-zags."
                : "Round bowl: one big step points almost at the floor."}
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <LossSurface
            points={points}
            trace={trace}
            cursor={cursor}
            width={720}
            height={560}
            morph={morphProp}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                whenHydrated(() => useLearner.getState().recordPractice("feature-scaling"));
                if (atEnd) setCursor(0);
                setPlaying((p) => !p);
              }}
              disabled={trace.length < 2 || isMorphing}
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
              disabled={trace.length < 2 || isMorphing}
              className="flex-1 accent-[var(--accent)] disabled:opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
