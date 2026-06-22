"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { linearScale, type LinearScale } from "@/lib/viz/scale";
import type { LinearParams, Point } from "@/lib/models/linear-regression";

/**
 * Visualization kit: composable SVG plot. The kit is the compounding asset
 * (docs/02-architecture.md) — exhibits compose these parts instead of
 * building bespoke charts. Visual-grammar colors come exclusively from the
 * CSS tokens: prediction/truth/error mean the same thing lab-wide.
 */

type PlotContextValue = {
  x: LinearScale;
  y: LinearScale;
  width: number;
  height: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
};

const PlotContext = createContext<PlotContextValue | null>(null);

export function usePlot(): PlotContextValue {
  const ctx = useContext(PlotContext);
  if (!ctx) throw new Error("Plot.* components must be inside <Plot>");
  return ctx;
}

const MARGIN = { top: 16, right: 16, bottom: 36, left: 44 };

export function Plot({
  width = 640,
  height = 420,
  xDomain,
  yDomain,
  ariaLabel,
  interactive = false,
  children,
}: {
  width?: number;
  height?: number;
  xDomain: [number, number];
  yDomain: [number, number];
  /** The teaching point of this visualization, for screen readers (docs/06, A6). */
  ariaLabel: string;
  /**
   * Plots with focusable children (keyboard-movable points) must not be
   * role="img" — ARIA makes an image's children presentational, which
   * contradicts focusable content inside it.
   */
  interactive?: boolean;
  children: ReactNode;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const value = useMemo<PlotContextValue>(
    () => ({
      x: linearScale(xDomain, [MARGIN.left, width - MARGIN.right]),
      y: linearScale(yDomain, [height - MARGIN.bottom, MARGIN.top]),
      width,
      height,
      svgRef,
    }),
    [xDomain, yDomain, width, height],
  );

  return (
    <PlotContext.Provider value={value}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        role={interactive ? "group" : "img"}
        aria-label={ariaLabel}
        className="h-auto w-full touch-none select-none"
      >
        {children}
      </svg>
    </PlotContext.Provider>
  );
}

export function Axes() {
  const { x, y, height } = usePlot();
  const x0 = x.range[0];
  const x1 = x.range[1];
  const yBase = height - MARGIN.bottom;
  return (
    <g aria-hidden>
      {x.ticks(6).map((t) => (
        <g key={`x${t}`} transform={`translate(${x(t)},${yBase})`}>
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
      {y.ticks(5).map((t) => (
        <g key={`y${t}`} transform={`translate(${x0},${y(t)})`}>
          <line x1={-5} stroke="var(--line)" />
          <line x2={x1 - x0} stroke="var(--line)" strokeOpacity={0.35} />
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
      <line x1={x0} x2={x1} y1={yBase} y2={yBase} stroke="var(--line)" />
      <line x1={x0} x2={x0} y1={MARGIN.top} y2={yBase} stroke="var(--line)" />
    </g>
  );
}

/**
 * The model's prediction line — always the prediction hue, lab-wide.
 * Rendered as a unit segment under a matrix transform: transform is the one
 * SVG geometry CSS can animate, so `ease` morphs (scenario swaps) cost no
 * JavaScript. vector-effect keeps the stroke width honest under the skew.
 */
export function FitLine({
  params,
  ease = false,
}: {
  params: LinearParams;
  /** Travel to a new position instead of teleporting (never during drags). */
  ease?: boolean;
}) {
  const { x, y } = usePlot();
  if (!Number.isFinite(params.slope + params.intercept)) return null;
  const [d0, d1] = x.domain;
  const x1 = x(d0);
  const y1 = y(params.slope * d0 + params.intercept);
  const x2 = x(d1);
  const y2 = y(params.slope * d1 + params.intercept);
  return (
    <line
      x1={0}
      y1={0}
      x2={1}
      y2={0}
      vectorEffect="non-scaling-stroke"
      stroke="var(--viz-prediction)"
      strokeWidth={2.5}
      strokeLinecap="round"
      style={{
        transform: `matrix(${x2 - x1}, ${y2 - y1}, 0, 1, ${x1}, ${y1})`,
        transition: ease
          ? "transform var(--motion-move) var(--ease-out)"
          : undefined,
      }}
      aria-hidden
    />
  );
}

/** Residuals — error hue, drawn from each point to the prediction line. */
export function ResidualLines({
  points,
  params,
}: {
  points: Point[];
  params: LinearParams;
}) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {points.map((p, i) => (
        <line
          key={i}
          x1={x(p.x)}
          y1={y(p.y)}
          x2={x(p.x)}
          y2={y(params.slope * p.x + params.intercept)}
          stroke="var(--viz-error)"
          strokeWidth={1.5}
          strokeOpacity={0.7}
          strokeDasharray="3 3"
        />
      ))}
    </g>
  );
}

/**
 * Squared error made literal (docs/06, B2/B6): each residual becomes an
 * actual square whose side is the residual — so its *area* is the penalty
 * the line pays there. One glance at an outlier's square explains "squared"
 * better than any sentence. Squares grow toward the plot's interior so they
 * stay readable at the edges.
 */
export function ResidualSquares({
  points,
  params,
}: {
  points: Point[];
  params: LinearParams;
}) {
  const { x, y, width } = usePlot();
  return (
    <g aria-hidden>
      {points.map((p, i) => {
        const py = y(p.y);
        const pyHat = y(params.slope * p.x + params.intercept);
        const side = Math.abs(pyHat - py);
        if (side < 0.5) return null;
        const px = x(p.x);
        // Draw between the point and the line; grow toward the interior, and
        // clamp so a square never spills past the left axis or the right edge
        // (a giant outlier square reads as "off the chart", not as a clipped bug).
        const rx = px - side >= MARGIN.left ? px - side : px;
        const maxX = width - MARGIN.right - side;
        return (
          <rect
            key={i}
            x={Math.max(MARGIN.left, Math.min(rx, maxX))}
            y={Math.min(py, pyHat)}
            width={side}
            height={side}
            fill="var(--viz-error)"
            fillOpacity={0.12}
            stroke="var(--viz-error)"
            strokeOpacity={0.55}
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
}

/**
 * Annotation — the explanation carried into the graphic (docs/06, B2):
 * a short label with a leader line, anchored at data coordinates.
 */
export function Annotation({
  at,
  dx = 14,
  dy = -14,
  label,
  color = "var(--viz-neutral)",
}: {
  at: Point;
  dx?: number;
  dy?: number;
  label: string;
  color?: string;
}) {
  const { x, y } = usePlot();
  const ax = x(at.x);
  const ay = y(at.y);
  const tx = ax + dx;
  const ty = ay + dy;
  return (
    <g aria-hidden>
      <line
        x1={ax}
        y1={ay}
        x2={tx - Math.sign(dx) * 4}
        y2={ty + 4}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.6}
      />
      <text
        x={tx}
        y={ty}
        textAnchor={dx >= 0 ? "start" : "end"}
        fontSize={12}
        fontStyle="italic"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * Dataset painter (viz kit v1) — click empty plot space to place a data
 * point. Sits under the DataPoints layer, so existing points keep their
 * drag behavior; only genuinely empty canvas paints.
 */
export function PaintLayer({ onAdd }: { onAdd: (point: Point) => void }) {
  const { x, y, svgRef, width, height } = usePlot();
  const [x0, x1] = x.range;
  const [y1, y0] = y.range; // y range is inverted (pixel space)

  return (
    <rect
      x={Math.min(x0, x1)}
      y={Math.min(y0, y1)}
      width={Math.abs(x1 - x0)}
      height={Math.abs(y1 - y0)}
      fill="transparent"
      className="cursor-crosshair"
      aria-hidden
      onPointerDown={(e) => {
        const svg = svgRef.current!;
        const rect = svg.getBoundingClientRect();
        const vx = ((e.clientX - rect.left) / rect.width) * width;
        const vy = ((e.clientY - rect.top) / rect.height) * height;
        onAdd({ x: x.invert(vx), y: y.invert(vy) });
      }}
    />
  );
}

/**
 * Observed data — truth hue. Draggable when onChange is provided; removable
 * by double-click when onRemove is provided.
 * Dragging uses window-level listeners rather than per-element pointer
 * capture: a fast drag must never outrun the point, in any browser.
 * Every draggable point is also keyboard-operable (docs/06, A6): arrow keys
 * move it through data space, Delete removes it.
 */
export function DataPoints({
  points,
  onChange,
  onRemove,
  ease = false,
}: {
  points: Point[];
  onChange?: (index: number, point: Point) => void;
  onRemove?: (index: number) => void;
  /** Morph point moves along eased paths (scenario swaps — never drags). */
  ease?: boolean;
}) {
  const { x, y, svgRef, width, height } = usePlot();
  const [dragging, setDragging] = useState<number | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // One keyboard nudge is 1/60 of the domain — fine enough to aim, coarse
  // enough that a held key crosses the plot in about a second.
  const xNudge = (x.domain[1] - x.domain[0]) / 60;
  const yNudge = (y.domain[1] - y.domain[0]) / 60;

  const onKeyDown = (i: number, p: Point) => (e: React.KeyboardEvent) => {
    if (!onChange) return;
    const dx = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    const dy = e.key === "ArrowDown" ? -1 : e.key === "ArrowUp" ? 1 : 0;
    if (dx !== 0 || dy !== 0) {
      e.preventDefault();
      onChange(i, { x: p.x + dx * xNudge, y: p.y + dy * yNudge });
    } else if ((e.key === "Delete" || e.key === "Backspace") && onRemove) {
      e.preventDefault();
      onRemove(i);
    }
  };

  const toData = useCallback(
    (clientX: number, clientY: number): Point => {
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      // viewBox scaling: client px → viewBox units → data coords
      const vx = ((clientX - rect.left) / rect.width) * width;
      const vy = ((clientY - rect.top) / rect.height) * height;
      return { x: x.invert(vx), y: y.invert(vy) };
    },
    [svgRef, x, y, width, height],
  );

  useEffect(() => {
    if (dragging === null) return;
    const move = (e: PointerEvent) => {
      onChangeRef.current?.(dragging, toData(e.clientX, e.clientY));
    };
    const up = () => setDragging(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, toData]);

  return (
    <g className={ease && dragging === null ? "viz-ease" : undefined}>
      {points.map((p, i) => (
        <circle
          key={i}
          cx={x(p.x)}
          cy={y(p.y)}
          r={dragging === i ? 8 : 6}
          fill="var(--viz-truth)"
          stroke="var(--surface-bg)"
          strokeWidth={1.5}
          className={
            onChange ? "viz-point cursor-grab active:cursor-grabbing" : undefined
          }
          tabIndex={onChange ? 0 : undefined}
          role={onChange ? "button" : undefined}
          aria-label={
            onChange
              ? `Data point at x ${p.x.toFixed(1)}, y ${p.y.toFixed(1)}. Arrow keys move it${onRemove ? "; Delete removes it" : ""}.`
              : undefined
          }
          onKeyDown={onChange ? onKeyDown(i, p) : undefined}
          onPointerDown={
            onChange
              ? (e) => {
                  e.preventDefault();
                  setDragging(i);
                }
              : undefined
          }
          onDoubleClick={onRemove ? () => onRemove(i) : undefined}
        />
      ))}
    </g>
  );
}
