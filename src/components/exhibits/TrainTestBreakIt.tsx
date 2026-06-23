"use client";

import { useEffect, useMemo, useState } from "react";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { kFoldCV, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE } from "@content/exhibits/train-test-generalization/experiment";

/**
 * The interactive "Break it" lab for train/test generalisation. Shrink the holdout to a
 * handful of points and a single split becomes a coin flip: across many random splits
 * the test error swings from near-zero ("great model, ship it!") to enormous. Enlarge
 * the holdout — or read the cross-validation estimate — and the spread collapses to a
 * number you can trust. Trigger → symptom → diagnose → repair: never judge a model on
 * one small split.
 */
const N = pooledPoints.length;
const SEEDS = Array.from({ length: 28 }, (_, i) => i + 1);
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1).meanErr;

type Phase = "broken" | "repaired";

function SpreadStrip({ errs }: { errs: number[] }) {
  const W = 600;
  const H = 96;
  const m = { l: 14, r: 14, t: 28, b: 22 };
  const hi = Math.max(0.05, ...errs, CV) * 1.2;
  const x = (e: number) => m.l + (Math.min(e, hi) / hi) * (W - m.l - m.r);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Test error from ${errs.length} random splits at this holdout size; the cross-validation estimate is marked.`} className="h-auto w-full">
      <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="var(--line)" />
      {errs.map((e, i) => (
        <circle key={i} cx={x(e)} cy={H - m.b - 12} r={4.5} fill="var(--viz-prediction)" fillOpacity={0.4} />
      ))}
      <line x1={x(CV)} x2={x(CV)} y1={m.t - 6} y2={H - m.b} stroke="var(--accent)" strokeWidth={2.5} />
      <text x={x(CV)} y={m.t - 10} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--accent)">5-fold CV</text>
      <text x={m.l} y={H - 6} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">0</text>
      <text x={W - m.r} y={H - 6} textAnchor="end" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">higher error →</text>
    </svg>
  );
}

export function TrainTestBreakIt() {
  const [testSize, setTestSize] = useState(3);
  const [hasSeenLottery, setHasSeenLottery] = useState(false);

  const errs = useMemo(
    () => SEEDS.map((s) => scoreSplit(splitPoints(pooledPoints, testSize / N, s), TT_DEGREE).testErr),
    [testSize],
  );
  const spread = Math.max(...errs) - Math.min(...errs);

  const broken = testSize <= 4;
  if (broken && !hasSeenLottery) setHasSeenLottery(true);
  useEffect(() => {
    if (hasSeenLottery) reportTaskEvent("train-test:single-split-lottery");
  }, [hasSeenLottery]);
  const repaired = hasSeenLottery && testSize >= 9;
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
              aria-label="Number of held-out test points"
              min={2}
              max={16}
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
            <span className="font-mono text-xs text-ink-faint tabular-nums">spread {spread.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <SpreadStrip errs={errs} />
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">
            Each blue dot is the test error from one random split at this holdout size.
            With a tiny holdout they sprawl from near-zero to huge — but the cross-validation
            mark stays put no matter how few points you hold out.
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
          Enlarge the holdout and the dots <span className="font-medium text-accent">pull together</span> — a bigger test set is a
          less noisy sample, so the score you read off any one split is closer to the truth.
          And the cross-validation mark was steady the whole time.
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
        Hold out just a handful of points and a single split&apos;s test error is a{" "}
        <span className="font-medium text-[var(--viz-error-ink)]">coin flip</span> — across random splits it ranges from near-zero
        (&ldquo;great model, ship it!&rdquo;) to enormous, for the very same model.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Diagnose:</span> a small test set is a tiny,
        noisy sample of the model&apos;s skill, so any one number off it is mostly luck.{" "}
        <span className="font-medium text-ink">Repair:</span> enlarge the holdout, or read the
        cross-validation estimate that barely moves.
      </p>
    </div>
  );
}
