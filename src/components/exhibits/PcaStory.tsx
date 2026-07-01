"use client";

import { useMemo } from "react";
import { Annotation, Axes, Plot } from "@/components/viz/Plot";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { PcaFrame } from "@content/exhibits/pca/spine";
import {
  pcaDomain,
  pcaFit,
  pcaPoints,
  pcaProjectionDomain,
  pcaProjectionStripYDomain,
  pcaProjections,
  pcaReconstruction1D,
  pcaReconstructionError1D,
  pcaYDomain,
} from "@content/exhibits/pca/experiment";
import {
  AxisArrow,
  CloudPoints,
  ExplainedVarianceBars,
  LinkLines,
  ProjectionDots,
  axisSegment,
  rawDirection,
} from "@/components/exhibits/PcaViz";

function ProjectionStrip() {
  const stripPoints = useMemo(
    () => pcaProjections.map((projection) => ({ pc1: projection.pc1, pc2: 0 })),
    [],
  );
  return (
    <Plot
      width={640}
      height={120}
      xDomain={pcaProjectionDomain}
      yDomain={pcaProjectionStripYDomain}
      ariaLabel="The same 100 points after projection onto PC1, collapsed onto a one-dimensional strip so each point keeps only one score."
    >
      <Axes />
      <line
        x1={64}
        x2={624}
        y1={48}
        y2={48}
        stroke="var(--viz-prediction)"
        strokeWidth={1.5}
        strokeOpacity={0.5}
        aria-hidden
      />
      <ProjectionDots points={stripPoints} />
      <Annotation
        at={{ x: pcaProjectionDomain[1] - 0.25, y: 0 }}
        dx={-6}
        dy={-16}
        label="one score per point"
        color="var(--accent)"
      />
    </Plot>
  );
}

export function PcaStory() {
  const frame = useActiveFrame<PcaFrame>();
  const stage = frame?.stage ?? "cloud";
  const variance1 = Math.round(pcaFit.explainedVarianceRatio[0] * 1000) / 10;
  const variance2 = Math.round(pcaFit.explainedVarianceRatio[1] * 1000) / 10;

  const pc1Segment = useMemo(() => {
    const direction = rawDirection(pcaFit.components[0], pcaFit.scale);
    return axisSegment(pcaFit.mean, direction, pcaDomain, pcaYDomain);
  }, []);

  const caption =
    stage === "cloud"
      ? "Raw cloud — correlated features"
      : stage === "axis"
        ? "PC1 axis — the longest spread"
        : stage === "projection"
          ? "1-D projection — every point becomes one score"
          : "Reconstruction loss — the thickness PC2 was carrying";

  const showAxis = stage !== "cloud";
  const showProjection = stage === "projection" || stage === "reconstruction";
  const showLoss = stage === "reconstruction";

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {caption}
      </figcaption>

      <Plot
        width={640}
        height={360}
        xDomain={pcaDomain}
        yDomain={pcaYDomain}
        ariaLabel={
          showLoss
            ? `The cloud reconstructed from PC1 alone. Dashed red links show the small miss left by dropping PC2; average squared reconstruction loss ${pcaReconstructionError1D.toFixed(3)}.`
            : showProjection
              ? "The cloud projected onto PC1. Blue points lie on the PC1 line; each is the shadow of an original point onto that axis."
              : showAxis
                ? `The first principal component drawn through the cloud, capturing ${variance1}% of the variance.`
                : "A correlated 2-D cloud before PCA, stretched mostly along one tilted direction."
        }
      >
        <Axes />
        <CloudPoints points={pcaPoints} opacity={showProjection ? 0.34 : 0.9} />
        {showProjection && (
          <>
            <LinkLines
              from={pcaPoints}
              to={pcaReconstruction1D}
              stroke={showLoss ? "var(--viz-error)" : "var(--viz-param)"}
              strokeDasharray={showLoss ? "4 4" : undefined}
              opacity={showLoss ? 0.78 : 0.4}
            />
            <CloudPoints
              points={pcaReconstruction1D}
              fill="var(--accent)"
              stroke="var(--surface-bg)"
              opacity={0.95}
              r={3.6}
            />
          </>
        )}
        {showAxis && (
          <>
            <AxisArrow
              start={pc1Segment.start}
              end={pc1Segment.end}
              color="var(--accent)"
              width={3}
              opacity={0.95}
            />
            <Annotation
              at={{ x: pc1Segment.end.x1, y: pc1Segment.end.x2 }}
              dx={18}
              dy={-12}
              label={`PC1 · ${variance1}%`}
              color="var(--accent)"
            />
          </>
        )}
        {showLoss && (
          <Annotation
            at={{ x: pcaReconstruction1D[10].x1, y: pcaReconstruction1D[10].x2 }}
            dx={18}
            dy={18}
            label="the discarded sliver"
            color="var(--viz-error-ink)"
          />
        )}
      </Plot>

      {showProjection && <ProjectionStrip />}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <StatGrid
          caption={
            stage === "cloud"
              ? "What this shape is hinting"
              : stage === "axis"
                ? "What PCA has found"
                : stage === "projection"
                  ? "What the compression keeps"
                  : "What the loss means"
          }
          stats={
            stage === "cloud"
              ? [
                  {
                    label: "dimensions",
                    value: "2",
                    hue: "var(--viz-param)",
                    note: "two measured features",
                  },
                  {
                    label: "shape",
                    value: "tilted oval",
                    hue: "var(--accent)",
                    note: "mostly one direction of spread",
                  },
                  {
                    label: "redundancy",
                    value: "high",
                    hue: "var(--viz-error)",
                    note: "the second axis is thin",
                  },
                ]
              : stage === "axis"
                ? [
                    {
                      label: "PC1",
                      value: `${variance1}%`,
                      hue: "var(--accent)",
                      note: "variance captured",
                    },
                    {
                      label: "PC2",
                      value: `${variance2}%`,
                      hue: "var(--viz-error)",
                      note: "the leftover thickness",
                    },
                    {
                      label: "rule",
                      value: "max spread",
                      hue: "var(--viz-param)",
                      note: "choose the longest axis first",
                    },
                  ]
                : stage === "projection"
                  ? [
                      {
                        label: "kept",
                        value: "PC1 only",
                        hue: "var(--accent)",
                        note: "one coordinate per point",
                      },
                      {
                        label: "dropped",
                        value: "PC2",
                        hue: "var(--viz-error)",
                        note: "the sideways thickness",
                      },
                      {
                        label: "compression",
                        value: "2 → 1",
                        hue: "var(--viz-param)",
                        note: "two numbers become one",
                      },
                    ]
                  : [
                      {
                        label: "kept variance",
                        value: `${variance1}%`,
                        hue: "var(--accent)",
                        note: "what survives in PC1",
                      },
                      {
                        label: "lost variance",
                        value: `${variance2}%`,
                        hue: "var(--viz-error)",
                        note: "what PC2 was carrying",
                      },
                      {
                        label: "recon loss",
                        value: pcaReconstructionError1D.toFixed(3),
                        hue: "var(--viz-param)",
                        note: "average squared miss",
                      },
                    ]
          }
        />
        <ExplainedVarianceBars
          ratios={pcaFit.explainedVarianceRatio}
          activeComponents={stage === "cloud" || stage === "axis" ? 2 : 1}
        />
      </div>
    </figure>
  );
}
