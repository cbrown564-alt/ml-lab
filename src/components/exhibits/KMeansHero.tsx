"use client";

import { useEffect, useState } from "react";
import { KMeansField } from "@/components/viz/KMeansField";
import { goodK, kMeansDomain, kMeansPoints, kMeansYDomain } from "@content/exhibits/k-means/experiment";

/**
 * The specimen hero: the thesis in one frame. No labels, just three compact blobs and
 * three centroids settled into them, with the nearest-centroid regions tinted behind.
 */
export function KMeansHero() {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 260);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          k-means
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          three centroids settle into the three blobs
        </span>
      </figcaption>
      <div className="px-3 py-3">
        <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
          <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
            no labels · geometry only
          </span>
          <span className="font-mono text-[11px] tabular-nums text-[var(--viz-prediction-ink)]">
            k = 3 · inertia {goodK.inertia.toFixed(2)}
          </span>
        </div>
        <div style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
          <KMeansField
            points={kMeansPoints}
            centroids={goodK.centroids}
            labels={goodK.labels}
            domain={kMeansDomain}
            yDomain={kMeansYDomain}
            width={1200}
            height={360}
            ariaLabel="Three centroids settled into three unlabeled blobs, with coloured nearest-centroid regions behind them."
          />
        </div>
      </div>
    </figure>
  );
}
