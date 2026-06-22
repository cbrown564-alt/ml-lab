"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPoints, FitLine, Plot } from "@/components/viz/Plot";
import { olsFit } from "@/lib/models/linear-regression";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";

/**
 * The specimen hero — the first frame of the Linear Regression exhibit. A wide,
 * quiet "specimen under glass": the same truth-hued cloud and prediction-hued
 * line as the working plot below, stripped to a portrait — no axes, no readouts,
 * no controls. On load the line eases up from the flat baseline (predict the
 * mean ȳ for everyone) and pivots into the line of best fit, settling on the
 * data's centre of mass — the pivot least-squares always passes through. Motion
 * is the lab's sanctioned `--motion-move`; under reduced motion it renders
 * already settled. The specimen leads the masthead so the learner meets the
 * living object before reading its catalogue tag.
 */

const SPECIMEN = linearRegressionExperiment.datasets.find(
  (d) => d.id === "clean-linear",
)!.points;

// The baseline guess before the data has any say: a flat line at the mean ȳ.
const FLAT = {
  slope: 0,
  intercept: SPECIMEN.reduce((s, p) => s + p.y, 0) / SPECIMEN.length,
};

export function LinearRegressionHero() {
  const fit = useMemo(() => olsFit(SPECIMEN), []);
  const [settled, setSettled] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // No journey to watch — rest on the fit straight away.
      const id = requestAnimationFrame(() => setSettled(true));
      return () => cancelAnimationFrame(id);
    }
    // Let the flat baseline paint once, then arm the ease and let the cloud
    // pull the line into its fit a beat later.
    let timer = 0;
    const id = requestAnimationFrame(() => {
      setAnimate(true);
      timer = window.setTimeout(() => setSettled(true), 260);
    });
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The line of best fit
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          30 observations
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <Plot
          width={1200}
          height={300}
          // Generous matte: the cloud rests in the middle of the frame with sky
          // above and floor below, so it reads as a composed specimen, not a
          // chart line jammed corner to corner. The wide-short frame also calms
          // the slope to a gentle rise.
          xDomain={[-0.8, 10.8]}
          yDomain={[-7, 33]}
          ariaLabel="Thirty observations scattered along a gentle upward trend, with the least-squares line — the single straight line that makes its total squared miss as small as possible — coming to rest on the data."
        >
          <DataPoints points={SPECIMEN} />
          <FitLine params={settled ? fit : FLAT} ease={animate} />
        </Plot>
      </div>
    </figure>
  );
}
