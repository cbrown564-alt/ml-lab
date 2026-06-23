"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LossSurface } from "@/components/viz/LossSurface";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  createGradientDescent,
  mse,
  olsFit,
  type DescentStep,
  type GradientDescentRun,
  type Point,
} from "@/lib/models/linear-regression";
import { stableLearningRate, standardizeX } from "@/lib/models/conditioning";
import { featureScalingExperiment } from "@content/exhibits/feature-scaling/experiment";
import type { ParamDef } from "@/lib/experiment/spec";

/**
 * The interactive "Break it" lab for feature scaling. The raw-units descent crawls,
 * and the obvious fix — a bigger step — backfires: the stretched bowl's stability
 * ceiling is so low that raising the learning rate makes it diverge. The real fix is
 * to round the bowl. Standardise, and the very same big step that just exploded walks
 * straight to the floor. Trigger → symptom → diagnose → repair, conditioning made
 * tangible.
 */
const RAW: Point[] = featureScalingExperiment.datasets[0].points;
const STD: Point[] = standardizeX(RAW);
const MAX_STEPS = 240;
const PLAY_MS = 45;
const CEILING = 1e12;
const offCliff = (s: DescentStep) => !Number.isFinite(s.loss) || s.loss > CEILING;

const LR_DEF: ParamDef = {
  id: "lr",
  label: "Learning rate η",
  hint: "How big a step each iteration takes.",
  min: 0.01,
  max: 1,
  step: 0.001,
  default: 0.05,
  log: true,
};

type Phase = "arming" | "broken" | "repaired";

export function FeatureScalingBreakIt() {
  const [scaled, setScaled] = useState(false);
  const [lr, setLr] = useState(0.05);
  const points = scaled ? STD : RAW;

  const runRef = useRef<GradientDescentRun | null>(null);
  const [trace, setTrace] = useState<ReadonlyArray<DescentStep>>(() => [
    ...createGradientDescent(RAW, { learningRate: 0.05 }).trace,
  ]);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasBroken, setHasBroken] = useState(false);

  const floor = useMemo(() => mse(points, olsFit(points)), [points]);
  const latest = trace[trace.length - 1];
  const diverged = latest !== undefined && offCliff(latest);
  const converged = latest !== undefined && !diverged && latest.loss <= floor * 1.15 + 0.02;

  const run = () => {
    whenHydrated(() => useLearner.getState().recordPractice("feature-scaling"));
    const r = createGradientDescent(points, { learningRate: lr });
    runRef.current = r;
    setTrace([...r.trace]);
    setCursor(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const r = runRef.current;
      if (!r || offCliff(r.current) || r.current.step >= MAX_STEPS) {
        setPlaying(false);
        return;
      }
      r.step();
      setTrace([...r.trace]);
      setCursor(r.trace.length - 1);
    }, PLAY_MS);
    return () => clearInterval(timer);
  }, [playing]);

  // The break: diverging on raw units (a bigger step on the stretched bowl).
  const brokeOnRaw = diverged && !scaled;
  if (brokeOnRaw && !hasBroken) setHasBroken(true);
  useEffect(() => {
    if (hasBroken) reportTaskEvent("feature-scaling:diverged-on-raw");
  }, [hasBroken]);

  const phase: Phase = brokeOnRaw ? "broken" : hasBroken && scaled && converged ? "repaired" : "arming";
  const viewing = trace[Math.min(cursor, Math.max(0, trace.length - 1))];

  const status = diverged
    ? { text: "Diverged", cls: "border-[var(--viz-error)] text-[var(--viz-error-ink)]" }
    : converged
      ? { text: "Reached the floor", cls: "border-accent text-accent" }
      : { text: "Crawling", cls: "border-line text-ink-faint" };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-sunken p-4">
            <div role="group" aria-label="Whether the input is scaled" className="inline-flex self-center rounded-full border border-line p-0.5 text-sm">
              {([["raw", false], ["standardised", true]] as const).map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={scaled === value}
                  onClick={() => setScaled(value)}
                  className={`rounded-full px-3.5 py-1 capitalize transition-colors ${scaled === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ParamSlider def={LR_DEF} value={lr} onChange={setLr} />
            <button
              type="button"
              onClick={run}
              className="w-full rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              {playing ? "Running…" : "Set this rate & run"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span role="status" className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${status.cls}`}>
              {status.text}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              η ≤ {stableLearningRate(points).toFixed(2)} stays stable here
            </span>
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <LossSurface points={points} trace={trace} cursor={cursor} width={680} height={520} />
          <input
            type="range"
            aria-label="Scrub through descent steps"
            min={0}
            max={Math.max(0, trace.length - 1)}
            value={Math.min(cursor, trace.length - 1)}
            onChange={(e) => {
              setPlaying(false);
              setCursor(Number(e.target.value));
            }}
            disabled={trace.length < 2}
            className="mt-3 w-full accent-[var(--accent)] disabled:opacity-40"
          />
          {viewing && (
            <p className="mt-1 font-mono text-xs text-ink-faint tabular-nums">
              step {viewing.step} · loss {Number.isFinite(viewing.loss) ? viewing.loss.toFixed(2) : "∞"}
            </p>
          )}
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
          The bigger step didn&apos;t speed it up — it <span className="font-medium text-[var(--viz-error-ink)]">exploded</span>. On the
          stretched bowl, a step large enough to make progress along the valley flies
          straight up the steep walls.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> the crawl was never a
          step-size problem you could brute-force — the surface&apos;s stability ceiling
          is tiny because it&apos;s so lopsided. <span className="font-medium text-ink">Repair:</span>{" "}
          switch to standardised and run the same big η again.
        </p>
      </div>
    );
  }
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          The very step that just exploded now walks straight to the floor. Rounding the
          bowl raised the ceiling, so a big confident step is finally safe — and fast.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> tree-based models split
          one feature at a time and never compare magnitudes — scaling buys them nothing.
          The fix matters exactly where distances or gradients do.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Trigger · break it on purpose</p>
      <p className="mt-2 leading-relaxed text-ink">
        On raw units this descent crawls. The obvious fix is a bigger step — so raise the
        learning rate and run, on raw units, until the loss stops falling and{" "}
        <span className="font-medium text-[var(--viz-error-ink)]">explodes</span>.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Predict first: will a bigger step rescue the crawl, or does the stretched bowl
        punish it?
      </p>
    </div>
  );
}
