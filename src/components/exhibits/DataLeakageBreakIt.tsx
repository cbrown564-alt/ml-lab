"use client";

import { useEffect, useMemo, useState } from "react";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { crossValR2, type HeldOut, type Matrix } from "@/lib/models/leakage";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * The interactive "Break it" lab for data leakage. The learner takes the tempting
 * shortcut — select the best features using all the data, then cross-validate — and
 * watches pure noise manufacture a confident R². The break here looks like success,
 * which is the whole danger. Move the selection inside each fold and the score
 * collapses to the truth. Trigger → symptom → diagnose → repair.
 */
const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;

type Phase = "arming" | "broken" | "repaired";

function Scatter({ points }: { points: HeldOut[] }) {
  const W = 340;
  const H = 340;
  const m = 30;
  const ext = 2.8;
  const sx = (v: number) => m + ((v + ext) / (2 * ext)) * (W - 2 * m);
  const sy = (v: number) => H - m - ((v + ext) / (2 * ext)) * (H - 2 * m);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Predicted versus actual for the held-out points; a real model hugs the diagonal, pure noise scatters off it." className="h-auto w-full max-w-[360px]">
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} fill="none" stroke="var(--line)" />
      <line x1={sx(-ext)} y1={sy(-ext)} x2={sx(ext)} y2={sy(ext)} stroke="var(--ink-faint)" strokeDasharray="4 4" />
      <text x={sx(ext) - 4} y={sy(ext) + 14} textAnchor="end" fontSize={11} fill="var(--ink-faint)" fontStyle="italic">predicted = actual</text>
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.actual)} cy={sy(Math.max(-ext, Math.min(ext, p.predicted)))} r={4} fill="var(--viz-param)" fillOpacity={0.65} />
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--ink-faint)" fontFamily="var(--font-mono)">actual target →</text>
    </svg>
  );
}

export function DataLeakageBreakIt() {
  const [leaky, setLeaky] = useState(false);
  const [hasBroken, setHasBroken] = useState(false);
  const result = useMemo(() => crossValR2(X, Y, K, FOLDS, leaky), [leaky]);

  if (leaky && !hasBroken) setHasBroken(true);
  useEffect(() => {
    if (hasBroken) reportTaskEvent("data-leakage:leaked");
  }, [hasBroken]);
  const phase: Phase = leaky ? "broken" : hasBroken ? "repaired" : "arming";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-sunken p-4">
            <div role="group" aria-label="Where feature selection happens" className="inline-flex self-center rounded-full border border-line p-0.5 text-sm">
              {([["Select inside each fold", false], ["Select on all data", true]] as const).map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={leaky === value}
                  onClick={() => {
                    whenHydrated(() => useLearner.getState().recordPractice("data-leakage"));
                    setLeaky(value);
                  }}
                  className={`rounded-full px-3.5 py-1 transition-colors ${leaky === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
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
                leaky ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]" : hasBroken ? "border-accent text-accent" : "border-line text-ink-faint"
              }`}
            >
              {leaky ? "Skill from nowhere" : hasBroken ? "The honest nothing" : "No signal"}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              CV R² {result.meanR2.toFixed(2)} · true signal 0
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center lg:mt-0">
          <Scatter points={result.points} />
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
          Cross-validation now reports a confident <span className="font-medium text-[var(--viz-error-ink)]">positive R²</span> — on data
          that is pure noise. The held-out points line up along the diagonal as if the
          model could really predict them. It can&apos;t.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> the ten features were
          chosen using the whole dataset, so the selection peeked at every test fold —
          they were never truly held out. <span className="font-medium text-ink">Repair:</span>{" "}
          move the selection back inside each fold.
        </p>
      </div>
    );
  }
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          With selection inside each fold, the diagonal dissolves into a shapeless cloud
          and R² falls back to ~0 — the truth. The skill was never in the data; it was in
          the leak.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> selection is just one
          door. Scaling, imputing, or encoding on the full dataset leaks the same way —
          any step that learns from the data belongs inside the split.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Trigger · break it on purpose</p>
      <p className="mt-2 leading-relaxed text-ink">
        Selecting inside each fold, this noise scores ~0 — correctly. Now take the
        tempting shortcut almost everyone reaches for: pick the best features using{" "}
        <span className="font-medium text-[var(--viz-error-ink)]">all the data</span> first, then cross-validate.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Predict first: can a score climb above zero on data with genuinely nothing to
        predict — if you let selection peek?
      </p>
    </div>
  );
}
