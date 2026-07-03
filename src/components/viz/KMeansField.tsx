"use client";

import { useMemo } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { assignLabels, type Centroid, type ClusterPoint } from "@/lib/models/k-means";
import { boundedVoronoiCells } from "@/lib/viz/voronoi";

export type KMeansDisplayPoint = ClusterPoint & { label?: number };

const CLUSTER_COLORS = [
  { fill: "var(--viz-prediction)", ink: "var(--viz-prediction-ink)" },
  { fill: "var(--viz-param)", ink: "var(--viz-param-ink)" },
  { fill: "var(--viz-truth)", ink: "var(--viz-truth-ink)" },
  { fill: "var(--viz-neutral)", ink: "var(--viz-neutral-ink)" },
  { fill: "var(--viz-error)", ink: "var(--viz-error-ink)" },
] as const;

const colorAt = (i: number) => CLUSTER_COLORS[i % CLUSTER_COLORS.length];

export function KMeansField({
  points,
  centroids,
  labels,
  domain,
  yDomain,
  width = 560,
  height = 360,
  ariaLabel,
  showRegions = true,
  previousCentroids,
  centroidLabelPrefix = "μ",
}: {
  points: KMeansDisplayPoint[];
  centroids: Centroid[];
  labels?: number[];
  domain: [number, number];
  yDomain: [number, number];
  width?: number;
  height?: number;
  ariaLabel: string;
  showRegions?: boolean;
  previousCentroids?: Centroid[];
  centroidLabelPrefix?: string;
}) {
  const assignments = useMemo(
    () => labels ?? assignLabels(points, centroids),
    [centroids, labels, points],
  );

  return (
    <Plot width={width} height={height} xDomain={domain} yDomain={yDomain} ariaLabel={ariaLabel}>
      {showRegions && <NearestRegionLayer centroids={centroids} />}
      <Axes />
      {previousCentroids && <CentroidTrailLayer from={previousCentroids} to={centroids} />}
      <PointLayer points={points} labels={assignments} />
      <CentroidLayer centroids={centroids} prefix={centroidLabelPrefix} />
    </Plot>
  );
}

function NearestRegionLayer({ centroids }: { centroids: Centroid[] }) {
  const { x, y } = usePlot();
  const [x0, x1] = x.domain;
  const [y0, y1] = y.domain;
  const cells = useMemo(() => {
    const sites = centroids.map((c) => ({ x: c.x1, y: c.x2 }));
    const polygons = boundedVoronoiCells(sites, { x0, x1, y0, y1 });
    return polygons.map((poly, label) => ({
      label,
      d:
        poly.length >= 3
          ? poly
              .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.x).toFixed(2)} ${y(p.y).toFixed(2)}`)
              .join(" ") + " Z"
          : null,
    }));
  }, [centroids, x, x0, x1, y, y0, y1]);

  return (
    <g aria-hidden>
      {cells.map((cell) =>
        cell.d ? (
          <path
            key={cell.label}
            d={cell.d}
            fill={colorAt(cell.label).fill}
            fillOpacity={0.13}
            stroke={colorAt(cell.label).fill}
            strokeOpacity={0.22}
            strokeWidth={0.75}
          />
        ) : null,
      )}
    </g>
  );
}

function PointLayer({
  points,
  labels,
}: {
  points: KMeansDisplayPoint[];
  labels: number[];
}) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {points.map((point, i) => {
        const color = colorAt(labels[i]);
        return (
          <circle
            key={i}
            cx={x(point.x1)}
            cy={y(point.x2)}
            r={4.5}
            fill={color.fill}
            stroke="var(--surface-bg)"
            strokeWidth={1.25}
            fillOpacity={0.92}
          />
        );
      })}
    </g>
  );
}

function CentroidTrailLayer({
  from,
  to,
}: {
  from: Centroid[];
  to: Centroid[];
}) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {to.map((centroid, i) => {
        const prev = from[i];
        if (!prev) return null;
        const color = colorAt(i);
        return (
          <g key={i}>
            <line
              x1={x(prev.x1)}
              y1={y(prev.x2)}
              x2={x(centroid.x1)}
              y2={y(centroid.x2)}
              stroke={color.ink}
              strokeWidth={2}
              strokeDasharray="4 4"
              strokeOpacity={0.8}
            />
            <circle
              cx={x(prev.x1)}
              cy={y(prev.x2)}
              r={6}
              fill="none"
              stroke={color.ink}
              strokeWidth={1.5}
              strokeOpacity={0.45}
            />
          </g>
        );
      })}
    </g>
  );
}

function CentroidLayer({
  centroids,
  prefix,
}: {
  centroids: Centroid[];
  prefix: string;
}) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {centroids.map((centroid, i) => {
        const color = colorAt(i);
        const cx = x(centroid.x1);
        const cy = y(centroid.x2);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={9.5} fill="var(--surface-bg)" stroke={color.ink} strokeWidth={2.5} />
            <path
              d={`M ${cx - 4.2} ${cy - 4.2} L ${cx + 4.2} ${cy + 4.2} M ${cx - 4.2} ${cy + 4.2} L ${cx + 4.2} ${cy - 4.2}`}
              stroke={color.ink}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <text
              x={cx + 11}
              y={cy - 11}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill={color.ink}
            >
              {prefix}
              {i + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
}
