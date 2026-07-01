"use client";

import { StatGrid } from "@/components/viz/StatGrid";
import { KMeansField } from "@/components/viz/KMeansField";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { KMeansFrame } from "@content/exhibits/k-means/spine";
import {
  goodK,
  iterations,
  kMeansDomain,
  kMeansPoints,
  kMeansYDomain,
  stateForK,
  wrongK,
} from "@content/exhibits/k-means/experiment";

/**
 * The See-it graphic: one scatter, re-read as nearest-centroid assignment, mean update,
 * the wrong-k merge, and the oversplit case. The frame asserts k and Lloyd step; the same
 * points persist while only the centroids and regions change.
 */
export function KMeansStory() {
  const frame = useActiveFrame<KMeansFrame>();
  const k = frame?.k ?? 3;
  const step = frame?.step ?? 1;
  const state = stateForK(k, step);
  const previousCentroids = frame?.showTrails && k === 3 && step > 0 ? iterations[step - 1].centroids : undefined;

  const caption =
    k === 2
      ? "Wrong question: k = 2 merges two blobs"
      : k === 5
        ? "Too many centres: the blobs get subdivided"
        : step === 0
          ? "Assign to the nearest centroid"
          : "Average the assigned points and settle";

  const note =
    k === 2
      ? "One centroid is forced to serve two real groups."
      : k === 5
        ? "Inertia falls again, but by inventing extra centroids inside real blobs."
        : step === 0
          ? "Seeds placed; every point is coloured by its nearest centroid."
          : "One Lloyd update is enough on these clean, well-separated blobs.";

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {caption}
      </figcaption>
      <KMeansField
        points={kMeansPoints}
        centroids={state.centroids}
        labels={state.labels}
        domain={kMeansDomain}
        yDomain={kMeansYDomain}
        width={560}
        height={340}
        showRegions={frame?.showVoronoi ?? true}
        previousCentroids={previousCentroids}
        ariaLabel={
          k === 2
            ? "Three blobs forced into two nearest-centroid regions, visibly merging two groups."
            : k === 5
              ? "Three blobs split across five nearest-centroid regions, showing extra centroids inside real blobs."
              : step === 0
                ? "Three initial centroids claiming the nearest points around them."
                : "Three centroids settled into the three blobs after one Lloyd update."
        }
      />
      <StatGrid
        caption={note}
        stats={[
          {
            label: "k",
            value: `${k}`,
            hue: "var(--viz-param)",
            note: k === 3 ? "the honest grouping here" : k === 2 ? "too few centres" : "extra centres",
          },
          {
            label: "inertia",
            value: state.inertia.toFixed(2),
            hue: k === 3 ? "var(--viz-prediction)" : "var(--viz-error)",
            note: "within-cluster squared distance",
          },
          {
            label: "Δ inertia",
            value:
              k === 3
                ? "0.00"
                : `${state.inertia > goodK.inertia ? "+" : ""}${(state.inertia - goodK.inertia).toFixed(2)}`,
            hue: k === 3 ? "var(--viz-truth)" : "var(--viz-error)",
            note:
              k === 2
                ? "wrong k leaves the fit much looser"
                : "lower is not automatically more meaningful",
          },
        ]}
      />
    </figure>
  );
}
