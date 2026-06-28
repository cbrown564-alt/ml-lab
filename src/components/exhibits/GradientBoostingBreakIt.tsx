"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { BoostingLossCurves } from "@/components/viz/BoostingLossCurves";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import type { TreePoint } from "@/lib/models/decision-tree";
import { boosterAccuracy, boosterLogLoss, boosterProba, fitBooster } from "@/lib/models/gradient-boosting";
import {
  BOOST_DEPTH,
  FULL_BOOSTER,
  bestRound,
  boostDomain,
  boostPoints,
  boostTestPoints,
} from "@content/exhibits/gradient-boosting/experiment";

/**
 * The "Break it" lab — two DISTINCT failures (not the same wall twice):
 *   · Too many rounds — boost past the held-out loss's low point and watch it climb back up
 *     (overfitting; descent doesn't stop itself).
 *   · Noisy labels — mislabel a few points and boost: each round re-fits the residuals, so
 *     those stubborn wrong points keep drawing the next tree's attention and the boundary
 *     contorts to chase them — the outlier-fixation a forest would have averaged away.
 */
type Mode = "rounds" | "noisy";

export function GradientBoostingBreakIt() {
  const [mode, setMode] = useState<Mode>("rounds");
  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Which failure to trigger" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
          {([["Too many rounds", "rounds"], ["Noisy labels", "noisy"]] as const).map(([label, value]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-full px-3.5 py-1 transition-colors ${mode === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] text-ink-faint">
          {mode === "rounds" ? "overfitting — descent overshoots" : "outliers — boosting chases the hard cases"}
        </p>
      </div>
      {mode === "rounds" ? <RoundsFailure /> : <NoisyFailure />}
    </div>
  );
}

function RoundsFailure() {
  const [rounds, setRounds] = useState(bestRound);
  const [overshot, setOvershot] = useState(false);
  const OVERSHOOT = bestRound + 60;
  useEffect(() => {
    if (overshot) reportTaskEvent("gradient-boosting:overfit-by-rounds");
  }, [overshot]);

  const predict = useMemo(() => (x1: number, x2: number) => boosterProba(FULL_BOOSTER, x1, x2, rounds), [rounds]);
  const testLL = useMemo(() => boosterLogLoss(boostTestPoints, FULL_BOOSTER, rounds), [rounds]);
  const broken = rounds >= OVERSHOOT;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {broken ? (
          <Guidance tone="broken" kicker="Symptom · it broke"
            body={<>The boundary has <span className="font-medium text-[var(--viz-error-ink)]">contorted</span> to capture stray points, and the held-out log-loss has <span className="font-medium text-[var(--viz-error-ink)]">climbed</span> well above its low at ~{bestRound} rounds — even as accuracy barely moved.</>}
            foot={<><span className="font-medium text-ink">Diagnose:</span> boosting is descent, and you kept stepping past the optimum, so the late trees fit noise. <span className="font-medium text-ink">Repair:</span> stop early — slide back to the held-out minimum — or lower the learning rate so the descent is gentler.</>} />
        ) : (
          <Guidance tone="trigger" kicker="Trigger it"
            body={<>The model sits near its sweet spot (~{bestRound} rounds), the held-out loss at its low. Now <span className="font-medium text-ink">drag rounds toward the maximum</span>.</>}
            foot="Watch the held-out loss curve: it has bottomed out, and from here on more rounds only push it back up." />
        )}
        <Slider id="bi-rounds" label="Boosting rounds" value={rounds} min={1} max={200} left="near the low point" right="far past it" onChange={(v) => { whenHydrated(() => useLearner.getState().recordPractice("gradient-boosting")); if (v >= OVERSHOOT) setOvershot(true); setRounds(v); }} />
        <Readout label="held-out log-loss" value={testLL.toFixed(3)} hue={broken ? "var(--viz-error-ink)" : "var(--accent)"} hint={broken ? "climbing — overshot the low" : "near its minimum"} />
        <BoostingLossCurves current={rounds} />
      </div>
      <div className="mt-6 lg:mt-0">
        <DecisionField points={boostPoints} predictProba={predict} domain={boostDomain} width={600} height={500} label={`The boosted boundary after ${rounds} rounds; held-out log-loss ${testLL.toFixed(2)}, the boundary contorting as rounds pass the early-stop point.`} />
      </div>
    </div>
  );
}

/** Flip a fixed handful of training labels — the "outliers" boosting will chase. */
const FLIP_EVERY = 22;
function poison(points: TreePoint[], on: boolean): { data: TreePoint[]; flipped: TreePoint[] } {
  if (!on) return { data: points, flipped: [] };
  const flipped: TreePoint[] = [];
  const data = points.map((p, i) => {
    if (i % FLIP_EVERY === 0) {
      const f = { ...p, y: (1 - p.y) as 0 | 1 };
      flipped.push(f);
      return f;
    }
    return p;
  });
  return { data, flipped };
}

function NoisyFailure() {
  const [noisy, setNoisy] = useState(false);
  const ROUNDS = 120;
  const { data, flipped } = useMemo(() => poison(boostPoints, noisy), [noisy]);
  const booster = useMemo(() => fitBooster(data, { nRounds: ROUNDS, maxDepth: BOOST_DEPTH, lr: 0.3 }), [data]);
  const predict = useMemo(() => (x1: number, x2: number) => boosterProba(booster, x1, x2), [booster]);
  const acc = useMemo(() => boosterAccuracy(boostTestPoints, booster), [booster]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {noisy ? (
          <Guidance tone="broken" kicker="Symptom · it broke"
            body={<>The boundary <span className="font-medium text-[var(--viz-error-ink)]">bulges and pockets</span> around the {flipped.length} mislabeled points — boosting has bent the model to capture them — and the held-out accuracy has <span className="font-medium text-[var(--viz-error-ink)]">dropped</span>.</>}
            foot={<><span className="font-medium text-ink">Diagnose:</span> a mislabeled point stays wrong, so its residual stays large and keeps drawing the next tree — boosting fixates on the hardest cases by design. <span className="font-medium text-ink">Repair:</span> clean the labels, cap depth and the learning rate, or prefer a forest, which averages stray points away instead of chasing them.</>} />
        ) : (
          <Guidance tone="trigger" kicker="Trigger it"
            body={<>The model fits the clean data well. Now <span className="font-medium text-ink">flip a few labels</span> — mislabel a handful of points, the kind of noise real data always has.</>}
            foot="Watch the boundary near the flipped points, and the held-out score. Does boosting shrug them off, or chase them?" />
        )}
        <label className="flex items-center gap-2 self-start rounded-lg border border-line bg-sunken px-4 py-2.5 text-sm text-ink">
          <input type="checkbox" checked={noisy} onChange={(e) => { whenHydrated(() => useLearner.getState().recordPractice("gradient-boosting")); setNoisy(e.target.checked); }} className="accent-[var(--accent)]" />
          Mislabel a few points
        </label>
        <Readout label="held-out accuracy" value={`${Math.round(acc * 100)}%`} hue={noisy ? "var(--viz-error-ink)" : "var(--accent)"} hint={noisy ? `chasing ${flipped.length} flipped points` : "clean labels"} />
        <p className="font-mono text-[11px] text-ink-faint">{ROUNDS} rounds · a forest would average the stray points away</p>
      </div>
      <div className="mt-6 lg:mt-0">
        <DecisionField points={data} predictProba={predict} domain={boostDomain} width={600} height={500} label={`A ${ROUNDS}-round booster on data with ${flipped.length} mislabeled points; the boundary bulges to capture them, and held-out accuracy is ${Math.round(acc * 100)}%.`} />
      </div>
    </div>
  );
}

function Slider({ id, label, value, min, max, left, right, onChange }: { id: string; label: string; value: number; min: number; max: number; left: string; right: string; onChange: (v: number) => void; }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-4">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
        <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{value}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
      <div className="flex justify-between font-mono text-[10px] text-ink-faint"><span>{left}</span><span>{right}</span></div>
    </div>
  );
}

function Readout({ label, value, hue, hint }: { label: string; value: string; hue: string; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-sunken p-3">
      <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">{label}</div>
      <div className="mt-0.5 font-mono text-2xl tabular-nums" style={{ color: hue }}>{value}</div>
      <div className="mt-0.5 text-[11px] leading-tight text-ink-faint">{hint}</div>
    </div>
  );
}

function Guidance({ tone, kicker, body, foot }: { tone: "trigger" | "broken"; kicker: string; body: React.ReactNode; foot: React.ReactNode; }) {
  return (
    <div>
      <p className={`font-mono text-[11px] tracking-[0.16em] uppercase ${tone === "broken" ? "text-[var(--viz-error-ink)]" : "text-accent"}`}>{kicker}</p>
      <p className="mt-2 leading-relaxed text-ink">{body}</p>
      <p className="mt-3 leading-relaxed text-ink-muted">{foot}</p>
    </div>
  );
}
