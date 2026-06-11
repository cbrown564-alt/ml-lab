"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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
  children,
}: {
  width?: number;
  height?: number;
  xDomain: [number, number];
  yDomain: [number, number];
  /** The teaching point of this visualization, for screen readers (docs/06, A6). */
  ariaLabel: string;
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
        role="img"
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

/** The model's prediction line — always the prediction hue, lab-wide. */
export function FitLine({ params }: { params: LinearParams }) {
  const { x, y } = usePlot();
  const [d0, d1] = x.domain;
  return (
    <line
      x1={x(d0)}
      y1={y(params.slope * d0 + params.intercept)}
      x2={x(d1)}
      y2={y(params.slope * d1 + params.intercept)}
      stroke="var(--viz-prediction)"
      strokeWidth={2.5}
      strokeLinecap="round"
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

/** Observed data — truth hue. Draggable when onChange is provided. */
export function DataPoints({
  points,
  onChange,
}: {
  points: Point[];
  onChange?: (index: number, point: Point) => void;
}) {
  const { x, y, svgRef, width, height } = usePlot();

  const toData = useCallback(
    (e: React.PointerEvent): Point => {
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      // viewBox scaling: client px → viewBox units → data coords
      const vx = ((e.clientX - rect.left) / rect.width) * width;
      const vy = ((e.clientY - rect.top) / rect.height) * height;
      return { x: x.invert(vx), y: y.invert(vy) };
    },
    [svgRef, x, y, width, height],
  );

  return (
    <g>
      {points.map((p, i) => (
        <circle
          key={i}
          cx={x(p.x)}
          cy={y(p.y)}
          r={6}
          fill="var(--viz-truth)"
          stroke="var(--surface-bg)"
          strokeWidth={1.5}
          className={onChange ? "cursor-grab active:cursor-grabbing" : undefined}
          onPointerDown={
            onChange
              ? (e) => {
                  (e.target as Element).setPointerCapture(e.pointerId);
                }
              : undefined
          }
          onPointerMove={
            onChange
              ? (e) => {
                  if (e.buttons !== 1) return;
                  onChange(i, toData(e));
                }
              : undefined
          }
        />
      ))}
    </g>
  );
}
