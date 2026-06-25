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
 * The specimen hero — one loss surface that morphs from a stretched valley to a
 * round bowl while the descent path straightens. Same data, axis deformation:
 * standardising rounds the bowl and the walk drops almost straight to the floor.
 */

const RAW: Point[] = featureScalingExperiment.datasets[0].points;
const STD: Point[] = standardizeX(RAW);
const MAX_STEPS = 300;
const DURATION = 1500;

function walk(points: Point[]): DescentStep[] {
  const run = createGradientDescent(points, { learningRate: stableLearningRate(points) });
  const floor = mse(points, olsFit(points));
  while (run.current.step < MAX_STEPS && run.current.loss > floor * 1.01 + 1e-9) run.step();
  return [...run.trace];
}

const RAW_TRACE = walk(RAW);
const STD_TRACE = walk(STD);
const RAW_STEPS = RAW_TRACE.length - 1;
const STD_STEPS = STD_TRACE.length - 1;

export function FeatureScalingHero() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setT(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / DURATION);
      setT(1 - Math.pow(1 - p, 2.5));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 340);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, []);

  const steps = useMemo(
    () => Math.round(RAW_STEPS + (STD_STEPS - RAW_STEPS) * t),
    [t],
  );

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Feature scaling
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          {t < 0.5 ? "stretched valley" : "round bowl"} · {steps} steps
        </span>
      </figcaption>
      <div
        className="px-3 py-2"
        role="img"
        aria-label={`Loss surface morphing from a stretched valley (${RAW_STEPS} zig-zagging steps) to a round bowl (${STD_STEPS} steps) as the input is standardised.`}
      >
        <LossSurface
          points={RAW}
          trace={RAW_TRACE}
          cursor={RAW_TRACE.length - 1}
          width={1200}
          height={420}
          bare
          morph={{
            t,
            fromPoints: RAW,
            toPoints: STD,
            fromTrace: RAW_TRACE,
            toTrace: STD_TRACE,
          }}
        />
      </div>
    </figure>
  );
}
