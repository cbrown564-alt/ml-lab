"use client";

import { useEffect, useMemo, useRef } from "react";
import { linearScale } from "@/lib/viz/scale";
import { halfSpaceLine, predictProbaMuted, type Net } from "@/lib/models/neural-net";
import type { Sample } from "@/lib/models/neural-net";

/**
 * Feature space with each hidden unit's half-space fold drawn on top — the
 * RepresentationPortal's field side. Every dashed line is one unit's w·x + b = 0
 * boundary; the shaded field is the network's decision with optional units muted.
 */

const MARGIN = { top: 14, right: 14, bottom: 36, left: 44 };
const AMBER = [206, 158, 74];
const BLUE = [78, 120, 200];
const PALE = [248, 246, 241];

const mix = (a: number[], b: number[], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;

function fieldColor(p: number): string {
  const conf = Math.abs(p - 0.5) * 2;
  const hue = p >= 0.5 ? BLUE : AMBER;
  return mix(PALE, hue, conf * 0.8);
}

const clampPx = (v: number) => Math.max(-2000, Math.min(2000, v));

export function FeatureFoldField({
  net,
  points,
  muted = new Set<number>(),
  selectedUnit = null,
  visibleUnits = null,
  domain = [-3.6, 3.6],
  width = 520,
  height = 420,
  bare = false,
}: {
  net: Net;
  points: Sample[];
  muted?: ReadonlySet<number>;
  selectedUnit?: number | null;
  /** When set, only draw fold lines for these unit indices (progressive reveal). */
  visibleUnits?: ReadonlySet<number> | null;
  domain?: [number, number];
  width?: number;
  height?: number;
  bare?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cols = 120;
  const rows = 100;
  const predict = useMemo(
    () => (x1: number, x2: number) => predictProbaMuted(net, x1, x2, muted),
    [net, muted],
  );

  const sx = linearScale(domain, [MARGIN.left, width - MARGIN.right]);
  const sy = linearScale(domain, [height - MARGIN.bottom, MARGIN.top]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = cols;
    canvas.height = rows;
    const [d0, d1] = domain;
    for (let r = 0; r < rows; r++) {
      const x2 = d0 + ((d1 - d0) * (r + 0.5)) / rows;
      for (let c = 0; c < cols; c++) {
        const x1 = d0 + ((d1 - d0) * (c + 0.5)) / cols;
        ctx.fillStyle = fieldColor(predict(x1, x2));
        ctx.fillRect(c, rows - 1 - r, 1, 1);
      }
    }
  }, [predict, domain]);

  const folds = useMemo(() => {
    const lines: { unit: number; line: NonNullable<ReturnType<typeof halfSpaceLine>> }[] = [];
    for (let j = 0; j < net.W1.length; j++) {
      if (visibleUnits && !visibleUnits.has(j)) continue;
      const line = halfSpaceLine(net, j, domain);
      if (line) lines.push({ unit: j, line });
    }
    return lines;
  }, [net, domain, visibleUnits]);

  const acc = useMemo(
    () =>
      points.reduce(
        (n, p) => n + ((predict(p.x1, p.x2) >= 0.5 ? 1 : 0) === p.y ? 1 : 0),
        0,
      ),
    [points, predict],
  );

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
        aria-label={`XOR data in feature space with ${folds.length} hidden-unit fold lines; the model classifies ${acc} of ${points.length} points correctly.`}
        className="absolute inset-0 h-full w-full select-none"
      >
        {!bare && (
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={width - MARGIN.left - MARGIN.right}
            height={height - MARGIN.top - MARGIN.bottom}
            fill="none"
            stroke="var(--line)"
          />
        )}
        <g aria-hidden>
          {folds.map(({ unit, line }) => {
            const isSel = selectedUnit === unit;
            const isMuted = muted.has(unit);
            return (
              <line
                key={unit}
                x1={clampPx(sx(line.x1a))}
                y1={clampPx(sy(line.x2a))}
                x2={clampPx(sx(line.x1b))}
                y2={clampPx(sy(line.x2b))}
                stroke={isSel ? "var(--viz-param)" : "var(--viz-neutral)"}
                strokeWidth={isSel ? 2.5 : 1.5}
                strokeDasharray={isMuted ? "4 6" : "8 5"}
                opacity={isMuted ? 0.35 : isSel ? 1 : 0.65}
              />
            );
          })}
        </g>
        {points.map((p, i) => {
          const correct = (predict(p.x1, p.x2) >= 0.5 ? 1 : 0) === p.y;
          return (
            <circle
              key={i}
              cx={sx(p.x1)}
              cy={sy(p.x2)}
              r={bare ? 4 : 5}
              fill={p.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"}
              stroke={correct ? "var(--surface-bg)" : "var(--viz-error)"}
              strokeWidth={correct ? 1.5 : 2.25}
            />
          );
        })}
      </svg>
    </div>
  );
}
