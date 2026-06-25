"use client";

import { useEffect, useMemo, useState } from "react";
import { DataLeakageProvenancePipe } from "@/components/exhibits/DataLeakageProvenancePipe";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { crossValR2, type Matrix } from "@/lib/models/leakage";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * Break it — counterfactual replay on the provenance pipe. Trigger the leak and
 * watch test information cross the wall; repair by sealing selection inside each
 * fold and watch the score clean itself.
 */

const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;

type Phase = "arming" | "broken" | "repaired";

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
              {leaky ? "Wall breached" : hasBroken ? "Pipe cleaned" : "Wall sealed"}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              CV R² {result.meanR2.toFixed(2)} · true signal 0
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center lg:mt-0">
          <DataLeakageProvenancePipe leaky={leaky} r2={result.meanR2} />
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
          The pipe reports a confident <span className="font-medium text-[var(--viz-error-ink)]">positive R²</span> — on pure
          noise. Watch the red back-flow: test folds informed feature selection before they were held out.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> selection peeked across the wall.{" "}
          <span className="font-medium text-ink">Repair:</span> move selection inside each fold and seal the boundary.
        </p>
      </div>
    );
  }
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          The back-flow vanishes, the wall seals, and R² falls to ~0 — the honest truth. The skill was in the leak,
          not the data.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> scaling, imputing, or encoding on the full dataset
          leaks the same way — any step that learns belongs inside the split.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Trigger · break it on purpose</p>
      <p className="mt-2 leading-relaxed text-ink">
        With selection inside each fold, this noise scores ~0. Now take the shortcut: pick features using{" "}
        <span className="font-medium text-[var(--viz-error-ink)]">all the data</span> first, then cross-validate.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Predict first: can forbidden information crossing the wall manufacture skill where there is none?
      </p>
    </div>
  );
}
