"use client";

import { useMemo } from "react";
import { LossSurface } from "@/components/viz/LossSurface";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { FeatureScalingFrame } from "@content/exhibits/feature-scaling/spine";
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
 * The See-it graphic: the loss surface the descent must cross, drawn for the
 * version of the input the active beat asserts (raw → standardised at the reveal).
 * The full descent path is shown so the zig-zag-vs-straight contrast reads at a
 * glance; the bench has the transport.
 */
const RAW: Point[] = featureScalingExperiment.datasets[0].points;
const MAX_STEPS = 300;

function walk(points: Point[]): { trace: DescentStep[]; steps: number } {
  const run = createGradientDescent(points, { learningRate: stableLearningRate(points) });
  const floor = mse(points, olsFit(points));
  while (run.current.step < MAX_STEPS && run.current.loss > floor * 1.01 + 1e-9) run.step();
  return { trace: [...run.trace], steps: run.current.step };
}

export function FeatureScalingStory() {
  const frame = useActiveFrame<FeatureScalingFrame>();
  const standardised = frame?.scaling === "standardised";
  const points = useMemo(() => (standardised ? standardizeX(RAW) : RAW), [standardised]);
  const { trace, steps } = useMemo(() => walk(points), [points]);
  const kappa = useMemo(() => conditionNumber(points), [points]);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          {standardised ? "Standardised — a round bowl" : "Raw units — a stretched valley"}
        </span>
      </figcaption>
      <LossSurface points={points} trace={trace} cursor={trace.length - 1} width={640} height={520} />
      <div className="mt-4">
        <StatGrid
          caption="The walk so far"
          stats={[
            { label: "condition #", value: kappa < 10 ? kappa.toFixed(1) : Math.round(kappa).toString(), hue: "var(--viz-error)", note: "1 is round" },
            { label: "steps to floor", value: steps >= MAX_STEPS ? `${MAX_STEPS}+` : String(steps), hue: "var(--viz-prediction)" },
            { label: "stable step η", value: stableLearningRate(points).toFixed(3), hue: "var(--viz-param)" },
          ]}
        />
      </div>
    </figure>
  );
}
