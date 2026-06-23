"use client";

import { useEffect, useMemo, useState } from "react";
import { LossSurface } from "@/components/viz/LossSurface";
import { createGradientDescent } from "@/lib/models/linear-regression";
import { gradientDescentExperiment } from "@content/exhibits/gradient-descent/experiment";

/**
 * The specimen hero — the first frame of the Gradient Descent exhibit. The loss
 * surface is the specimen: a topographic map where every point is a candidate
 * line and the shade is its loss. On load the purple descent path draws itself
 * from the flat line that knows nothing (slope 0, intercept 0 — high on the bowl
 * wall), zigzagging up the elongated valley and **settling exactly on the bright
 * minimum (the ×)**. So the mechanism is the picture: "downhill until you hit the
 * floor." Reduced motion renders it already at rest. A portrait: the working axes
 * are stripped, but the start / minimum / loss-legend stay, so the learner reads
 * the walk without the surrounding prose.
 */

const SPECIMEN = gradientDescentExperiment.datasets.find(
  (d) => d.id === "gd-zigzag",
)!.points;

// The flat line (slope 0, intercept 0) — the exhibit's own start, low on the
// surface. LR + steps tuned against the model so the walk traverses the full frame
// and the final iterate lands ON the minimum (~0.02 away) rather than stalling
// short of it (the old 60 steps stopped ~0.8 out — the descent looked like it
// missed). Dots subsample to ~64 for the trail; the bunching near the floor is the
// self-throttling the walk is named for.
const STEPS = 220;
const DURATION = 1400;

export function GradientDescentHero() {
  const trace = useMemo(() => {
    const run = createGradientDescent(SPECIMEN, { learningRate: 0.05 });
    run.run(STEPS);
    return [...run.trace];
  }, []);
  const last = trace.length - 1;
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // Rest at the valley straight away.
      const id = requestAnimationFrame(() => setCursor(last));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / DURATION);
      // Ease-out: the big strides land crisply up front, then the dot inches onto
      // the valley floor — the descent's own deceleration.
      const eased = 1 - Math.pow(1 - p, 3);
      setCursor(Math.round(eased * last));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [last]);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The loss surface
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          every point is a line
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <LossSurface
          points={SPECIMEN}
          trace={trace.slice(0, cursor + 1)}
          cursor={cursor}
          width={1200}
          height={420}
          bare
        />
      </div>
    </figure>
  );
}
