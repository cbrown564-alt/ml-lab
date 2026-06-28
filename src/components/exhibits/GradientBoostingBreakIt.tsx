"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { BoostingLossCurves } from "@/components/viz/BoostingLossCurves";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { boosterLogLoss, boosterProba, fitBooster } from "@/lib/models/gradient-boosting";
import {
  BOOST_DEPTH,
  FULL_BOOSTER,
  bestRound,
  boostDomain,
  boostPoints,
  boostTestPoints,
} from "@content/exhibits/gradient-boosting/experiment";

/**
 * The "Break it" lab — the two ways boosting's descent runs off the road:
 *   · Too many rounds — boost past the held-out loss's low point and watch it climb back up.
 *   · Steps too big — raise the learning rate so each step overshoots, overfitting fast.
 * Both are the same wall (overfitting) reached through boosting's two dials.
 */
type Mode = "rounds" | "steps";

export function GradientBoostingBreakIt() {
  const [mode, setMode] = useState<Mode>("rounds");
  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Which dial to overshoot" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
          {([["Too many rounds", "rounds"], ["Steps too big", "steps"]] as const).map(([label, value]) => (
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
        <p className="font-mono text-[11px] text-ink-faint">both overshoot the held-out loss</p>
      </div>
      {mode === "rounds" ? <RoundsFailure /> : <StepsFailure />}
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

const LRS = [0.05, 0.3, 1.0, 1.5] as const;
function StepsFailure() {
  const [lr, setLr] = useState<number>(0.3);
  const booster = useMemo(() => fitBooster(boostPoints, { nRounds: 80, maxDepth: BOOST_DEPTH, lr }), [lr]);
  const predict = useMemo(() => (x1: number, x2: number) => boosterProba(booster, x1, x2), [booster]);
  const testLL = useMemo(() => boosterLogLoss(boostTestPoints, booster), [booster]);
  const broken = lr >= 1.0;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {broken ? (
          <Guidance tone="broken" kicker="Symptom · it broke"
            body={<>With a large step each tree <span className="font-medium text-[var(--viz-error-ink)]">overshoots</span>, and after 80 rounds the boundary is jagged and the held-out loss is high — the descent leapt past the optimum instead of settling into it.</>}
            foot={<><span className="font-medium text-ink">Diagnose:</span> the learning rate is the step size; too large and each correction overcorrects, fitting noise fast. <span className="font-medium text-ink">Repair:</span> shrink the learning rate (0.05–0.1) and add more rounds — small, careful steps reach a lower held-out loss than a few big ones.</>} />
        ) : (
          <Guidance tone="trigger" kicker="Trigger it"
            body={<>All four runs use the same 80 rounds and the same shallow trees — only the <span className="font-medium text-ink">learning rate</span> differs. Step it up.</>}
            foot="A bigger step isn't faster progress — watch the held-out loss rise as the steps get too large." />
        )}
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-4">
          <span className="text-sm font-medium text-ink">Learning rate η (80 rounds)</span>
          <div role="group" aria-label="Learning rate" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
            {LRS.map((v) => (
              <button key={v} type="button" aria-pressed={lr === v} onClick={() => { whenHydrated(() => useLearner.getState().recordPractice("gradient-boosting")); setLr(v); }}
                className={`rounded-full px-3 py-1 font-mono transition-colors ${lr === v ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}>{v.toFixed(2)}</button>
            ))}
          </div>
        </div>
        <Readout label="held-out log-loss" value={testLL.toFixed(3)} hue={broken ? "var(--viz-error-ink)" : "var(--accent)"} hint={broken ? "overshot — steps too big" : lr <= 0.1 ? "cautious — lowest loss" : "the standard step"} />
      </div>
      <div className="mt-6 lg:mt-0">
        <DecisionField points={boostPoints} predictProba={predict} domain={boostDomain} width={600} height={500} label={`80 rounds of boosting at learning rate ${lr}; held-out log-loss ${testLL.toFixed(2)}.`} />
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
