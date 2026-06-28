"use client";

import { useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { buildForest, forestAccuracy, forestProba } from "@/lib/models/random-forest";
import {
  FOREST_SEED,
  FULL_FOREST,
  forestDomain,
  forestPoints,
  forestTestPoints,
} from "@content/exhibits/random-forests/experiment";

/**
 * The "Break it" lab — the two jobs averaging can't do:
 *   · Forest of stumps — cap every tree to a stump and the forest underfits, and no
 *     number of trees rescues it (averaging fixes variance, not bias).
 *   · Beyond the data — zoom out and the confident vote flattens to a constant past the
 *     training cloud; trees can't extrapolate, and averaging blind trees is still blind.
 */
type Mode = "stumps" | "beyond";

export function RandomForestBreakIt() {
  const [mode, setMode] = useState<Mode>("stumps");

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Which failure to trigger" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
          {([["Forest of stumps", "stumps"], ["Beyond the data", "beyond"]] as const).map(([label, value]) => (
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
          {mode === "stumps" ? "averaging can't fix bias" : "averaging can't see past the data"}
        </p>
      </div>
      {mode === "stumps" ? <StumpsFailure /> : <BeyondFailure />}
    </div>
  );
}

function StumpsFailure() {
  const [depth, setDepth] = useState(5); // starts deep (fits) — drag down to break it
  const N = 30;
  const forest = useMemo(
    () => buildForest(forestPoints, { nTrees: N, maxDepth: depth, maxFeatures: 1, seed: FOREST_SEED }),
    [depth],
  );
  const predict = useMemo(() => (x1: number, x2: number) => forestProba(forest, x1, x2), [forest]);
  const acc = useMemo(() => forestAccuracy(forestTestPoints, forest), [forest]);
  const underfit = depth <= 2;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {underfit ? (
          <Guidance
            tone="broken"
            kicker="Symptom · it broke"
            body={
              <>
                The boundary is smooth but <span className="font-medium text-[var(--viz-error-ink)]">wrong</span> — it can&apos;t
                follow the arcs — and held-out sits low. These are {N} trees already; adding a
                thousand more would only make this same wrong shape <span className="font-medium">steadier</span>.
              </>
            }
            foot={
              <>
                <span className="font-medium text-ink">Diagnose:</span> stumps are high-bias, and
                averaging shrinks variance, not bias — the mean of many biased trees is the same bias.{" "}
                <span className="font-medium text-ink">Repair:</span> let the trees grow deep (low bias)
                and let the forest average their variance. Depth is the bias knob; tree count is the
                variance knob.
              </>
            }
          />
        ) : (
          <Guidance
            tone="trigger"
            kicker="Trigger it"
            body={
              <>
                Cap every tree to a <span className="font-medium text-ink">stump</span> — drag depth down
                to 1. The forest stays a forest ({N} trees), but each member can ask only one question.
              </>
            }
            foot="Watch the held-out score collapse and stay there. Then ask: would more trees bring it back?"
          />
        )}

        <Slider id="stump-depth" label="Depth per tree" value={depth} min={1} max={8} left="stumps · underfit" right="deep · low bias" onChange={(d) => { whenHydrated(() => useLearner.getState().recordPractice("random-forests")); setDepth(d); }} />

        <div className="grid grid-cols-2 gap-3">
          <Readout label="held-out" value={`${Math.round(acc * 100)}%`} hue={underfit ? "var(--viz-error-ink)" : "var(--accent)"} hint={underfit ? "stuck low — bias, not variance" : "deep enough to fit"} />
          <Readout label="trees" value={`${N}`} hue="var(--ink-muted)" hint="more won't fix bias" />
        </div>
      </div>

      <div className="mt-6 lg:mt-0">
        <DecisionField points={forestPoints} predictProba={predict} domain={forestDomain} width={600} height={500} label={`A ${N}-tree forest with each tree capped at depth ${depth}; ${Math.round(acc * 100)}% on held-out data. ${underfit ? "Too shallow — a smooth but biased boundary." : "Deep enough to follow the arcs."}`} />
      </div>
    </div>
  );
}

function BeyondFailure() {
  const [zoom, setZoom] = useState(false);
  const wide: [number, number] = [forestDomain[0] * 2.4, forestDomain[1] * 2.4];
  const domain = zoom ? wide : forestDomain;
  const predict = useMemo(() => (x1: number, x2: number) => forestProba(FULL_FOREST, x1, x2), []);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {zoom ? (
          <Guidance
            tone="broken"
            kicker="Symptom · it broke"
            body={
              <>
                Past the ring of data the field freezes into <span className="font-medium text-[var(--viz-error-ink)]">flat blocks</span> of
                solid colour — the forest is still <span className="font-medium">confident</span> out there, with
                nothing to be confident about.
              </>
            }
            foot={
              <>
                <span className="font-medium text-ink">Diagnose:</span> every tree just returns the vote
                of its nearest leaf; beyond the training cloud there are no more cuts, so the edge value
                extends forever. Averaging blind trees is still blind.{" "}
                <span className="font-medium text-ink">Repair:</span> don&apos;t extrapolate with trees —
                use a model with a global trend, cover the range with data, or flag out-of-distribution inputs.
              </>
            }
          />
        ) : (
          <Guidance
            tone="trigger"
            kicker="Trigger it"
            body={
              <>
                The forest looks great on the data it has seen. Now <span className="font-medium text-ink">zoom out</span> and
                ask it about points far outside the training moons.
              </>
            }
            foot="Watch what the boundary does where there are no points — does it keep following a trend, or give up?"
          />
        )}

        <label className="flex items-center gap-2 self-start rounded-lg border border-line bg-sunken px-4 py-2.5 text-sm text-ink">
          <input type="checkbox" checked={zoom} onChange={(e) => { whenHydrated(() => useLearner.getState().recordPractice("random-forests")); setZoom(e.target.checked); }} className="accent-[var(--accent)]" />
          Zoom out beyond the data
        </label>
        <p className="font-mono text-[11px] text-ink-faint">{zoom ? "showing far outside the training range" : "showing the training range"}</p>
      </div>

      <div className="mt-6 lg:mt-0">
        <DecisionField points={forestPoints} predictProba={predict} domain={domain} width={600} height={500} label={`The forest's vote over ${zoom ? "a region far wider than the training data, where the field flattens into constant blocks" : "the training range"}.`} />
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
