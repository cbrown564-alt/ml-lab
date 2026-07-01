"use client";

import { useMemo, useState } from "react";
import { Annotation, Axes, Plot } from "@/components/viz/Plot";
import { StatGrid } from "@/components/viz/StatGrid";
import { pcaDomain, pcaFit, pcaPoints, pcaRawFit, pcaYDomain } from "@content/exhibits/pca/experiment";
import { AxisArrow, CloudPoints, axisSegment, rawDirection } from "@/components/exhibits/PcaViz";

type Mode = "raw" | "standardised";

function loadingLabel(x1: number, x2: number): string {
  return `${x1.toFixed(2)}·x1 + ${x2.toFixed(2)}·x2`;
}

export function PcaBreakIt() {
  const [mode, setMode] = useState<Mode>("raw");
  const fit = mode === "raw" ? pcaRawFit : pcaFit;
  const ghost = mode === "raw" ? pcaFit : pcaRawFit;

  const activeSegment = useMemo(() => {
    const direction = rawDirection(fit.components[0], fit.scale);
    return axisSegment(fit.mean, direction, pcaDomain, pcaYDomain);
  }, [fit]);
  const ghostSegment = useMemo(() => {
    const direction = rawDirection(ghost.components[0], ghost.scale);
    return axisSegment(ghost.mean, direction, pcaDomain, pcaYDomain);
  }, [ghost]);

  const broken = mode === "raw";
  const activeColor = broken ? "var(--viz-error-ink)" : "var(--accent)";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance broken={broken} />

          <div
            role="group"
            aria-label="Whether PCA is fit on raw or standardised features"
            className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
          >
            {(
              [
                ["raw", "Raw units"],
                ["standardised", "Standardised first"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={`rounded-full px-4 py-1 transition-colors ${
                  mode === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <StatGrid
            direction="col"
            caption={broken ? "Raw variance is skewing the geometry" : "Shared structure is finally visible"}
            stats={[
              {
                label: "PC1 variance",
                value: `${(fit.explainedVarianceRatio[0] * 100).toFixed(1)}%`,
                hue: activeColor,
                note: broken ? "inflated by the large x1 scale" : "capturing the shared tilt honestly",
              },
              {
                label: "PC1 loadings",
                value: loadingLabel(fit.components[0].x1, fit.components[0].x2),
                hue: "var(--viz-param)",
                note: broken ? "nearly the x1 axis" : "an even blend of both features",
              },
              {
                label: "compare ghost",
                value: loadingLabel(ghost.components[0].x1, ghost.components[0].x2),
                hue: "var(--ink-muted)",
                note: broken ? "what the standardised axis would be" : "the raw-units axis you just repaired",
              },
            ]}
          />
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={720}
            height={500}
            xDomain={pcaDomain}
            yDomain={pcaYDomain}
            ariaLabel={
              broken
                ? "PCA fit on raw units. The first principal component is pulled toward the large-scale x1 axis; a faint ghost line shows the standardized fit the raw units are hiding."
                : "PCA fit after standardizing. The first principal component now follows the cloud's shared tilt; a faint ghost line shows the misleading raw-units axis."
            }
          >
            <Axes />
            <CloudPoints points={pcaPoints} />
            <AxisArrow
              start={ghostSegment.start}
              end={ghostSegment.end}
              color="var(--ink-muted)"
              width={2.1}
              opacity={0.35}
            />
            <AxisArrow
              start={activeSegment.start}
              end={activeSegment.end}
              color={activeColor}
              width={3.2}
            />
            <Annotation
              at={{ x: activeSegment.end.x1, y: activeSegment.end.x2 }}
              dx={16}
              dy={-10}
              label={broken ? "raw-units PC1" : "standardised PC1"}
              color={activeColor}
            />
          </Plot>
        </div>
      </div>
    </div>
  );
}

function Guidance({ broken }: { broken: boolean }) {
  if (!broken) {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
          Repaired ✓
        </p>
        <p className="mt-2 leading-relaxed text-ink">
          Standardising first gives both features a fair vote. Now PC1 follows the{" "}
          <span className="font-medium text-accent">shared tilt of the cloud</span> instead of
          hugging the biggest-unit axis.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> if the original variances are
          themselves the thing you care about, you may choose not to standardize. But when
          the units are arbitrary, raw covariance lets units masquerade as structure.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">
        Symptom · it broke
      </p>
      <p className="mt-2 leading-relaxed text-ink">
        On raw units, PCA says the first component is almost entirely{" "}
        <span className="font-medium text-[var(--viz-error-ink)]">x1</span>. The large-scale
        feature has bullied the covariance matrix into calling its axis &quot;the most
        important direction.&quot;
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Diagnose:</span> PCA is not immune to units.{" "}
        <span className="font-medium text-ink">Repair:</span> switch to{" "}
        <span className="font-medium">Standardised first</span> and watch PC1 rotate back to the
        cloud itself.
      </p>
    </div>
  );
}
