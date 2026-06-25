"use client";

import { useEffect, useMemo, useRef } from "react";
import { linearScale } from "@/lib/viz/scale";
import { gradient, magnitude, surface, unit, type Vec2 } from "@/lib/models/gradient";

/**
 * A 2-D landscape with the gradient drawn as an arrow. The shaded field is the
 * height (a topographic map — dark valleys, bright peaks, banded so it reads as
 * contours); the arrow at the draggable point shows the gradient: pointing straight
 * uphill, crossing the bands at right angles, longer where the slope is steeper. In
 * descent mode it flips to −∇f, the direction gradient descent actually walks. Heat is
 * one canvas paint; the arrow + point are the SVG overlay that tracks the drag.
 */

const MARGIN = { top: 14, right: 14, bottom: 14, left: 14 };
const BANDS = 12;
// Just above the tallest summit, so the global peak reaches full amber (the shorter
// hill stays honestly dimmer — it is genuinely lower).
const MAX_F = 1.55;
// Valley → peak: a deep slate floor, a clean warm taupe mid, a bright amber summit.
const RAMP: [number, number, number][] = [
  [42, 50, 66], // low — deep slate
  [138, 116, 90], // mid — warm taupe
  [238, 196, 112], // peak — amber
];
const lerp = (a: number, b: number, u: number) => Math.round(a + (b - a) * u);
const rampRGB = (t: number): [number, number, number] => {
  const u = t <= 0.5 ? t * 2 : (t - 0.5) * 2;
  const [c0, c1] = t <= 0.5 ? [RAMP[0], RAMP[1]] : [RAMP[1], RAMP[2]];
  return [lerp(c0[0], c1[0], u), lerp(c0[1], c1[1], u), lerp(c0[2], c1[2], u)];
};
const rampColor = (t: number) => `rgb(${rampRGB(t).join(", ")})`;
// A contour line at a band boundary: the ramp colour, darkened, so the field reads as a
// drawn topographic map rather than a stepped wash.
const contourColor = (t: number) => `rgb(${rampRGB(t).map((c) => Math.round(c * 0.62)).join(", ")})`;

export function GradientField({
  point,
  onMove,
  descent = false,
  interactive = true,
  path,
  domain = [-3.4, 3.4],
  xDomain,
  yDomain,
  width = 520,
  height = 520,
  showComponents = false,
}: {
  point: Vec2;
  onMove?: (p: Vec2) => void;
  descent?: boolean;
  /** Whether the point can be dragged. The See-it story drives the point by beat, so
   * it renders non-interactive. */
  interactive?: boolean;
  /** An ascent trajectory to draw as a trail, with a hollow start marker — used by the
   * Break-it to show a greedy run climbing to whichever peak it started under. */
  path?: Vec2[];
  /** Square window for both axes (default). */
  domain?: [number, number];
  /** Per-axis windows — override `domain` to render a wide, undistorted landscape
   * (equal pixels-per-unit) for a full-bleed hero. Default to `domain`. */
  xDomain?: [number, number];
  yDomain?: [number, number];
  width?: number;
  height?: number;
  /** Draw ∂f/∂x and ∂f/∂y component vectors at the probe (hero tangent readout). */
  showComponents?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  // Scale the grid with the rendered size (~2px/cell) so the band boundaries are
  // sub-pixel-fine and read as smooth contours, not a stepped wash, when the field
  // is rendered wide (e.g. the full-bleed hero). One-time paint, so the higher cell
  // count is cheap; the drag only moves the SVG overlay, never repaints the canvas.
  const cols = Math.min(680, Math.max(160, Math.round((width - MARGIN.left - MARGIN.right) / 2)));
  const rows = Math.min(560, Math.max(160, Math.round((height - MARGIN.top - MARGIN.bottom) / 2)));
  const [xd0, xd1] = xDomain ?? domain;
  const [yd0, yd1] = yDomain ?? domain;

  const sx = linearScale(xDomain ?? domain, [MARGIN.left, width - MARGIN.right]);
  const sy = linearScale(yDomain ?? domain, [height - MARGIN.bottom, MARGIN.top]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = cols;
    canvas.height = rows;
    // The continuous normalised height of every cell. The FILL uses this directly
    // (a smooth relief — no discrete band steps, so no staircase along the curves);
    // the integer band index, derived from it, is used only to find where contour
    // lines fall. Topographic banding then reads from the drawn lines over smooth
    // ground, the way a real contour map works.
    const heightAt = (cc: number, rr: number) => {
      const xv = xd0 + ((xd1 - xd0) * (cc + 0.5)) / cols;
      const yv = yd0 + ((yd1 - yd0) * (rr + 0.5)) / rows;
      return Math.min(MAX_F, surface(xv, yv)) / MAX_F;
    };
    const heights: number[][] = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => heightAt(c, r)));
    const bandOf = (h: number) => Math.round(h * BANDS);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const h = heights[r][c];
        const b = bandOf(h);
        // A cell whose band differs from a lower-left neighbour sits on a contour line.
        const onContour = (c > 0 && bandOf(heights[r][c - 1]) !== b) || (r > 0 && bandOf(heights[r - 1][c]) !== b);
        ctx.fillStyle = onContour ? contourColor(h) : rampColor(h);
        ctx.fillRect(c, rows - 1 - r, 1, 1);
      }
    }
  }, [xd0, xd1, yd0, yd1, cols, rows]);

  const grad = useMemo(() => gradient(point.x, point.y), [point]);
  const mag = magnitude(grad);
  const dir = unit(grad);
  const sign = descent ? -1 : 1;
  // Arrow length in data units, scaled by steepness (clamped so it stays on-canvas).
  const len = Math.min(1.6, 0.15 + mag * 1.1);
  const tip: Vec2 = { x: point.x + sign * dir.x * len, y: point.y + sign * dir.y * len };

  const toData = (clientX: number, clientY: number): Vec2 => {
    const svg = svgRef.current;
    if (!svg) return point;
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * width;
    const py = ((clientY - rect.top) / rect.height) * height;
    const x = Math.max(xd0, Math.min(xd1, sx.invert(px)));
    const y = Math.max(yd0, Math.min(yd1, sy.invert(py)));
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
  };

  const arrowColor = descent ? "var(--viz-param)" : "var(--viz-prediction)";

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
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`A landscape with the gradient at (${point.x.toFixed(1)}, ${point.y.toFixed(1)}); it points ${descent ? "downhill (−∇f, the descent direction)" : "uphill (the steepest-ascent direction)"} with slope ${mag.toFixed(2)}, perpendicular to the contour.`}
        className={`absolute inset-0 h-full w-full select-none ${interactive ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
        onPointerDown={
          interactive
            ? (e) => {
                try {
                  (e.currentTarget as Element).setPointerCapture(e.pointerId);
                } catch {
                  /* a synthetic/invalid pointerId can't be captured — drag still works */
                }
                onMove?.(toData(e.clientX, e.clientY));
              }
            : undefined
        }
        onPointerMove={
          interactive
            ? (e) => {
                if (e.buttons !== 1) return;
                onMove?.(toData(e.clientX, e.clientY));
              }
            : undefined
        }
      >
        <defs>
          <marker id="grad-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L7,4 L0,8 Z" fill={arrowColor} />
          </marker>
        </defs>
        <rect x={MARGIN.left} y={MARGIN.top} width={width - MARGIN.left - MARGIN.right} height={height - MARGIN.top - MARGIN.bottom} fill="none" stroke="var(--line)" />
        {/* the ascent trail + its start marker */}
        {path && path.length > 1 && (
          <>
            <polyline
              points={path.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}
              fill="none"
              stroke="var(--viz-prediction)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeOpacity={0.85}
            />
            <circle cx={sx(path[0].x)} cy={sy(path[0].y)} r={5} fill="none" stroke="var(--ink)" strokeWidth={2} />
            <circle cx={sx(path[path.length - 1].x)} cy={sy(path[path.length - 1].y)} r={6} fill="var(--viz-truth)" stroke="var(--surface-bg)" strokeWidth={2} />
          </>
        )}
        {/* Component vectors — tangent-plane decomposition at the probe. */}
        {showComponents && mag > 1e-3 && (
          <g aria-hidden>
            <line
              x1={sx(point.x)}
              y1={sy(point.y)}
              x2={sx(point.x + sign * grad.x * len * 0.55)}
              y2={sy(point.y)}
              stroke="var(--viz-truth)"
              strokeWidth={2.25}
              strokeLinecap="round"
              opacity={0.9}
            />
            <line
              x1={sx(point.x + sign * grad.x * len * 0.55)}
              y1={sy(point.y)}
              x2={sx(tip.x)}
              y2={sy(tip.y)}
              stroke="var(--viz-prediction)"
              strokeWidth={2.25}
              strokeLinecap="round"
              opacity={0.9}
            />
            <circle
              cx={sx(point.x + sign * grad.x * len * 0.55)}
              cy={sy(point.y)}
              r={3}
              fill="var(--surface-bg)"
              stroke="var(--ink)"
              strokeWidth={1.25}
            />
            <text
              x={sx(point.x + sign * grad.x * len * 0.28)}
              y={sy(point.y) + 16}
              textAnchor="middle"
              fontSize={10}
              fontFamily="var(--font-mono)"
              paintOrder="stroke"
              stroke="var(--surface-bg)"
              strokeWidth={2.5}
              fill="var(--viz-truth-ink)"
            >
              ∂f/∂x
            </text>
            <text
              x={sx(tip.x) + (sign * dir.x > 0 ? 8 : -8)}
              y={sy(tip.y) + (sign * dir.y > 0 ? 14 : -8)}
              textAnchor={sign * dir.x > 0 ? "start" : "end"}
              fontSize={10}
              fontFamily="var(--font-mono)"
              paintOrder="stroke"
              stroke="var(--surface-bg)"
              strokeWidth={2.5}
              fill="var(--viz-prediction-ink)"
            >
              ∂f/∂y
            </text>
          </g>
        )}
        {/* the gradient arrow, on a soft halo so it reads against any band */}
        {mag > 1e-3 && (
          <g>
            <line x1={sx(point.x)} y1={sy(point.y)} x2={sx(tip.x)} y2={sy(tip.y)} stroke="var(--surface-bg)" strokeWidth={6.5} strokeOpacity={0.5} strokeLinecap="round" />
            <line x1={sx(point.x)} y1={sy(point.y)} x2={sx(tip.x)} y2={sy(tip.y)} stroke={arrowColor} strokeWidth={3} markerEnd="url(#grad-arrow)" />
          </g>
        )}
        {/* the draggable point */}
        <circle cx={sx(point.x)} cy={sy(point.y)} r={7} fill="var(--surface-bg)" stroke="var(--ink)" strokeWidth={2} />
        <circle cx={sx(point.x)} cy={sy(point.y)} r={2.5} fill="var(--ink)" />
        {/* the slope read off the field, pinned at the point — meaning on the graphic,
            not only in the side table. Hidden in path/trail mode to keep that clean. */}
        {mag > 1e-3 && !path && (
          <text
            x={sx(point.x)}
            y={sy(tip.y) < sy(point.y) ? sy(point.y) + 22 : sy(point.y) - 14}
            textAnchor="middle"
            fontSize={12}
            fontFamily="var(--font-mono)"
            paintOrder="stroke"
            stroke="var(--surface-bg)"
            strokeWidth={3.5}
            fill={arrowColor}
          >
            slope {mag.toFixed(2)}
          </text>
        )}
      </svg>
    </div>
  );
}
