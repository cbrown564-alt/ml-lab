import { useMemo, type ReactNode } from "react";
import { usePlot } from "@/components/viz/Plot";
import type { PCVector, Point2D } from "@/lib/models/pca";

export function rawDirection(vector: PCVector, scale: Point2D): Point2D {
  return {
    x1: vector.x1 * scale.x1,
    x2: vector.x2 * scale.x2,
  };
}

export function axisSegment(
  mean: Point2D,
  direction: Point2D,
  xDomain: [number, number],
  yDomain: [number, number],
  margin = 0.42,
): { start: Point2D; end: Point2D } {
  const dx = Math.abs(direction.x1) < 1e-9 ? Number.POSITIVE_INFINITY : direction.x1;
  const dy = Math.abs(direction.x2) < 1e-9 ? Number.POSITIVE_INFINITY : direction.x2;
  const tx = Number.isFinite(dx) ? ((xDomain[1] - xDomain[0]) * margin) / Math.abs(dx) : Infinity;
  const ty = Number.isFinite(dy) ? ((yDomain[1] - yDomain[0]) * margin) / Math.abs(dy) : Infinity;
  const span = Math.min(tx, ty);
  return {
    start: { x1: mean.x1 - direction.x1 * span, x2: mean.x2 - direction.x2 * span },
    end: { x1: mean.x1 + direction.x1 * span, x2: mean.x2 + direction.x2 * span },
  };
}

export function CloudPoints({
  points,
  fill = "var(--viz-truth)",
  stroke = "var(--surface-bg)",
  opacity = 0.92,
  r = 4,
}: {
  points: Point2D[];
  fill?: string;
  stroke?: string;
  opacity?: number;
  r?: number;
}) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden opacity={opacity}>
      {points.map((point, index) => (
        <circle
          key={index}
          cx={x(point.x1)}
          cy={y(point.x2)}
          r={r}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.25}
        />
      ))}
    </g>
  );
}

export function LinkLines({
  from,
  to,
  stroke = "var(--viz-param)",
  strokeWidth = 1.4,
  strokeDasharray,
  opacity = 0.7,
}: {
  from: Point2D[];
  to: Point2D[];
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  opacity?: number;
}) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden opacity={opacity}>
      {from.map((point, index) => (
        <line
          key={index}
          x1={x(point.x1)}
          y1={y(point.x2)}
          x2={x(to[index].x1)}
          y2={y(to[index].x2)}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      ))}
    </g>
  );
}

export function AxisArrow({
  start,
  end,
  color = "var(--viz-prediction)",
  width = 2.8,
  opacity = 1,
}: {
  start: Point2D;
  end: Point2D;
  color?: string;
  width?: number;
  opacity?: number;
}) {
  const { x, y } = usePlot();
  const head = useMemo(() => {
    const x1 = x(start.x1);
    const y1 = y(start.x2);
    const x2 = x(end.x1);
    const y2 = y(end.x2);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const norm = Math.hypot(dx, dy) || 1;
    const ux = dx / norm;
    const uy = dy / norm;
    const size = 11;
    const backX = x2 - ux * size;
    const backY = y2 - uy * size;
    const side = 4.5;
    return [
      `${x2},${y2}`,
      `${backX - uy * side},${backY + ux * side}`,
      `${backX + uy * side},${backY - ux * side}`,
    ].join(" ");
  }, [end.x1, end.x2, start.x1, start.x2, x, y]);

  return (
    <g aria-hidden opacity={opacity}>
      <line
        x1={x(start.x1)}
        y1={y(start.x2)}
        x2={x(end.x1)}
        y2={y(end.x2)}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <polygon points={head} fill={color} />
    </g>
  );
}

export function PlotText({
  at,
  label,
  fill = "var(--viz-neutral-ink)",
  anchor = "middle",
}: {
  at: Point2D;
  label: ReactNode;
  fill?: string;
  anchor?: "start" | "middle" | "end";
}) {
  const { x, y } = usePlot();
  return (
    <text
      x={x(at.x1)}
      y={y(at.x2)}
      textAnchor={anchor}
      fontSize={11}
      fontFamily="var(--font-mono)"
      fill={fill}
      paintOrder="stroke"
      stroke="var(--surface-bg)"
      strokeWidth={4}
    >
      {label}
    </text>
  );
}

export function ProjectionDots({
  points,
  fill = "var(--viz-prediction)",
  r = 3.5,
}: {
  points: { pc1: number; pc2: number }[];
  fill?: string;
  r?: number;
}) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {points.map((point, index) => (
        <circle key={index} cx={x(point.pc1)} cy={y(point.pc2)} r={r} fill={fill} />
      ))}
    </g>
  );
}

export function ExplainedVarianceBars({
  ratios,
  activeComponents = 1,
}: {
  ratios: readonly number[];
  activeComponents?: 1 | 2;
}) {
  return (
    <figure>
      <figcaption className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Explained variance
      </figcaption>
      <div className="space-y-3">
        {ratios.map((ratio, index) => {
          const active = index < activeComponents;
          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 font-mono text-xs">
                <span className={active ? "text-ink" : "text-ink-faint"}>
                  PC{index + 1}
                </span>
                <span style={{ color: active ? "var(--accent)" : "var(--ink-muted)" }}>
                  {(ratio * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sunken">
                <div
                  className="h-full rounded-full transition-[width,opacity] duration-300"
                  style={{
                    width: `${ratio * 100}%`,
                    background: active ? "var(--accent)" : "var(--viz-param)",
                    opacity: active ? 1 : 0.45,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
