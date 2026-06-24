"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Axes,
  DataPoints,
  FitLine,
  Plot,
  ResidualLines,
  ResidualSquares,
} from "@/components/viz/Plot";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import type { Point } from "@/lib/models/linear-regression";
import { fitUnder, type LossKind } from "@/lib/models/loss-functions";
import { lossFunctionsExperiment } from "@content/exhibits/loss-functions/experiment";

/**
 * The interactive "Break it" lab for loss functions — a live failure loop, not a
 * card. Start on honest data where squared error fits beautifully; drop in three
 * rogue points and watch the squared-error line lurch up to chase them; then switch
 * the judge to absolute or Huber and watch it snap back to the trend. Trigger →
 * symptom → diagnose → repair, with the slope readout giving feedback throughout.
 */
const CLEAN: Point[] = lossFunctionsExperiment.datasets.find((d) => d.id === "clean")!.points;
const ROGUE: Point[] = lossFunctionsExperiment.datasets.find((d) => d.id === "with-outliers")!.points;
const CLEAN_SLOPE = fitUnder("squared", CLEAN).slope;

type Phase = "arming" | "broken" | "repaired";

const JUDGES: { kind: LossKind; label: string }[] = [
  { kind: "squared", label: "Squared" },
  { kind: "absolute", label: "Absolute" },
  { kind: "huber", label: "Huber" },
];

export function LossFunctionsBreakIt() {
  const [dropped, setDropped] = useState(false);
  const [judge, setJudge] = useState<LossKind>("squared");
  const [hasBroken, setHasBroken] = useState(false);

  const points = dropped ? ROGUE : CLEAN;
  const fit = useMemo(() => fitUnder(judge, points), [judge, points]);

  // The squared line on rogue data lurches well past the honest slope — that's the
  // break. A robust judge on the same data is the repair.
  const broken = dropped && judge === "squared" && fit.slope > CLEAN_SLOPE * 1.4;
  const repaired = dropped && judge !== "squared" && fit.slope < CLEAN_SLOPE * 1.25;

  if (broken && !hasBroken) setHasBroken(true);
  useEffect(() => {
    if (hasBroken) reportTaskEvent("loss-functions:outliers-broke-mse");
  }, [hasBroken]);

  const phase: Phase = broken ? "broken" : hasBroken && repaired ? "repaired" : "arming";
  const practiced = () => whenHydrated(() => useLearner.getState().recordPractice("loss-functions"));

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-sunken p-4">
            <button
              type="button"
              onClick={() => {
                practiced();
                setDropped((d) => !d);
              }}
              className="w-full rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              {dropped ? "Remove the rogue points" : "Drop in three rogue points"}
            </button>
            <div role="group" aria-label="Which loss judges the fit" className="inline-flex self-center rounded-full border border-line p-0.5 text-sm">
              {JUDGES.map(({ kind, label }) => (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={judge === kind}
                  onClick={() => {
                    practiced();
                    setJudge(kind);
                  }}
                  className={`rounded-full px-3.5 py-1 transition-colors ${judge === kind ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
                broken ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]" : repaired ? "border-accent text-accent" : "border-line text-ink-faint"
              }`}
            >
              {broken ? "Pulled off true" : repaired ? "Holds the trend" : "Honest fit"}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              slope {fit.slope.toFixed(2)} · honest ≈ {CLEAN_SLOPE.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={640}
            height={460}
            xDomain={[-1, 11]}
            yDomain={[-6, 40]}
            ariaLabel={`A line fitted under ${judge} error to ${dropped ? "data with three rogue points" : "honest data"}; slope ${fit.slope.toFixed(2)} versus the honest ${CLEAN_SLOPE.toFixed(2)}. ${broken ? "The squared-error line has lurched up to chase the rogue points." : repaired ? "The robust line holds the trend the bulk of the data votes for." : "The fit tracks the data."}`}
          >
            <Axes />
            {judge === "squared" ? (
              <ResidualSquares points={points} params={fit} />
            ) : (
              <ResidualLines points={points} params={fit} />
            )}
            <FitLine params={fit} />
            <DataPoints points={points} />
          </Plot>
        </div>
      </div>
    </div>
  );
}

function Guidance({ phase }: { phase: Phase }) {
  if (phase === "broken") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
        <p className="mt-2 leading-relaxed text-ink">
          Three points moved, and the whole line <span className="font-medium text-[var(--viz-error-ink)]">lurched</span> up to chase
          them — abandoning the trend the other points agree on.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> squared error grows
          with the <em>square</em> of each miss, so a handful of far points can outvote
          a crowd of honest ones. <span className="font-medium text-ink">Repair:</span>{" "}
          switch the judge to absolute or Huber and watch the line snap back.
        </p>
      </div>
    );
  }
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          Same rogue points, but absolute and Huber error weight every miss by its size
          alone — so three loud votes can&apos;t drown out twenty-seven quiet ones. The
          line holds the trend.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> if those rogue points
          were real signal — not data-entry errors — ignoring them would be the mistake.
          Robust losses assume the extremes are noise; check that they are.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Trigger · break it on purpose</p>
      <p className="mt-2 leading-relaxed text-ink">
        On honest data the squared-error line fits beautifully. Now drop in three rogue
        points and watch what the line does — does it hold the trend, or chase the
        newcomers?
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Predict first: how far will three points out of thirty drag a line that twenty-seven
        others are pinning down?
      </p>
    </div>
  );
}
