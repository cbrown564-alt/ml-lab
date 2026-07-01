"use client";

import { useMemo, useState } from "react";
import { StatGrid } from "@/components/viz/StatGrid";
import { KMeansField } from "@/components/viz/KMeansField";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  goodK,
  iterations,
  kAtIndex,
  kChoices,
  kMeansDomain,
  kMeansPoints,
  kMeansScenario,
  kMeansYDomain,
  kParam,
  stateForK,
  stepParam,
  tooManyK,
  wrongK,
} from "@content/exhibits/k-means/experiment";

/**
 * The open k-means bench: choose k, step through the Lloyd loop, and read the objective
 * back as numbers. Because the committed fixture only stages the Lloyd updates for k=3,
 * the step slider is active there and the wrong/over-split cases show their converged
 * final partitions directly.
 */
export function KMeansLab() {
  const [kIndex, setKIndex] = useState(kParam.default);
  const [step, setStep] = useState(stepParam.default);
  const k = kAtIndex(kIndex);
  const activeStep = k === 3 ? step : iterations.length - 1;
  const state = useMemo(() => stateForK(k, activeStep), [activeStep, k]);
  const previousCentroids = k === 3 && activeStep > 0 ? iterations[activeStep - 1].centroids : undefined;

  const note =
    k === 2
      ? "Wrong k — two real blobs are forced to share one centroid."
      : k === 5
        ? "Over-segmented — extra centroids shave distance by subdividing real blobs."
        : activeStep === 0
          ? "Seeds placed — every point joins the nearest centroid."
          : "Settled — one centroid per blob, the cleanest story on this dataset.";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{kMeansScenario.prompt}</p>

          <div className="flex flex-col gap-4 rounded-lg border border-line bg-sunken p-4">
            <Slider
              id="kmeans-k"
              label={kParam.label}
              value={kIndex}
              display={`${k}`}
              min={kParam.min}
              max={kParam.max}
              step={kParam.step}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("k-means"));
                setKIndex(value);
              }}
              hint={kParam.hint ?? ""}
              ticks={kChoices.map((choice, i) => ({ value: i, label: `${choice}` }))}
            />

            <Slider
              id="kmeans-step"
              label={stepParam.label}
              value={activeStep}
              display={k === 3 ? `${activeStep}` : "final"}
              min={stepParam.min}
              max={stepParam.max}
              step={stepParam.step}
              disabled={k !== 3}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("k-means"));
                setStep(value);
              }}
              hint={
                k === 3
                  ? stepParam.hint ?? ""
                  : "Lloyd stepping is shown for the committed k = 3 animation; the wrong-k cases are shown at their converged final state."
              }
            />
          </div>

          <StatGrid
            direction="col"
            caption={note}
            stats={[
              {
                label: "k",
                value: `${k}`,
                hue: "var(--viz-param)",
                note: k === 3 ? "the honest grouping here" : k === 2 ? "too few" : "too many",
              },
              {
                label: "inertia",
                value: state.inertia.toFixed(2),
                hue: k === 3 ? "var(--viz-prediction)" : "var(--viz-error)",
                note: "within-cluster squared distance",
              },
              {
                label: "centroids",
                value: `${state.centroids.length}`,
                hue: "var(--viz-truth)",
                note: activeStep === 0 ? "before averaging" : "after averaging",
              },
            ]}
          />

          <figure>
            <figcaption className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              Fixture readout
            </figcaption>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
              {[wrongK, goodK, tooManyK].map((row) => (
                <div key={row.k} className="rounded-lg border border-line bg-sunken px-3 py-2">
                  <div className="text-ink-faint">k = {row.k}</div>
                  <div className="mt-1 text-[13px] tabular-nums text-ink">{row.inertia.toFixed(2)}</div>
                  <div className="mt-1 text-[10px] text-ink-faint">inertia</div>
                </div>
              ))}
            </div>
          </figure>
        </div>

        <div className="mt-6 lg:mt-0">
          <KMeansField
            points={kMeansPoints}
            centroids={state.centroids}
            labels={state.labels}
            domain={kMeansDomain}
            yDomain={kMeansYDomain}
            width={600}
            height={500}
            previousCentroids={previousCentroids}
            ariaLabel={`k-means on three blobs with k = ${k}; inertia ${state.inertia.toFixed(2)}; ${k === 3 ? `Lloyd step ${activeStep}.` : "converged final partition."}`}
          />
        </div>
      </div>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  hint,
  disabled,
  ticks,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  hint: string;
  disabled?: boolean;
  ticks?: { value: number; label: string }[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-45"
      />
      {ticks && (
        <div className="flex justify-between font-mono text-[10px] text-ink-faint">
          {ticks.map((tick) => (
            <span key={tick.value}>{tick.label}</span>
          ))}
        </div>
      )}
      <p className="text-xs leading-relaxed text-ink-faint">{hint}</p>
    </div>
  );
}
