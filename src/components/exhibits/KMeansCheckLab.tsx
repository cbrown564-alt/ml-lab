"use client";

import { useState } from "react";
import { KMeansField } from "@/components/viz/KMeansField";
import { goodK, kMeansDomain, kMeansPoints, kMeansYDomain, tooManyK, wrongK } from "@content/exhibits/k-means/experiment";

const STAGES = [
  {
    id: "wrong",
    label: "k = 2",
    blurb: "too few centroids — two blobs are merged",
    state: wrongK,
    hue: "var(--viz-error)",
  },
  {
    id: "good",
    label: "k = 3",
    blurb: "the honest grouping — one centroid per blob",
    state: goodK,
    hue: "var(--viz-prediction)",
  },
  {
    id: "extra",
    label: "k = 5",
    blurb: "too many centroids — real blobs get subdivided",
    state: tooManyK,
    hue: "var(--viz-param)",
  },
] as const;

/**
 * The compact live instrument pinned beside Explain it: the same points under three
 * values of k, so the learner answers the check against a running clustering rather than
 * from memory.
 */
export function KMeansCheckLab() {
  const [stageId, setStageId] = useState<(typeof STAGES)[number]["id"]>("good");
  const stage = STAGES.find((entry) => entry.id === stageId)!;

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        The same points, three values of k
      </figcaption>
      <div
        role="group"
        aria-label="k-means regime"
        className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs"
      >
        {STAGES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={stageId === entry.id}
            onClick={() => setStageId(entry.id)}
            className={`rounded-full px-3 py-1 transition-colors ${
              stageId === entry.id ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <KMeansField
        points={kMeansPoints}
        centroids={stage.state.centroids}
        labels={stage.state.labels}
        domain={kMeansDomain}
        yDomain={kMeansYDomain}
        width={460}
        height={360}
        ariaLabel={`k-means on the same points with ${stage.label}; inertia ${stage.state.inertia.toFixed(2)}.`}
      />
      <p className="mt-2 text-[11px] text-ink-faint">{stage.blurb}</p>
      <div className="mt-3 flex justify-between font-mono text-xs tabular-nums">
        <span style={{ color: stage.hue }}>{stage.label}</span>
        <span className="text-ink-muted">inertia {stage.state.inertia.toFixed(2)}</span>
        <span className="text-ink-faint">{stage.state.centroids.length} centroids</span>
      </div>
    </figure>
  );
}
