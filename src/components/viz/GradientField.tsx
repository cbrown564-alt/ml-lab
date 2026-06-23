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
const MAX_F = 1.7;
// Valley → peak: a deep slate floor warming to a bright amber summit.
const RAMP: [number, number, number][] = [
  [44, 52, 64], // low
  [120, 120, 110],
  [224, 178, 96], // peak
];
const lerp = (a: number, b: number, u: number) => Math.round(a + (b - a) * u);
const rampColor = (t: number) => {
  const u = t <= 0.5 ? t * 2 : (t - 0.5) * 2;
  const [c0, c1] = t <= 0.5 ? [RAMP[0], RAMP[1]] : [RAMP[1], RAMP[2]];
  return `rgb(${lerp(c0[0], c1[0], u)}, ${lerp(c0[1], c1[1], u)}, ${lerp(c0[2], c1[2], u)})`;
};

export function GradientField({
  point,
  onMove,
  descent = false,
  interactive = true,
  domain = [-3.4, 3.4],
  width = 520,
  height = 520,
}: {
  point: Vec2;
  onMove?: (p: Vec2) => void;
  descent?: boolean;
  /** Whether the point can be dragged. The See-it story drives the point by beat, so
   * it renders non-interactive. */
  interactive?: boolean;
  domain?: [number, number];
  width?: number;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const cols = 130;
  const rows = 130;
  const [d0, d1] = domain;

  const sx = linearScale(domain, [MARGIN.left, width - MARGIN.right]);
  const sy = linearScale(domain, [height - MARGIN.bottom, MARGIN.top]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = cols;
    canvas.height = rows;
    for (let r = 0; r < rows; r++) {
      const yv = d0 + ((d1 - d0) * (r + 0.5)) / rows;
      for (let c = 0; c < cols; c++) {
        const xv = d0 + ((d1 - d0) * (c + 0.5)) / cols;
        const t = Math.round((Math.min(MAX_F, surface(xv, yv)) / MAX_F) * BANDS) / BANDS;
        ctx.fillStyle = rampColor(t);
        ctx.fillRect(c, rows - 1 - r, 1, 1);
      }
    }
  }, [d0, d1]);

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
    const x = Math.max(d0, Math.min(d1, sx.invert(px)));
    const y = Math.max(d0, Math.min(d1, sy.invert(py)));
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
        {/* the gradient arrow */}
        {mag > 1e-3 && (
          <line
            x1={sx(point.x)}
            y1={sy(point.y)}
            x2={sx(tip.x)}
            y2={sy(tip.y)}
            stroke={arrowColor}
            strokeWidth={3}
            markerEnd="url(#grad-arrow)"
          />
        )}
        {/* the draggable point */}
        <circle cx={sx(point.x)} cy={sy(point.y)} r={7} fill="var(--surface-bg)" stroke="var(--ink)" strokeWidth={2} />
        <circle cx={sx(point.x)} cy={sy(point.y)} r={2.5} fill="var(--ink)" />
      </svg>
    </div>
  );
}
