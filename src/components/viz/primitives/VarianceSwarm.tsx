"use client";

import { useMemo } from "react";
import { hueMark } from "./shared";

type SwarmMode = "swarm" | "envelope" | "distribution";

/**
 * CONNECT/CARRY — Variance swarm (visual-standards audit).
 *
 * Repeated samples or fitted models accumulate as a point swarm, confidence
 * envelope, or binned distribution — variance made visible, not a single line.
 */
export function VarianceSwarm({
  samples,
  mode = "swarm",
  width = 400,
  height = 200,
  xDomain = [0, 1],
  yDomain = [0, 1],
  ariaLabel,
}: {
  /** Each sample is a series of [x, y] points in normalized coordinates. */
  samples: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
  mode?: SwarmMode;
  width?: number;
  height?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  ariaLabel: string;
}) {
  const scales = useMemo(() => {
    const [x0, x1] = xDomain;
    const [y0, y1] = yDomain;
    return {
      sx: (x: number) => ((x - x0) / (x1 - x0)) * width,
      sy: (y: number) => height - ((y - y0) / (y1 - y0)) * height,
      x0,
      x1,
      y0,
      y1,
    };
  }, [xDomain, yDomain, width, height]);

  const { sx, sy, x0, x1, y0, y1 } = scales;

  const envelope = useMemo(() => {
    if (mode !== "envelope" || samples.length === 0) return null;
    const cols = 40;
    const toSy = (y: number) => height - ((y - y0) / (y1 - y0)) * height;
    const mins: number[] = [];
    const maxs: number[] = [];
    for (let c = 0; c <= cols; c++) {
      const x = x0 + ((x1 - x0) * c) / cols;
      const ys: number[] = [];
      for (const sample of samples) {
        let best = NaN;
        let bestDist = Infinity;
        for (const [px, py] of sample) {
          const d = Math.abs(px - x);
          if (d < bestDist) {
            bestDist = d;
            best = py;
          }
        }
        if (!Number.isNaN(best)) ys.push(best);
      }
      if (ys.length) {
        mins.push(toSy(Math.min(...ys)));
        maxs.push(toSy(Math.max(...ys)));
      }
    }
    if (!mins.length) return null;
    const top = mins
      .map((my, i) => `${i === 0 ? "M" : "L"} ${(i / cols) * width} ${my}`)
      .join(" ");
    const bottom = maxs
      .map((my, i) => `${i === 0 ? "M" : "L"} ${((cols - i) / cols) * width} ${my}`)
      .join(" ");
    return `${top} ${bottom.replace(/M/g, "L")} Z`;
  }, [mode, samples, x0, x1, y0, y1, width, height]);

  const histogram = useMemo(() => {
    if (mode !== "distribution" || samples.length === 0) return [];
    const bins = 12;
    const counts = new Array(bins).fill(0);
    for (const sample of samples) {
      const meanY =
        sample.reduce((s, [, y]) => s + y, 0) / Math.max(sample.length, 1);
      const bin = Math.min(
        bins - 1,
        Math.floor(((meanY - y0) / (y1 - y0)) * bins),
      );
      counts[bin]++;
    }
    const max = Math.max(...counts, 1);
    return counts.map((c, i) => ({
      x: (i / bins) * width,
      w: width / bins - 2,
      h: (c / max) * (height * 0.8),
    }));
  }, [mode, samples, y0, y1, width, height]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="overflow-visible"
      role="img"
      aria-label={ariaLabel}
    >
      {mode === "envelope" && envelope && (
        <path
          d={envelope}
          fill="var(--viz-prediction)"
          fillOpacity={0.15}
          stroke="var(--viz-prediction)"
          strokeWidth={1}
          strokeOpacity={0.4}
        />
      )}

      {mode === "distribution" &&
        histogram.map((bar, i) => (
          <rect
            key={i}
            x={bar.x + 1}
            y={height - bar.h - 8}
            width={bar.w}
            height={bar.h}
            fill="var(--viz-param)"
            fillOpacity={0.65}
            rx={2}
          />
        ))}

      {(mode === "swarm" || mode === "envelope") &&
        samples.map((sample, si) =>
          sample.map(([x, y], pi) => (
            <circle
              key={`${si}-${pi}`}
              cx={sx(x)}
              cy={sy(y)}
              r={mode === "swarm" ? 2.5 : 2}
              fill={hueMark(si % 2 === 0 ? "prediction" : "param")}
              fillOpacity={mode === "swarm" ? 0.35 : 0.25}
            />
          )),
        )}

      {mode === "swarm" && samples.length > 1 && (
        <line
          x1={0}
          y1={sy(samples[0]![0]![1])}
          x2={width}
          y2={sy(samples[0]![0]![1])}
          stroke="var(--viz-truth)"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
      )}
    </svg>
  );
}
