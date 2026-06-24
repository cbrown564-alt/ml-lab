"use client";

import { useMemo, useState } from "react";
import {
  Axes,
  DataPoints,
  FitLine,
  Plot,
  ResidualLines,
  ResidualSquares,
} from "@/components/viz/Plot";
import type { Point } from "@/lib/models/linear-regression";
import { fitUnder, type LossKind } from "@/lib/models/loss-functions";
import { lossFunctionsExperiment } from "@content/exhibits/loss-functions/experiment";

/**
 * The Explain-it companion: a compact live model pinned beside the checks, so the
 * learner answers against the running judges — not from memory. Toggle the loss and
 * drag the rogue points; the line and the slope readout respond.
 */
const ROGUE: Point[] = lossFunctionsExperiment.datasets.find((d) => d.id === "with-outliers")!.points;
const JUDGES: { kind: LossKind; label: string }[] = [
  { kind: "squared", label: "Squared" },
  { kind: "absolute", label: "Absolute" },
  { kind: "huber", label: "Huber" },
];

export function LossFunctionsCheckLab() {
  const [points, setPoints] = useState<Point[]>(() => ROGUE.map((p) => ({ ...p })));
  const [judge, setJudge] = useState<LossKind>("squared");
  const fit = useMemo(() => fitUnder(judge, points), [judge, points]);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">Answer against the judges</span>
        <button
          type="button"
          onClick={() => setPoints(ROGUE.map((p) => ({ ...p })))}
          className="text-xs text-ink-faint transition-colors hover:text-ink-muted"
        >
          reset
        </button>
      </figcaption>
      <div role="group" aria-label="Which loss judges the fit" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-sm">
        {JUDGES.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            aria-pressed={judge === kind}
            onClick={() => setJudge(kind)}
            className={`rounded-full px-3 py-0.5 transition-colors ${judge === kind ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <Plot
        width={380}
        height={300}
        xDomain={[-1, 11]}
        yDomain={[-6, 40]}
        interactive
        ariaLabel={`A live fit under ${judge} error; slope ${fit.slope.toFixed(2)}. Toggle the judge or drag a rogue point and the line answers.`}
      >
        <Axes />
        {judge === "squared" ? (
          <ResidualSquares points={points} params={fit} />
        ) : (
          <ResidualLines points={points} params={fit} />
        )}
        <FitLine params={fit} />
        <DataPoints points={points} onChange={(i, p) => setPoints((prev) => prev.map((q, j) => (j === i ? p : q)))} />
      </Plot>
      <p className="mt-3 font-mono text-xs text-ink-faint tabular-nums">
        {judge} · slope {fit.slope.toFixed(2)} — toggle the judge, drag a rogue point
      </p>
    </figure>
  );
}
