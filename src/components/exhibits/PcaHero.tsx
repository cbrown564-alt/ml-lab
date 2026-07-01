"use client";

import { useEffect, useMemo, useState } from "react";
import { Annotation, Axes, Plot } from "@/components/viz/Plot";
import { pcaDomain, pcaFit, pcaPoints, pcaYDomain } from "@content/exhibits/pca/experiment";
import { AxisArrow, CloudPoints, axisSegment, rawDirection } from "@/components/exhibits/PcaViz";

/**
 * The specimen hero — the whole PCA thesis in one frame: a correlated cloud and the
 * first principal axis that explains almost all of it.
 */
export function PcaHero() {
  const [reveal, setReveal] = useState(0);
  const variance = Math.round(pcaFit.explainedVarianceRatio[0] * 1000) / 10;

  const pc1Segment = useMemo(() => {
    const direction = rawDirection(pcaFit.components[0], pcaFit.scale);
    return axisSegment(pcaFit.mean, direction, pcaDomain, pcaYDomain);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const timer = window.setTimeout(() => setReveal(1), 320);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Principal component analysis
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          PC1 captures {variance}% of the cloud
        </span>
      </figcaption>
      <div className="px-3 py-3">
        <Plot
          width={1200}
          height={360}
          xDomain={pcaDomain}
          yDomain={pcaYDomain}
          ariaLabel={`A correlated 2-D cloud with the first principal component drawn through it. PC1 follows the cloud's longest direction and captures ${variance}% of the variance.`}
        >
          <Axes />
          <CloudPoints points={pcaPoints} />
          <g style={{ opacity: reveal, transition: "opacity 560ms ease" }}>
            <AxisArrow
              start={pc1Segment.start}
              end={pc1Segment.end}
              color="var(--accent)"
              width={3.1}
            />
            <Annotation
              at={{ x: pc1Segment.end.x1, y: pc1Segment.end.x2 }}
              dx={18}
              dy={-10}
              label={`PC1 · ${variance}% variance`}
              color="var(--accent)"
            />
          </g>
        </Plot>
      </div>
    </figure>
  );
}
