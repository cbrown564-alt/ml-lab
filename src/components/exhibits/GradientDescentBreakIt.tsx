"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Axes, DataPoints, FitLine, Plot } from "@/components/viz/Plot";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { TrainingCurve } from "@/components/viz/TrainingCurve";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  createGradientDescent,
  mse,
  olsFit,
  type DescentStep,
  type GradientDescentRun,
} from "@/lib/models/linear-regression";
import { gradientDescentExperiment } from "@content/exhibits/gradient-descent/experiment";

/**
 * The interactive "Break it" lab for gradient descent — the differentiating act
 * (the report): not a card of caveats but a live failure loop the learner drives.
 * You creep the learning rate up until the descent stops converging and explodes,
 * read the symptom on the loss curve, name the cause, then bring it back under the
 * stability ceiling and watch it recover. Confront the failure, diagnose it, repair
 * it — with the curve giving feedback the whole way.
 */

const POINTS = gradientDescentExperiment.datasets.find((d) => d.id === "gd-zigzag")!.points;
const LR_DEF = gradientDescentExperiment.params[0];
const MAX_STEPS = 500;
const PLAY_INTERVAL_MS = 90;
const DIVERGENCE_CEILING = 1e12;
const offTheCliff = (s: DescentStep) =>
  !Number.isFinite(s.loss) || s.loss > DIVERGENCE_CEILING;
const formatLoss = (loss: number) =>
  !Number.isFinite(loss) ? "∞" : loss >= 1000 ? loss.toExponential(1) : loss.toFixed(2);

type Phase = "arming" | "broken" | "repaired";

export function GradientDescentBreakIt() {
  const [learningRate, setLearningRate] = useState(0.06);
  const runRef = useRef<GradientDescentRun | null>(null);
  const [trace, setTrace] = useState<ReadonlyArray<DescentStep>>(() => [
    ...createGradientDescent(POINTS, { learningRate: 0.06 }).trace,
  ]);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  // Sticky memory of the loop: have we ever made it explode, and have we since
  // brought it home? The phase is the arc the guidance follows.
  const [hasBroken, setHasBroken] = useState(false);

  const floor = useMemo(() => mse(POINTS, olsFit(POINTS)), []);
  const latest = trace[trace.length - 1];
  const diverged = latest !== undefined && offTheCliff(latest);
  const converged = latest !== undefined && !diverged && latest.loss <= floor * 1.15 + 0.02;

  // Each replay starts a fresh descent at the current rate.
  const replay = () => {
    whenHydrated(() => useLearner.getState().recordPractice("gradient-descent"));
    const run = createGradientDescent(POINTS, { learningRate });
    runRef.current = run;
    setTrace([...run.trace]);
    setCursor(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const run = runRef.current;
      if (!run || offTheCliff(run.current) || run.current.step >= MAX_STEPS) {
        setPlaying(false);
        return;
      }
      run.step();
      setTrace([...run.trace]);
      setCursor(run.trace.length - 1);
    }, PLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [playing]);

  // Latch the failure the moment it happens (adjust state during render), then
  // report it to the lab task bus from an effect — so breaking it here also
  // satisfies the "make it diverge" check, with no setState inside an effect.
  if (diverged && !hasBroken) setHasBroken(true);
  useEffect(() => {
    if (hasBroken) reportTaskEvent("gradient-descent:diverged");
  }, [hasBroken]);

  const phase: Phase = diverged ? "broken" : hasBroken && converged ? "repaired" : "arming";
  const viewing = trace[Math.min(cursor, Math.max(0, trace.length - 1))];
  if (!viewing) return null;

  const status = diverged
    ? { text: "Diverged", cls: "border-[var(--viz-error)] text-[var(--viz-error-ink)]" }
    : converged
      ? { text: "Converged", cls: "border-accent text-accent" }
      : { text: "Running", cls: "border-line text-ink-faint" };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* The guidance rail — the trigger, the live readout, and prose that tracks
            the phase of the loop (arm it, watch it break, repair it). */}
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="rounded-lg border border-line bg-sunken p-4">
            <ParamSlider def={LR_DEF} value={learningRate} onChange={setLearningRate} />
            <button
              type="button"
              onClick={replay}
              className="mt-4 w-full rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              {playing ? "Running…" : "Set this rate & replay"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${status.cls}`}
            >
              {status.text}
            </span>
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              step {viewing.step} · loss {formatLoss(viewing.loss)}
            </span>
          </div>
        </div>

        {/* The live evidence: the line at the current step, and the loss curve
            whose explosion (log axis) is the unmistakable symptom. */}
        <div className="mt-6 lg:mt-0">
          <Plot
            width={640}
            height={360}
            xDomain={[-0.5, 6.5]}
            yDomain={[-2, 22]}
            ariaLabel={`Gradient descent at step ${viewing.step}: loss ${formatLoss(viewing.loss)}. ${diverged ? "The loss has exploded — the descent has diverged." : converged ? "The descent has converged to the least-squares fit." : "The descent is running."}`}
          >
            <Axes />
            {/* Once the step is off the cliff the params blow up and the line
                would snap to a vertical artifact — hide it so the honest symptom
                is the exploding loss curve, not a glitch. */}
            {!offTheCliff(viewing) && <FitLine params={viewing.params} />}
            <DataPoints points={POINTS} />
          </Plot>
          <TrainingCurve trace={trace} cursor={cursor} width={640} height={172} emptyHint="press replay · watch the loss fall" />
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
        </div>
      </div>
    </div>
  );
}

function Guidance({ phase }: { phase: Phase }) {
  if (phase === "broken") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">
          Symptom · it broke
        </p>
        <p className="mt-2 leading-relaxed text-ink">
          The loss didn&apos;t fall — it <span className="font-medium text-[var(--viz-error-ink)]">exploded</span>,
          climbing by powers of ten. Each step overshot the valley and landed higher
          up the far wall than where it started.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> the direction was
          never wrong — every step still pointed downhill. The <em>step length</em>{" "}
          was too big for the surface&apos;s curvature to absorb.{" "}
          <span className="font-medium text-ink">Repair:</span>{" "}
          lower the rate back under the stability ceiling and replay.
        </p>
      </div>
    );
  }
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
          Repaired ✓
        </p>
        <p className="mt-2 leading-relaxed text-ink">
          Back under the ceiling, the same descent walks straight to the floor. You
          found the cliff by going over it — that&apos;s the operating envelope.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> too <em>timid</em>{" "}
          a rate is the opposite failure — it never diverges, but it never arrives
          either. The art is the largest step the curvature still tolerates.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">
        Trigger · break it on purpose
      </p>
      <p className="mt-2 leading-relaxed text-ink">
        At a sensible rate this descent converges. Now find its breaking point:
        creep the learning rate up and replay until the loss stops falling and
        starts to <span className="font-medium text-[var(--viz-error-ink)]">climb</span>.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Predict first: how far past today&apos;s rate is the edge? Bigger steps learn
        faster — until they don&apos;t.
      </p>
    </div>
  );
}
