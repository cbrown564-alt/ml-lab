"use client";

import type { Net } from "@/lib/models/neural-net";

/**
 * The network's wiring, drawn: two inputs on the left, the hidden tanh units in the
 * middle, the sigmoid output on the right. Every connection is an edge whose thickness is
 * the weight's magnitude and whose colour is its sign — blue for positive, red for
 * negative — so as the net trains you watch the weights thicken and flip into the pattern
 * that solves the problem. Click a hidden unit to inspect its fold in feature space
 * (RepresentationPortal's diagram side).
 */
export function NetworkDiagram({
  net,
  width = 300,
  height = 260,
  selectedUnit = null,
  mutedUnits = new Set<number>(),
  onSelectUnit,
}: {
  net: Net;
  width?: number;
  height?: number;
  selectedUnit?: number | null;
  mutedUnits?: ReadonlySet<number>;
  onSelectUnit?: (unit: number | null) => void;
}) {
  const H = net.W2.length;
  const colX = [width * 0.16, width * 0.5, width * 0.84];
  const pad = 26;
  const col = (n: number, i: number) => pad + ((height - 2 * pad) * (i + 0.5)) / n;

  const maxW = Math.max(
    0.1,
    ...net.W1.flat().map(Math.abs),
    ...net.W2.map(Math.abs),
  );
  const stroke = (w: number, muted = false) => ({
    width: 0.5 + (Math.abs(w) / maxW) * 3.5,
    color: w >= 0 ? "var(--viz-prediction)" : "var(--viz-error)",
    opacity: muted ? 0.12 : 0.25 + (Math.abs(w) / maxW) * 0.55,
  });

  const inY = [col(2, 0), col(2, 1)];
  const hidY = net.W2.map((_, j) => col(H, j));
  const outY = col(1, 0);
  const hr = Math.max(4, Math.min(11, (height - 2 * pad) / (H * 2.4)));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`A neural network: 2 inputs, ${H} hidden ${H === 1 ? "unit" : "units"}, 1 output. Edge thickness is each weight's size, colour its sign.${onSelectUnit ? " Click a hidden unit to inspect its fold." : ""}`}
      className="h-auto w-full"
    >
      {net.W1.map((w, j) =>
        [0, 1].map((k) => {
          const s = stroke(w[k], mutedUnits.has(j));
          return (
            <line
              key={`i${j}-${k}`}
              x1={colX[0]}
              y1={inY[k]}
              x2={colX[1]}
              y2={hidY[j]}
              stroke={s.color}
              strokeWidth={s.width}
              strokeOpacity={s.opacity}
            />
          );
        }),
      )}
      {net.W2.map((w, j) => {
        const s = stroke(w, mutedUnits.has(j));
        return (
          <line
            key={`h${j}`}
            x1={colX[1]}
            y1={hidY[j]}
            x2={colX[2]}
            y2={outY}
            stroke={s.color}
            strokeWidth={s.width}
            strokeOpacity={s.opacity}
          />
        );
      })}
      {inY.map((y, k) => (
        <g key={`in${k}`}>
          <circle cx={colX[0]} cy={y} r={13} fill="var(--surface-bg)" stroke="var(--viz-neutral-ink)" strokeWidth={1.5} />
          <text x={colX[0]} y={y + 4} textAnchor="middle" fontSize={12} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
            x{k + 1}
          </text>
        </g>
      ))}
      {hidY.map((y, j) => {
        const isSel = selectedUnit === j;
        const isMuted = mutedUnits.has(j);
        return (
          <g key={`h${j}`}>
            {onSelectUnit ? (
              <circle
                cx={colX[1]}
                cy={y}
                r={hr + 6}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onSelectUnit(isSel ? null : j)}
              />
            ) : null}
            <circle
              cx={colX[1]}
              cy={y}
              r={hr}
              fill={isSel ? "color-mix(in oklch, var(--viz-param) 18%, var(--surface-raised))" : "var(--surface-raised)"}
              stroke={isSel ? "var(--viz-param)" : "var(--viz-param)"}
              strokeWidth={isSel ? 2.5 : 1.5}
              strokeOpacity={isMuted ? 0.35 : 1}
              fillOpacity={isMuted ? 0.5 : 1}
            />
            {isMuted && (
              <line
                x1={colX[1] - hr}
                y1={y - hr}
                x2={colX[1] + hr}
                y2={y + hr}
                stroke="var(--viz-error)"
                strokeWidth={1.5}
                strokeOpacity={0.7}
              />
            )}
          </g>
        );
      })}
      <g>
        <circle cx={colX[2]} cy={outY} r={13} fill="var(--surface-bg)" stroke="var(--viz-truth-ink)" strokeWidth={1.5} />
        <text x={colX[2]} y={outY + 4} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
          ŷ
        </text>
      </g>
      <text x={colX[0]} y={height - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        inputs
      </text>
      <text x={colX[1]} y={height - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        hidden
      </text>
      <text x={colX[2]} y={height - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        output
      </text>
    </svg>
  );
}
