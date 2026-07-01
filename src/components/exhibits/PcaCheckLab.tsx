"use client";

import { useMemo, useState } from "react";
import { Annotation, Axes, Plot } from "@/components/viz/Plot";
import { pcaDomain, pcaFit, pcaPoints, pcaReconstruction1D, pcaYDomain } from "@content/exhibits/pca/experiment";
import { AxisArrow, CloudPoints, LinkLines, axisSegment, rawDirection } from "@/components/exhibits/PcaViz";

const STAGES = [
  { id: "raw", label: "Raw cloud", blurb: "before compression" },
  { id: "pc1", label: "PC1 only", blurb: "one score per point" },
  { id: "both", label: "PC1 + PC2", blurb: "lossless rotation" },
] as const;

export function PcaCheckLab() {
  const [stageId, setStageId] = useState<(typeof STAGES)[number]["id"]>("pc1");
  const stage = STAGES.find((entry) => entry.id === stageId)!;

  const pc1Segment = useMemo(() => {
    const direction = rawDirection(pcaFit.components[0], pcaFit.scale);
    return axisSegment(pcaFit.mean, direction, pcaDomain, pcaYDomain);
  }, []);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Answer against the compressed cloud
      </figcaption>
      <div
        role="group"
        aria-label="Which PCA view to inspect"
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
      <Plot
        width={460}
        height={360}
        xDomain={pcaDomain}
        yDomain={pcaYDomain}
        ariaLabel={
          stageId === "raw"
            ? "The original correlated cloud."
            : stageId === "pc1"
              ? "The cloud reconstructed from PC1 alone, with dashed links to the original points."
              : "The cloud reconstructed from both principal components."
        }
      >
        <Axes />
        {stageId === "both" ? (
          <CloudPoints
            points={pcaPoints}
            fill="none"
            stroke="var(--viz-truth)"
            opacity={0.8}
            r={4.4}
          />
        ) : (
          <CloudPoints points={pcaPoints} opacity={stageId === "pc1" ? 0.34 : 0.9} />
        )}
        {stageId !== "raw" && (
          <>
            <AxisArrow start={pc1Segment.start} end={pc1Segment.end} color="var(--accent)" />
            {stageId === "pc1" && (
              <>
                <LinkLines
                  from={pcaPoints}
                  to={pcaReconstruction1D}
                  stroke="var(--viz-error)"
                  strokeDasharray="4 4"
                  opacity={0.76}
                />
                <CloudPoints
                  points={pcaReconstruction1D}
                  fill="var(--accent)"
                  stroke="var(--surface-bg)"
                  opacity={0.96}
                  r={3.6}
                />
              </>
            )}
            {stageId === "both" && (
              <CloudPoints
                points={pcaPoints}
                fill="var(--accent)"
                stroke="var(--surface-bg)"
                opacity={0.96}
                r={3.4}
              />
            )}
            <Annotation
              at={{ x: pc1Segment.end.x1, y: pc1Segment.end.x2 }}
              dx={16}
              dy={-12}
              label={stageId === "pc1" ? "PC1 only" : "rotated basis"}
              color="var(--accent)"
            />
          </>
        )}
      </Plot>
      <p className="mt-2 text-[11px] text-ink-faint">{stage.blurb}</p>
      <div className="mt-3 flex justify-between font-mono text-xs tabular-nums">
        <span className="text-ink-muted">PC1 {Math.round(pcaFit.explainedVarianceRatio[0] * 100)}%</span>
        <span style={{ color: "var(--accent)" }}>
          {stageId === "pc1" ? "1-D reconstruction" : stageId === "both" ? "2-D exact" : "raw points"}
        </span>
        <span className="text-ink-faint">PC2 {Math.round(pcaFit.explainedVarianceRatio[1] * 100)}%</span>
      </div>
    </figure>
  );
}
