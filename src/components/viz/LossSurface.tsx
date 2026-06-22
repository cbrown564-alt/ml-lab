"use client";

import { useEffect, useMemo, useRef } from "react";
import { lossSurfaceGrid } from "@/lib/viz/loss-surface";
import { linearScale } from "@/lib/viz/scale";
import type { DescentStep, Point } from "@/lib/models/linear-regression";

/**
 * The loss surface — the territory gradient descent walks (docs/06, B3/B6).
 * Every point of the map is a candidate line (slope across, intercept up);
 * shading is how wrong that line is, in quantized log bands so the bowl
 * reads like a topographic map. The descent trace is drawn on top in the
 * parameter hue: the abstract "rolling downhill" becomes a literal path.
 *
 * Heat is one canvas paint per dataset; the SVG overlay (path, markers,
 * axes) is what re-renders as the learner steps and scrubs.
 */

const MARGIN = { top: 16, right: 16, bottom: 40, left: 56 };
// More bands + a deeper alpha ramp make the bowl read as a topographic map
// rather than a flat pink wash (FINDINGS F11): the high-loss peaks darken hard,
// the valley stays near the surface colour, and the contour steps are legible.
const BANDS = 11;
const PEAK_ALPHA = 0.82;

const clampPx = (v: number) => Math.max(-2000, Math.min(2000, v));

export function LossSurface({
  points,
  trace,
  cursor,
  width = 880,
  height = 460,
}: {
  points: Point[];
  trace: ReadonlyArray<DescentStep>;
  /** Index into the trace currently shown by the exhibit (scrub position). */
  cursor: number;
  width?: number;
  height?: number;
}) {
  const grid = useMemo(() => lossSurfaceGrid(points), [points]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sx = linearScale(grid.slopeRange, [MARGIN.left, width - MARGIN.right]);
  const sy = linearScale(grid.interceptRange, [
    height - MARGIN.bottom,
    MARGIN.top,
  ]);
  const yBase = height - MARGIN.bottom;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const styles = getComputedStyle(canvas);
    const errorHue = styles.getPropertyValue("--viz-error").trim() || "#b03050";
    const surface = styles.getPropertyValue("--surface-bg").trim() || "#faf7f0";
    const { cols, rows, values } = grid;
    canvas.width = cols;
    canvas.height = rows;
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, cols, rows);
    ctx.fillStyle = errorHue;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Quantizing into bands turns the gradient into contour-like steps.
        const t = Math.round(values[r * cols + c] * BANDS) / BANDS;
        ctx.globalAlpha = t * PEAK_ALPHA;
        // Grid rows ascend in intercept; canvas y grows downward.
        ctx.fillRect(c, rows - 1 - r, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }, [grid]);

  const current = trace[Math.min(cursor, Math.max(0, trace.length - 1))];
  const path = trace
    .map(
      (s) =>
        `${clampPx(sx(s.params.slope))},${clampPx(sy(s.params.intercept))}`,
    )
    .join(" ");

  return (
    <div className="relative" style={{ aspectRatio: `${width} / ${height}` }}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute"
        style={{
          left: `${(MARGIN.left / width) * 100}%`,
          top: `${(MARGIN.top / height) * 100}%`,
          width: `${((width - MARGIN.left - MARGIN.right) / width) * 100}%`,
          height: `${((height - MARGIN.top - MARGIN.bottom) / height) * 100}%`,
        }}
      />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          current
            ? `Map of the loss surface over slope and intercept. Darker shading is higher loss; the minimum sits at slope ${grid.minimum.slope.toFixed(2)}, intercept ${grid.minimum.intercept.toFixed(2)}. The descent path so far has ${trace.length - 1} steps; the current position is slope ${current.params.slope.toFixed(2)}, intercept ${current.params.intercept.toFixed(2)}.`
            : "Map of the loss surface over slope and intercept."
        }
        className="absolute inset-0 h-full w-full select-none"
      >
        <g aria-hidden>
          {sx.ticks(6).map((t) => (
            <g key={`x${t}`} transform={`translate(${sx(t)},${yBase})`}>
              <line y2={5} stroke="var(--line)" />
              <text
                y={20}
                textAnchor="middle"
                fontSize={11}
                fill="var(--ink-faint)"
                fontFamily="var(--font-mono)"
              >
                {t}
              </text>
            </g>
          ))}
          {sy.ticks(5).map((t) => (
            <g key={`y${t}`} transform={`translate(${MARGIN.left},${sy(t)})`}>
              <line x1={-5} stroke="var(--line)" />
              <text
                x={-9}
                dy="0.32em"
                textAnchor="end"
                fontSize={11}
                fill="var(--ink-faint)"
                fontFamily="var(--font-mono)"
              >
                {t}
              </text>
            </g>
          ))}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={width - MARGIN.left - MARGIN.right}
            height={height - MARGIN.top - MARGIN.bottom}
            fill="none"
            stroke="var(--line)"
          />
          <text
            x={width - MARGIN.right}
            y={yBase + 32}
            textAnchor="end"
            fontSize={11}
            fill="var(--ink-faint)"
          >
            slope
          </text>
          <text x={MARGIN.left} y={MARGIN.top - 4} fontSize={11} fill="var(--ink-faint)">
            intercept
          </text>

          {/* The valley floor — where every honest walk ends up. */}
          <g
            transform={`translate(${sx(grid.minimum.slope)},${sy(grid.minimum.intercept)})`}
          >
            <line x1={-5} x2={5} y1={-5} y2={5} stroke="var(--viz-neutral)" strokeWidth={1.5} />
            <line x1={-5} x2={5} y1={5} y2={-5} stroke="var(--viz-neutral)" strokeWidth={1.5} />
            {/* Label sits below the mark, out of the descent path's way. */}
            <text
              x={0}
              y={22}
              textAnchor="middle"
              fontSize={12}
              fontStyle="italic"
              fill="var(--viz-neutral)"
            >
              the valley floor (OLS)
            </text>
          </g>

          {trace.length > 1 && (
            <>
              {/* A surface-coloured halo lifts the purple trail off the red
                  bowl so the path reads at any band depth (FINDINGS F11). */}
              <polyline
                points={path}
                fill="none"
                stroke="var(--surface-bg)"
                strokeWidth={4.5}
                strokeLinejoin="round"
                strokeOpacity={0.7}
              />
              <polyline
                points={path}
                fill="none"
                stroke="var(--viz-param)"
                strokeWidth={2.25}
                strokeLinejoin="round"
              />
            </>
          )}
          {current && (
            <circle
              cx={clampPx(sx(current.params.slope))}
              cy={clampPx(sy(current.params.intercept))}
              r={5.5}
              fill="var(--viz-param)"
              stroke="var(--surface-bg)"
              strokeWidth={2}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
