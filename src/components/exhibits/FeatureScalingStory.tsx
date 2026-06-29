"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
 * See-it graphic with ActHandoff: the surface morphs from stretched valley to round
 * bowl when the story beat commits to standardised scaling.
 */
const RAW: Point[] = featureScalingExperiment.datasets[0].points;
const STD: Point[] = standardizeX(RAW);
const MAX_STEPS = 300;
const MORPH_MS = 520;

function walk(points: Point[]): { trace: DescentStep[]; steps: number } {
  const run = createGradientDescent(points, { learningRate: stableLearningRate(points) });
  const floor = mse(points, olsFit(points));
  while (run.current.step < MAX_STEPS && run.current.loss > floor * 1.01 + 1e-9) run.step();
  return { trace: [...run.trace], steps: run.current.step };
}

export function FeatureScalingStory() {
  const frame = useActiveFrame<FeatureScalingFrame>();
  const standardised = frame?.scaling === "standardised";
  const targetT = standardised ? 1 : 0;
  const [morphT, setMorphT] = useState(targetT);
  const morphRaf = useRef(0);

  const rawWalk = useMemo(() => walk(RAW), []);
  const stdWalk = useMemo(() => walk(STD), []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setMorphT(targetT));
      return () => cancelAnimationFrame(id);
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

  const points = standardised ? STD : RAW;
  const { trace, steps } = standardised ? stdWalk : rawWalk;
  const kappa = useMemo(() => conditionNumber(points), [points]);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          {morphT < 0.5 ? "Raw units — a stretched valley" : "Standardised — a round bowl"}
        </span>
      </figcaption>
      <LossSurface
        points={points}
        trace={trace}
        cursor={trace.length - 1}
        width={640}
        height={520}
        morph={{
          t: morphT,
          fromPoints: RAW,
          toPoints: STD,
          fromTrace: rawWalk.trace,
          toTrace: stdWalk.trace,
        }}
      />
      <div className="mt-4">
        <StatGrid
          caption="The walk so far"
          stats={[
            { label: "condition #", value: kappa < 10 ? kappa.toFixed(1) : Math.round(kappa).toString(), hue: "var(--viz-error)", note: "1 is round" },
            { label: "steps to floor", value: steps >= MAX_STEPS ? `${MAX_STEPS}+` : String(steps), hue: "var(--viz-prediction)" },
            { label: <>stable step <span className="normal-case">η</span></>, value: stableLearningRate(points).toFixed(3), hue: "var(--viz-param)" },
          ]}
        />
      </div>
    </figure>
  );
}
