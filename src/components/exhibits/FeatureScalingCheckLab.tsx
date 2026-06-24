"use client";

import { useMemo, useState } from "react";
import { LossSurface } from "@/components/viz/LossSurface";
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
 * The Explain-it companion: a compact live bowl pinned beside the checks, so the
 * learner answers against the running surface. Toggle raw ↔ standardised and watch
 * the bowl round out, the condition number drop, and the walk shorten.
 */
const RAW: Point[] = featureScalingExperiment.datasets[0].points;
const MAX_STEPS = 300;

function walk(points: Point[]): { trace: DescentStep[]; steps: number } {
  const run = createGradientDescent(points, { learningRate: stableLearningRate(points) });
  const floor = mse(points, olsFit(points));
  while (run.current.step < MAX_STEPS && run.current.loss > floor * 1.01 + 1e-9) run.step();
  return { trace: [...run.trace], steps: run.current.step };
}

export function FeatureScalingCheckLab() {
  const [scaled, setScaled] = useState(false);
  const points = useMemo(() => (scaled ? standardizeX(RAW) : RAW), [scaled]);
  const { trace, steps } = useMemo(() => walk(points), [points]);
  const kappa = conditionNumber(points);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the bowl</span>
      </figcaption>
      <div role="group" aria-label="Whether the input is scaled" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-sm">
        {([["raw", false], ["standardised", true]] as const).map(([label, value]) => (
          <button
            key={label}
            type="button"
            aria-pressed={scaled === value}
            onClick={() => setScaled(value)}
            className={`rounded-full px-3 py-0.5 capitalize transition-colors ${scaled === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <LossSurface points={points} trace={trace} cursor={trace.length - 1} width={380} height={320} />
      <p className="mt-3 font-mono text-xs text-ink-faint tabular-nums">
        condition # {kappa < 10 ? kappa.toFixed(1) : Math.round(kappa)} · {steps >= MAX_STEPS ? `${MAX_STEPS}+` : steps} steps to the floor
      </p>
    </figure>
  );
}
