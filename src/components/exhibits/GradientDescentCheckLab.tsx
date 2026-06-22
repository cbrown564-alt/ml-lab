"use client";

import { useEffect, useRef, useState } from "react";
import { Axes, DataPoints, FitLine, Plot } from "@/components/viz/Plot";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { TrainingCurve } from "@/components/viz/TrainingCurve";
import {
  createGradientDescent,
  type DescentStep,
  type GradientDescentRun,
} from "@/lib/models/linear-regression";
import { gradientDescentExperiment } from "@content/exhibits/gradient-descent/experiment";

/**
 * The Explain-it companion: a compact live descent pinned beside the checks, so the
 * learner answers against the running model — set a rate, replay, read the loss
 * curve — rather than from memory, and the act's canvas is composed, not a void.
 */

const POINTS = gradientDescentExperiment.datasets.find((d) => d.id === "gd-zigzag")!.points;
const LR_DEF = gradientDescentExperiment.params[0];
const MAX_STEPS = 500;
const CEIL = 1e12;
const off = (s: DescentStep) => !Number.isFinite(s.loss) || s.loss > CEIL;
const fmt = (l: number) =>
  !Number.isFinite(l) ? "∞" : l >= 1000 ? l.toExponential(1) : l.toFixed(2);

export function GradientDescentCheckLab() {
  const [lr, setLr] = useState(0.06);
  const runRef = useRef<GradientDescentRun | null>(null);
  const [trace, setTrace] = useState<ReadonlyArray<DescentStep>>(() => [
    ...createGradientDescent(POINTS, { learningRate: 0.06 }).trace,
  ]);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  const replay = () => {
    const r = createGradientDescent(POINTS, { learningRate: lr });
    runRef.current = r;
    setTrace([...r.trace]);
    setCursor(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      const r = runRef.current;
      if (!r || off(r.current) || r.current.step >= MAX_STEPS) {
        setPlaying(false);
        return;
      }
      r.step();
      setTrace([...r.trace]);
      setCursor(r.trace.length - 1);
    }, 90);
    return () => clearInterval(t);
  }, [playing]);

  const v = trace[Math.min(cursor, Math.max(0, trace.length - 1))];
  if (!v) return null;

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Answer against the live descent
      </figcaption>
      <Plot
        width={380}
        height={240}
        xDomain={[-0.5, 6.5]}
        yDomain={[-2, 22]}
        ariaLabel={`A live descent at step ${v.step}, loss ${fmt(v.loss)}.`}
      >
        <Axes />
        {!off(v) && <FitLine params={v.params} />}
        <DataPoints points={POINTS} />
      </Plot>
      <TrainingCurve trace={trace} cursor={cursor} width={380} height={120} />
      <div className="mt-3">
        <ParamSlider def={LR_DEF} value={lr} onChange={setLr} />
      </div>
      <button
        type="button"
        onClick={replay}
        className="mt-3 w-full rounded-full border border-accent px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-ink"
      >
        {playing ? "Running…" : "Set rate & replay"}
      </button>
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">
        step {v.step} · loss {fmt(v.loss)}
      </p>
    </figure>
  );
}
