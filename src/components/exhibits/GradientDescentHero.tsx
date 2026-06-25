"use client";

import { useMemo } from "react";
import { GradientDescentMicroscope } from "@/components/exhibits/GradientDescentMicroscope";
import { createGradientDescent } from "@/lib/models/linear-regression";
import { gradientDescentExperiment } from "@content/exhibits/gradient-descent/experiment";

/**
 * The specimen hero — one frozen gradient-descent update under the microscope:
 * gradient components, scaled step, parameter delta, and loss change. The anatomy
 * of a single downhill stride, not the whole path at once.
 */

const SPECIMEN = gradientDescentExperiment.datasets.find((d) => d.id === "gd-zigzag")!.points;
const LR = 0.05;
/** A mid-descent step with visible gradient and loss drop — reads clearly in the frame. */
const FOCUS_STEP = 12;

export function GradientDescentHero() {
  const pair = useMemo(() => {
    const run = createGradientDescent(SPECIMEN, { learningRate: LR });
    run.run(FOCUS_STEP + 1);
    const trace = [...run.trace];
    return { before: trace[FOCUS_STEP], after: trace[FOCUS_STEP + 1] };
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          One update
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          θ ← θ − α · ∇L(θ)
        </span>
      </figcaption>
      <div className="px-3 py-3">
        <GradientDescentMicroscope
          before={pair.before}
          after={pair.after}
          learningRate={LR}
          reveal
        />
      </div>
    </figure>
  );
}
