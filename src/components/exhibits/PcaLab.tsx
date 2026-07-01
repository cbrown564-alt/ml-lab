"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Annotation, Axes, Plot } from "@/components/viz/Plot";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActHandoffFrame } from "@/components/exhibits/ActHandoffContext";
import type { PcaFrame } from "@content/exhibits/pca/spine";
import {
  pcaComponentToggles,
  pcaDomain,
  pcaFit,
  pcaPoints,
  pcaReconstruction1D,
  pcaReconstruction2D,
  pcaReconstructionError1D,
  pcaScenario,
  pcaYDomain,
} from "@content/exhibits/pca/experiment";
import {
  AxisArrow,
  CloudPoints,
  ExplainedVarianceBars,
  LinkLines,
  axisSegment,
  rawDirection,
} from "@/components/exhibits/PcaViz";

export function PcaLab() {
  const storyFrame = useActHandoffFrame<PcaFrame>();
  const appliedHandoff = useRef(false);
  const [handoffVisible, setHandoffVisible] = useState(false);
  const [components, setComponents] = useState<1 | 2>(1);

  useEffect(() => {
    if (appliedHandoff.current || !storyFrame || storyFrame.stage === "cloud") return;
    appliedHandoff.current = true;
    setComponents(storyFrame.components);
    setHandoffVisible(true);
  }, [storyFrame]);

  const reconstruction = components === 1 ? pcaReconstruction1D : pcaReconstruction2D;
  const captured =
    pcaFit.explainedVarianceRatio[0] +
    (components === 2 ? pcaFit.explainedVarianceRatio[1] : 0);
  const lost = Math.max(0, 1 - captured);
  const error = components === 1 ? pcaReconstructionError1D : 0;

  const pc1Segment = useMemo(() => {
    const direction = rawDirection(pcaFit.components[0], pcaFit.scale);
    return axisSegment(pcaFit.mean, direction, pcaDomain, pcaYDomain);
  }, []);

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      {handoffVisible && storyFrame && (
        <p
          className="mb-4 rounded-lg border px-3 py-2 font-mono text-[11px] leading-relaxed tracking-wide"
          style={{
            borderColor: "color-mix(in oklab, var(--viz-param) 35%, var(--line))",
            background: "color-mix(in oklab, var(--viz-param) 8%, var(--surface-raised))",
            color: "var(--viz-param-ink)",
          }}
          role="status"
        >
          Continuing from See it — {storyFrame.components === 1 ? "keeping only PC1" : "keeping both components"}
        </p>
      )}

      <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{pcaScenario.prompt}</p>

          <div
            role="group"
            aria-label="How many principal components to keep"
            className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
          >
            {pcaComponentToggles.map((toggle) => (
              <button
                key={toggle.id}
                type="button"
                aria-pressed={components === toggle.components}
                onClick={() => setComponents(toggle.components)}
                className={`rounded-full px-4 py-1 transition-colors ${
                  components === toggle.components
                    ? "bg-accent text-accent-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {toggle.label}
              </button>
            ))}
          </div>

          <StatGrid
            direction="col"
            caption={
              components === 1
                ? "PC1 only — the cloud becomes a line with a small miss"
                : "PC1 + PC2 — exact reconstruction"
            }
            stats={[
              {
                label: "variance kept",
                value: `${(captured * 100).toFixed(1)}%`,
                hue: "var(--accent)",
                note: components === 1 ? "one coordinate per point" : "all coordinates restored",
              },
              {
                label: "variance lost",
                value: `${(lost * 100).toFixed(1)}%`,
                hue: "var(--viz-error)",
                note: components === 1 ? "the thickness along PC2" : "none",
              },
              {
                label: "recon loss",
                value: error.toFixed(3),
                hue: "var(--viz-param)",
                note: "average squared miss in standardized space",
              },
            ]}
          />

          <ExplainedVarianceBars
            ratios={pcaFit.explainedVarianceRatio}
            activeComponents={components}
          />
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={720}
            height={520}
            xDomain={pcaDomain}
            yDomain={pcaYDomain}
            ariaLabel={
              components === 1
                ? `The cloud reconstructed from PC1 alone. Blue points lie on the PC1 axis and dashed links show the small reconstruction miss from dropping PC2.`
                : `The cloud reconstructed from PC1 and PC2 together. The blue reconstruction points sit directly on top of the original observations.`
            }
          >
            <Axes />
            {components === 1 ? (
              <CloudPoints points={pcaPoints} opacity={0.34} />
            ) : (
              <CloudPoints
                points={pcaPoints}
                fill="none"
                stroke="var(--viz-truth)"
                opacity={0.85}
                r={4.5}
              />
            )}
            {components === 1 && (
              <>
                <AxisArrow
                  start={pc1Segment.start}
                  end={pc1Segment.end}
                  color="var(--accent)"
                  width={3}
                />
                <LinkLines
                  from={pcaPoints}
                  to={reconstruction}
                  stroke="var(--viz-error)"
                  strokeDasharray="4 4"
                  opacity={0.76}
                />
                <Annotation
                  at={{ x: pc1Segment.end.x1, y: pc1Segment.end.x2 }}
                  dx={16}
                  dy={-12}
                  label="PC1 only"
                  color="var(--accent)"
                />
              </>
            )}
            <CloudPoints
              points={reconstruction}
              fill="var(--accent)"
              stroke="var(--surface-bg)"
              opacity={0.96}
              r={3.6}
            />
            {components === 2 && (
              <Annotation
                at={{ x: reconstruction[18].x1, y: reconstruction[18].x2 }}
                dx={18}
                dy={-16}
                label="exactly on top of the originals"
                color="var(--accent)"
              />
            )}
          </Plot>
        </div>
      </div>
    </div>
  );
}
