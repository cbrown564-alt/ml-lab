"use client";

import { useEffect, useMemo, useState } from "react";
import { FeatureFoldField } from "@/components/viz/FeatureFoldField";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { accuracy, initNet, train } from "@/lib/models/neural-net";
import { BREAK_HIDDEN_CHOICES, breakTest, breakTrain, NN_LR } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * Capacity is a double-edged sword: too many hidden units mean too many folds chasing
 * noise. When overfit, inspect the fold lines — they sprout around individual noisy
 * points instead of tracing one smooth rule.
 */
const EPOCHS = 1500;
const OVERFIT_GAP = 0.08;
const CLEAN_GAP = 0.06;

export function NeuralNetBreakIt() {
  const [hidden, setHidden] = useState(32);
  const [seed, setSeed] = useState(3);
  const [hasSeen, setHasSeen] = useState(false);
  const [showFolds, setShowFolds] = useState(false);

  const net = useMemo(() => train(initNet(hidden, seed), breakTrain, NN_LR, EPOCHS).net, [hidden, seed]);
  const trainAcc = accuracy(net, breakTrain);
  const testAcc = accuracy(net, breakTest);
  const gap = trainAcc - testAcc;

  const broken = gap > OVERFIT_GAP;
  if (broken && !hasSeen) setHasSeen(true);
  useEffect(() => {
    if (hasSeen) reportTaskEvent("neural-network-fundamentals:overfitting");
  }, [hasSeen]);
  const repaired = hasSeen && gap < CLEAN_GAP;

  const choose = (h: number) => {
    whenHydrated(() => useLearner.getState().recordPractice("neural-network-fundamentals"));
    setHidden(h);
  };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          {repaired ? (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
              <p className="mt-2 leading-relaxed text-ink">
                With only {hidden} folds there isn&apos;t capacity to chase every point, so the network draws the{" "}
                <span className="font-medium text-accent">smooth rule</span> and shrugs off the noise. Train and held-out test now
                agree — it generalises.
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Boundary:</span> too few folds would
                underfit — it couldn&apos;t learn the real curve at all. The art is enough
                capacity for the signal, not the noise.
              </p>
            </div>
          ) : broken ? (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
              <p className="mt-2 leading-relaxed text-ink">
                {hidden} folds is enough capacity to <span className="font-medium text-[var(--viz-error-ink)]">memorise the noise</span>.
                The boundary sprouts islands around individual points; train accuracy looks
                great, but on data it hasn&apos;t seen it drops {Math.round(gap * 100)} points.
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Diagnose:</span> toggle{" "}
                <span className="font-medium text-ink">show folds</span> — each extra unit adds a half-space line that can hug a noisy point.{" "}
                <span className="font-medium text-ink">Repair:</span> drop the hidden units.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Settling</p>
              <p className="mt-2 leading-relaxed text-ink">Between under- and over-fitting. Push the units up to overfit, down to generalise.</p>
            </div>
          )}

          <div className="rounded-lg border border-line bg-sunken p-4">
            <p className="text-sm text-ink-muted">Hidden units (capacity)</p>
            <div className="mt-2 flex gap-1.5">
              {BREAK_HIDDEN_CHOICES.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-pressed={hidden === h}
                  onClick={() => choose(h)}
                  className={`flex-1 rounded-md border px-3 py-1.5 font-mono text-sm transition-colors ${hidden === h ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-muted hover:text-ink"}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={showFolds}
              onChange={(e) => setShowFolds(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Show fold lines (half-space boundaries)
          </label>

          <div className="flex items-center justify-between gap-3">
            <span role="status" className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${broken ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]" : repaired ? "border-accent text-accent" : "border-line text-ink-faint"}`}>
              {broken ? "Overfit — memorising noise" : repaired ? "Generalising" : "Settling"}
            </span>
            <button type="button" onClick={() => setSeed((s) => s + 1)} className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted hover:bg-sunken">
              New sample
            </button>
          </div>

          <dl className="grid grid-cols-3 gap-2 text-center">
            <Stat label="train" value={`${Math.round(trainAcc * 100)}%`} hue="var(--viz-neutral-ink)" />
            <Stat label="held-out test" value={`${Math.round(testAcc * 100)}%`} hue="var(--viz-truth-ink)" />
            <Stat label="gap" value={`${Math.round(gap * 100)}pt`} hue={broken ? "var(--viz-error-ink)" : "var(--viz-neutral-ink)"} />
          </dl>
        </div>

        <div className="mt-6 lg:mt-0">
          <FeatureFoldField
            net={net}
            points={breakTrain}
            visibleUnits={showFolds ? null : new Set()}
            width={520}
            height={440}
          />
          <p className="mt-2 text-sm leading-relaxed text-ink-faint">
            {showFolds
              ? "Each fold line is one hidden unit's half-space — when overfit, they multiply to hug noisy points."
              : "The shaded field is what the network believes. Toggle folds to see the half-space lines underneath."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hue }: { label: string; value: string; hue: string }) {
  return (
    <div className="rounded-lg border border-line p-2.5">
      <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">{label}</dt>
      <dd className="mt-0.5 font-mono text-lg" style={{ color: hue }}>{value}</dd>
    </div>
  );
}
