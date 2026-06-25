"use client";

import { useMemo, useState } from "react";
import {
  Annotation,
  Axes,
  DataPoints,
  FitLine,
  Plot,
  ResidualSquares,
} from "@/components/viz/Plot";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { mse, olsFit, type Point } from "@/lib/models/linear-regression";
import { linearRegressionExperiment } from "@content/exhibits/linear-regression/experiment";

/**
 * The interactive "Break it" lab for linear regression — the differentiating act.
 * Not a card of caveats: a live failure loop. Start from an honest fit, then
 * sabotage it by your own hand — drag one point far from the trend and watch the
 * whole line lurch after it, the penalty square ballooning. Name the cause, then
 * repair it (drag it home, or evict it) and watch the line snap back. Confront,
 * diagnose, repair, with the squares giving feedback the whole way.
 */

const CLEAN = linearRegressionExperiment.datasets.find((d) => d.id === "clean-linear")!.points;
const X_DOMAIN: [number, number] = [-1, 11];
const Y_DOMAIN: [number, number] = [-12, 40];
const BREAK_RESIDUAL = 9; // a miss this large counts as "broken"
const CALM_RESIDUAL = 3.5; // back under this is "repaired"

type Phase = "arming" | "broken" | "repaired";

export function LinearRegressionBreakIt() {
  const [points, setPoints] = useState<Point[]>(() => CLEAN.map((p) => ({ ...p })));
  const [hasBroken, setHasBroken] = useState(false);

  const { fit, loss, worst, worstPoint } = useMemo(() => {
    const fit = olsFit(points);
    let worst = 0;
    let worstPoint: Point | null = null;
    for (const p of points) {
      const r = Math.abs(p.y - (fit.slope * p.x + fit.intercept));
      if (r > worst) {
        worst = r;
        worstPoint = p;
      }
    }
    return { fit, loss: mse(points, fit), worst, worstPoint };
  }, [points]);

  // Latch the failure (adjust state during render — no effect-time setState).
  // Practice is already recorded as the learner drags; the worst-residual gate
  // decides when the fit counts as wrecked vs recovered.
  const brokenNow = worst >= BREAK_RESIDUAL;
  if (brokenNow && !hasBroken) setHasBroken(true);
  const phase: Phase = brokenNow ? "broken" : hasBroken && worst <= CALM_RESIDUAL ? "repaired" : "arming";

  const move = (i: number, p: Point) => setPoints((prev) => prev.map((q, j) => (j === i ? p : q)));
  const snapBack = () => setPoints(CLEAN.map((p) => ({ ...p })));

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <button
            type="button"
            onClick={snapBack}
            className="self-start rounded-full border border-accent px-5 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-ink"
          >
            Snap it back to the crowd
          </button>

          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
                brokenNow
                  ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]"
                  : hasBroken && phase === "repaired"
                    ? "border-accent text-accent"
                    : "border-line text-ink-faint"
              }`}
            >
              {brokenNow ? "Fit wrecked" : phase === "repaired" ? "Recovered" : "Honest fit"}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              MSE {loss.toFixed(2)} · worst miss {worst.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={640}
            height={520}
            xDomain={X_DOMAIN}
            yDomain={Y_DOMAIN}
            interactive
            ariaLabel={`Scatter plot with the least-squares line. Mean squared error ${loss.toFixed(2)}; the largest miss is ${worst.toFixed(1)}. ${brokenNow ? "One point has wrenched the line off the trend." : "Drag a point far from the line to wreck the fit."} Drag any point to move it.`}
          >
            <Axes />
            <ResidualSquares points={points} params={fit} />
            <FitLine params={fit} />
            {worstPoint && worst >= BREAK_RESIDUAL && (
              <Annotation
                at={worstPoint}
                dx={worstPoint.x > 8 ? -16 : 16}
                dy={-16}
                label="this one square costs as much as the crowd"
                color="var(--viz-error)"
              />
            )}
            <DataPoints
              points={points}
              onChange={(i, p) => {
                whenHydrated(() => useLearner.getState().recordPractice("linear-regression"));
                move(i, p);
              }}
            />
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
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">
          Symptom · it broke
        </p>
        <p className="mt-2 leading-relaxed text-ink">
          One point now <span className="font-medium text-[var(--viz-error-ink)]">dominates</span>.
          The line has abandoned the crowd to chase it, and its penalty square
          dwarfs every other.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> squared error
          penalises a miss by its <em>square</em>, so a single far point outvotes the
          many. <span className="font-medium text-ink">Repair:</span> drag it back to
          the trend, or snap the cloud back.
        </p>
      </div>
    );
  }
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
          Repaired ✓
        </p>
        <p className="mt-2 leading-relaxed text-ink">
          Back near the crowd, the line settles where the bulk of the data wants it —
          the squares shrink, the MSE drops, the tyranny ends.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> before you delete an
          outlier in real work, look twice — sometimes the rogue point <em>is</em> the
          discovery (fraud, a rare event). Robustify only once you know it&apos;s noise.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
        Trigger · break it on purpose
      </p>
      <p className="mt-2 leading-relaxed text-ink">
        This is an honest fit — every point near the line. Now sabotage it: grab any
        point and drag it far from the trend.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Predict first: how far must one point stray before the whole line lurches
        after it? Then watch its penalty{" "}
        <span className="font-medium text-[var(--viz-error-ink)]">square</span> balloon.
      </p>
    </div>
  );
}
