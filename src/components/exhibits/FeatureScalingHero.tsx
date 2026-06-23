"use client";

import { useEffect, useMemo, useState } from "react";
import { LossSurface } from "@/components/viz/LossSurface";
import {
  createGradientDescent,
  mse,
  olsFit,
  type DescentStep,
  type Point,
} from "@/lib/models/linear-regression";
import { stableLearningRate, standardizeX } from "@/lib/models/conditioning";
import { featureScalingExperiment } from "@content/exhibits/feature-scaling/experiment";

/**
 * The specimen hero — the whole point of feature scaling, as a before/after. The
 * SAME data, two shapes of loss surface: in raw units the valley is stretched, so
 * gradient descent zig-zags for many steps; standardised, the bowl is round and the
 * walk drops almost straight to the floor in a handful. Both descents draw in on
 * load so the long zig-zag vs the short fall reads at a glance. Reduced motion
 * renders both already walked.
 */

const RAW: Point[] = featureScalingExperiment.datasets[0].points;
const STD: Point[] = standardizeX(RAW);
const MAX_STEPS = 300;

function walk(points: Point[]): DescentStep[] {
  const run = createGradientDescent(points, { learningRate: stableLearningRate(points) });
  const floor = mse(points, olsFit(points));
  while (run.current.step < MAX_STEPS && run.current.loss > floor * 1.01 + 1e-9) run.step();
  return [...run.trace];
}

const RAW_TRACE = walk(RAW);
const STD_TRACE = walk(STD);

function Panel({
  kicker,
  steps,
  points,
  trace,
  cursor,
  legend,
}: {
  kicker: string;
  steps: number;
  points: Point[];
  trace: DescentStep[];
  cursor: number;
  legend: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-3 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</span>
        <span className="font-mono text-[11px] text-ink-muted tabular-nums">{steps} steps</span>
      </div>
      <LossSurface
        points={points}
        trace={trace.slice(0, cursor + 1)}
        cursor={cursor}
        width={560}
        height={400}
        bare
        legend={legend}
      />
    </div>
  );
}

export function FeatureScalingHero() {
  const [p, setP] = useState(0);
  const rawLast = RAW_TRACE.length - 1;
  const stdLast = STD_TRACE.length - 1;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setP(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const DURATION = 1300;
    const tick = (now: number) => {
      if (!start) start = now;
      const prog = Math.min(1, (now - start) / DURATION);
      setP(1 - Math.pow(1 - prog, 3));
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 340);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, []);

  const rawCursor = useMemo(() => Math.round(p * rawLast), [p, rawLast]);
  const stdCursor = useMemo(() => Math.round(p * stdLast), [p, stdLast]);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Feature scaling
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          same data, two shapes
        </span>
      </figcaption>
      <div
        className="flex flex-col gap-4 px-3 py-3 sm:flex-row"
        role="img"
        aria-label={`Two loss surfaces for the same regression problem. In raw units the valley is stretched and gradient descent zig-zags for ${rawLast} steps to reach the floor; with the feature standardised the bowl is round and the descent reaches the floor in ${stdLast} steps.`}
      >
        <Panel kicker="raw units — a stretched valley" steps={rawLast} points={RAW} trace={RAW_TRACE} cursor={rawCursor} legend />
        <Panel kicker="standardised — a round bowl" steps={stdLast} points={STD} trace={STD_TRACE} cursor={stdCursor} legend={false} />
      </div>
    </figure>
  );
}
