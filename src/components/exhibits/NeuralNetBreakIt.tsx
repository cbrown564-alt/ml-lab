"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { accuracy, initNet, predictProba, train } from "@/lib/models/neural-net";
import { BREAK_HIDDEN_CHOICES, breakTest, breakTrain, NN_LR } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * The interactive "Break it": capacity is a double-edged sword. The train set carries
 * ~12% label noise. A small network learns the underlying curve and ignores the noise —
 * train and held-out test agree. Crank the hidden units up and the network has the
 * capacity to memorise every noisy point: the boundary sprouts islands around them, train
 * accuracy climbs, and the held-out score drops. Perfect on what it's seen, worse on what
 * it hasn't — that's overfitting, and more units is exactly the wrong fix.
 */
const EPOCHS = 1500;
const OVERFIT_GAP = 0.08;
const CLEAN_GAP = 0.06;

export function NeuralNetBreakIt() {
  const [hidden, setHidden] = useState(32);
  const [seed, setSeed] = useState(3);
  const [hasSeen, setHasSeen] = useState(false);

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
                With only {hidden} units there isn&apos;t capacity to chase every point, so the network draws the{" "}
                <span className="font-medium text-accent">smooth rule</span> and shrugs off the noise. Train and held-out test now
                agree — it generalises.
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Boundary:</span> too few units would
                underfit — it couldn&apos;t learn the real curve at all. The art is enough
                capacity for the signal, not the noise (and regularisation lets you keep
                capacity while penalising the wiggles).
              </p>
            </div>
          ) : broken ? (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
              <p className="mt-2 leading-relaxed text-ink">
                {hidden} units is enough capacity to <span className="font-medium text-[var(--viz-error-ink)]">memorise the noise</span>.
                The boundary sprouts islands around individual points; train accuracy looks
                great, but on data it hasn&apos;t seen it drops {Math.round(gap * 100)} points.
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Diagnose:</span> it learned the noise,
                not the rule — the held-out gap is the tell.{" "}
                <span className="font-medium text-ink">Repair:</span> drop the hidden units
                (or regularise). More capacity is the wrong fix.
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
          <DecisionField points={breakTrain} predictProba={(x1, x2) => predictProba(net, x1, x2)} width={520} height={440} />
          <p className="mt-2 text-sm leading-relaxed text-ink-faint">
            The points are the noisy training set; the shaded field is what the network
            believes. Watch the boundary go from a clean curve to a lumpy one chasing
            individual points as the capacity grows.
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
