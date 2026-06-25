"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorSpreadStrip } from "@/components/exhibits/ErrorSpreadStrip";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { kFoldCV, p10p90Spread, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE, TT_LAMBDA } from "@content/exhibits/train-test-generalization/experiment";

/**
 * The interactive "Break it" lab for train/test generalisation. Shrink the holdout to a
 * handful of points and a single split becomes a coin flip: across many random splits
 * the test error spreads wide. Enlarge the holdout — a less noisy measurement — and the
 * distribution collapses to a tall spike, while the cross-validation estimate sits fixed.
 * Trigger → symptom → diagnose → repair: never judge a model on one small split. (The
 * model is lightly ridged so a starved fit can't explode; the spread is the robust
 * P10–P90 range, so the lesson is monotone — bigger holdout, tighter spread.)
 */
const N = pooledPoints.length;
const SEEDS = Array.from({ length: 28 }, (_, i) => i + 1);
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1, TT_LAMBDA).meanErr;
const AXIS_MAX = 0.3;
const SPREAD_HI = 0.08; // above this the score is a coin flip
const SPREAD_LO = 0.05; // below this it's stable enough to trust

type Phase = "broken" | "repaired";

export function TrainTestBreakIt() {
  const [testSize, setTestSize] = useState(4);
  const [hasSeenLottery, setHasSeenLottery] = useState(false);

  const errs = useMemo(
    () => SEEDS.map((s) => scoreSplit(splitPoints(pooledPoints, testSize / N, s), TT_DEGREE, TT_LAMBDA).testErr),
    [testSize],
  );
  const spread = p10p90Spread(errs);

  const broken = spread > SPREAD_HI;
  if (broken && !hasSeenLottery) setHasSeenLottery(true);
  useEffect(() => {
    if (hasSeenLottery) reportTaskEvent("train-test:single-split-lottery");
  }, [hasSeenLottery]);
  const repaired = hasSeenLottery && spread < SPREAD_LO;
  const phase: Phase = broken ? "broken" : repaired ? "repaired" : "broken";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="rounded-lg border border-line bg-sunken p-4">
            <label className="flex items-center justify-between text-sm text-ink-muted">
              <span>Held-out points</span>
              <span className="font-mono tabular-nums text-ink">{testSize} of {N}</span>
            </label>
            <input
              type="range"
              aria-label="Number of held-out validation points"
              min={3}
              max={20}
              step={1}
              value={testSize}
              onChange={(e) => {
                whenHydrated(() => useLearner.getState().recordPractice("train-test-generalization"));
                setTestSize(Number(e.target.value));
              }}
              className="mt-2 w-full accent-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
                broken ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]" : repaired ? "border-accent text-accent" : "border-line text-ink-faint"
              }`}
            >
              {broken ? "A coin-flip score" : repaired ? "Stable enough to trust" : "Settling down"}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">spread {spread.toFixed(3)}</span>
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <ErrorSpreadStrip
            errs={errs}
            axisMax={AXIS_MAX}
            marks={[{ value: CV, label: "5-fold CV", color: "var(--accent)" }]}
            width={620}
            height={180}
          />
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">
            The blue histogram is the validation error from {SEEDS.length} random splits at this
            holdout size. With a tiny holdout it sprawls wide; enlarge it and the splits
            agree, collapsing to a tall spike — while the cross-validation mark holds steady.
          </p>
        </div>
      </div>
    </div>
  );
}

function Guidance({ phase }: { phase: Phase }) {
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          Enlarge the holdout and the histogram <span className="font-medium text-accent">collapses to a spike</span> — a bigger validation
          set is a less noisy sample, so the score you read off any one split is close to
          the truth. And the cross-validation mark was steady the whole time.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> a bigger holdout costs you
          training data, which can hurt the model itself — cross-validation sidesteps the
          trade by reusing every point for both, which is why it&apos;s the default.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
      <p className="mt-2 leading-relaxed text-ink">
        Hold out just a handful of points and a single split&apos;s validation error is a{" "}
        <span className="font-medium text-[var(--viz-error-ink)]">coin flip</span> — across random splits the histogram sprawls from
        near-zero to large, for the very same model.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Diagnose:</span> a small validation set is a tiny,
        noisy sample of the model&apos;s skill, so any one number off it is mostly luck.{" "}
        <span className="font-medium text-ink">Repair:</span> enlarge the holdout, or read the
        cross-validation estimate that barely moves.
      </p>
    </div>
  );
}
