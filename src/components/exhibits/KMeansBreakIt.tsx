"use client";

import { useEffect, useMemo, useState } from "react";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { assignLabels, inertia } from "@/lib/models/k-means";
import { KMeansField } from "@/components/viz/KMeansField";
import {
  badInitK2,
  goodK,
  kMeansDomain,
  kMeansPoints,
  kMeansYDomain,
  wrongK,
} from "@content/exhibits/k-means/experiment";

type Mode = "wrong-k" | "bad-start";

/**
 * The interactive failure loop. One mode forces the wrong number of clusters; the other
 * starts both centroids in the same blob and repairs the bad initialisation in one Lloyd
 * update. Together they show the two distinct ways k-means can go wrong before the
 * outlier card in the field guide widens the envelope.
 */
export function KMeansBreakIt() {
  const [mode, setMode] = useState<Mode>("wrong-k");

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Which k-means failure to trigger"
          className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
        >
          {([
            ["Wrong k", "wrong-k"],
            ["Bad start", "bad-start"],
          ] as const).map(([label, value]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-full px-3.5 py-1 transition-colors ${
                mode === value
                  ? "bg-accent text-accent-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] text-ink-faint">
          {mode === "wrong-k"
            ? "failure ① — too few centroids merge real groups"
            : "failure ② — bad seeds take a crooked path"}
        </p>
      </div>
      {mode === "wrong-k" ? <WrongKLoop /> : <BadStartLoop />}
    </div>
  );
}

function WrongKLoop() {
  const [position, setPosition] = useState<0 | 1>(0);
  const k = position === 0 ? 3 : 2;
  const state = k === 3 ? goodK : wrongK;
  const broken = k === 2;

  useEffect(() => {
    if (broken) reportTaskEvent("k-means:wrong-k");
  }, [broken]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {broken ? (
          <Guidance
            tone="broken"
            kicker="Symptom · it broke"
            body={
              <>
                The data still has three blobs, but with only{" "}
                <span className="font-medium text-[var(--viz-error-ink)]">two centroids</span> one
                of them has to merge two real groups. The fit loosens visibly and inertia jumps
                from <span className="font-medium text-ink">{goodK.inertia.toFixed(2)}</span> to{" "}
                <span className="font-medium text-[var(--viz-error-ink)]">
                  {wrongK.inertia.toFixed(2)}
                </span>
                .
              </>
            }
            foot={
              <>
                <span className="font-medium text-ink">Diagnose:</span> k is too small for the
                structure in the data. <span className="font-medium text-ink">Repair:</span> raise
                k and compare candidates with domain judgement, not inertia alone.
              </>
            }
          />
        ) : (
          <Guidance
            tone="trigger"
            kicker="Trigger it"
            body={
              <>
                Start from the honest grouping at <span className="font-medium text-ink">k = 3</span>.
                Now drag the control down to <span className="font-medium text-ink">k = 2</span> and
                force three blobs to share only two centres.
              </>
            }
            foot="Nothing in Lloyd's loop can rescue a wrong k; the algorithm will faithfully solve the wrong question."
          />
        )}

        <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-4">
          <div className="flex items-baseline justify-between">
            <label htmlFor="break-kmeans-k" className="text-sm font-medium text-ink">
              Clusters (k)
            </label>
            <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{k}</span>
          </div>
          <input
            id="break-kmeans-k"
            type="range"
            min={0}
            max={1}
            step={1}
            value={position}
            onChange={(e) => {
              whenHydrated(() => useLearner.getState().recordPractice("k-means"));
              setPosition(Number(e.target.value) as 0 | 1);
            }}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between font-mono text-[10px] text-ink-faint">
            <span>k = 3 · one centre per blob</span>
            <span>k = 2 · merge them</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Readout
            label="k"
            value={`${k}`}
            hue="var(--viz-param)"
            hint={broken ? "too few centroids" : "the honest count"}
          />
          <Readout
            label="inertia"
            value={state.inertia.toFixed(2)}
            hue={broken ? "var(--viz-error)" : "var(--viz-prediction)"}
            hint={broken ? "looser fit, merged groups" : "tightest meaningful fit here"}
          />
        </div>
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
          ariaLabel={
            broken
              ? "Three blobs forced into two nearest-centroid regions, merging two real groups."
              : "Three blobs with one centroid in each cluster."
          }
        />
      </div>
    </div>
  );
}

function BadStartLoop() {
  const [repaired, setRepaired] = useState(false);
  const initial = useMemo(() => {
    const labels = assignLabels(kMeansPoints, badInitK2.init);
    return {
      labels,
      centroids: badInitK2.init,
      inertia: inertia(kMeansPoints, labels, badInitK2.init),
    };
  }, []);
  const state = repaired ? badInitK2 : initial;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {repaired ? (
          <Guidance
            tone="broken"
            kicker="Repair loop"
            body={
              <>
                One Lloyd update repaired the bad start: a centroid crossed the gap to the far
                blob and inertia fell from{" "}
                <span className="font-medium text-ink">{initial.inertia.toFixed(2)}</span> to{" "}
                <span className="font-medium text-[var(--viz-prediction-ink)]">
                  {badInitK2.inertia.toFixed(2)}
                </span>
                .
              </>
            }
            foot={
              <>
                <span className="font-medium text-ink">Diagnose:</span> both seeds began on the
                same side of the dataset, so the first partition was lopsided.{" "}
                <span className="font-medium text-ink">Repair:</span> spread the seeds out or use
                multiple restarts / k-means++.
              </>
            }
          />
        ) : (
          <Guidance
            tone="trigger"
            kicker="Trigger it"
            body={
              <>
                Both centroids start in the two right-hand blobs, leaving the far-left blob with
                no seed at all. Click <span className="font-medium text-ink">Repair one Lloyd step</span>{" "}
                and watch one centroid get yanked across the gap.
              </>
            }
            foot="This fixture is kind to k-means: the bad start repairs quickly. On messier data, bad seeds can trap the algorithm in a genuinely worse local optimum."
          />
        )}

        <div className="flex flex-col gap-3 rounded-lg border border-line bg-sunken p-4">
          <button
            type="button"
            onClick={() => {
              whenHydrated(() => useLearner.getState().recordPractice("k-means"));
              setRepaired((value) => !value);
            }}
            className="self-start rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            {repaired ? "Reset bad start" : "Repair one Lloyd step"}
          </button>
          <p className="font-mono text-[11px] text-ink-faint">
            k = 2 fixed · {repaired ? "after averaging" : "before averaging"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Readout
            label="inertia"
            value={state.inertia.toFixed(2)}
            hue={repaired ? "var(--viz-prediction)" : "var(--viz-error)"}
            hint={repaired ? "repair complete" : "bad start, loose fit"}
          />
          <Readout
            label="seed spread"
            value={repaired ? "repaired" : "bad"}
            hue={repaired ? "var(--viz-truth)" : "var(--viz-error)"}
            hint={repaired ? "one centroid crossed the gap" : "both seeds began on one side"}
          />
        </div>
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
          previousCentroids={repaired ? badInitK2.init : undefined}
          ariaLabel={
            repaired
              ? "A repaired k-means fit after one Lloyd update from a bad two-centroid start."
              : "A bad k-means start with both centroids on the same side of the data."
          }
        />
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  hue,
  hint,
}: {
  label: string;
  value: string;
  hue: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-sunken p-3">
      <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">{label}</div>
      <div className="mt-0.5 font-mono text-2xl tabular-nums" style={{ color: hue }}>
        {value}
      </div>
      <div className="mt-0.5 text-[11px] leading-tight text-ink-faint">{hint}</div>
    </div>
  );
}

function Guidance({
  tone,
  kicker,
  body,
  foot,
}: {
  tone: "trigger" | "broken";
  kicker: string;
  body: React.ReactNode;
  foot: React.ReactNode;
}) {
  return (
    <div>
      <p
        className={`font-mono text-[11px] tracking-[0.16em] uppercase ${
          tone === "broken" ? "text-[var(--viz-error-ink)]" : "text-accent"
        }`}
      >
        {kicker}
      </p>
      <p className="mt-2 leading-relaxed text-ink">{body}</p>
      <p className="mt-3 leading-relaxed text-ink-muted">{foot}</p>
    </div>
  );
}
