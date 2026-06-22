"use client";

import { useMemo, useState } from "react";
import {
  Axes,
  DataPoints,
  FitLine,
  Plot,
  ResidualSquares,
} from "@/components/viz/Plot";
import { mse, olsFit, type Point } from "@/lib/models/linear-regression";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";

/**
 * The Explain-it companion: a compact live model pinned beside the checks, so the
 * learner answers against the live squares — not from memory — and the act's canvas
 * is composed rather than a void (the panel's highest-leverage register fix). Drag a
 * point and the line and its squared penalties respond; the readout tracks the MSE.
 */

const CLEAN = linearRegressionExperiment.datasets.find((d) => d.id === "clean-linear")!.points;

export function LinearRegressionCheckLab() {
  const [points, setPoints] = useState<Point[]>(() => CLEAN.map((p) => ({ ...p })));
  const fit = useMemo(() => olsFit(points), [points]);
  const loss = useMemo(() => mse(points, fit), [points, fit]);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Answer against the live model
        </span>
        <button
          type="button"
          onClick={() => setPoints(CLEAN.map((p) => ({ ...p })))}
          className="text-xs text-ink-faint transition-colors hover:text-ink-muted"
        >
          reset
        </button>
      </figcaption>
      <Plot
        width={380}
        height={300}
        xDomain={[-1, 11]}
        yDomain={[-12, 40]}
        interactive
        ariaLabel={`A live least-squares model; mean squared error ${loss.toFixed(2)}. Drag any point and the line and its squared penalties answer.`}
      >
        <Axes />
        <ResidualSquares points={points} params={fit} />
        <FitLine params={fit} />
        <DataPoints
          points={points}
          onChange={(i, p) => setPoints((prev) => prev.map((q, j) => (j === i ? p : q)))}
        />
      </Plot>
      <p className="mt-3 font-mono text-xs text-ink-faint tabular-nums">
        slope {fit.slope.toFixed(2)} · MSE {loss.toFixed(2)} — drag a point, watch the squares
      </p>
    </figure>
  );
}
