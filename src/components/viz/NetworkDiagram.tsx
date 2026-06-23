"use client";

import type { Net } from "@/lib/models/neural-net";

/**
 * The network's wiring, drawn: two inputs on the left, the hidden tanh units in the
 * middle, the sigmoid output on the right. Every connection is an edge whose thickness is
 * the weight's magnitude and whose colour is its sign — blue for positive, red for
 * negative — so as the net trains you watch the weights thicken and flip into the pattern
 * that solves the problem. The same weights the decision field is drawing, shown as a
 * circuit instead of a surface.
 */
export function NetworkDiagram({ net, width = 300, height = 260 }: { net: Net; width?: number; height?: number }) {
  const H = net.W2.length;
  const colX = [width * 0.16, width * 0.5, width * 0.84];
  const pad = 26;
  const col = (n: number, i: number) => pad + ((height - 2 * pad) * (i + 0.5)) / n;

  const maxW = Math.max(
    0.1,
    ...net.W1.flat().map(Math.abs),
    ...net.W2.map(Math.abs),
  );
  const stroke = (w: number) => ({
    width: 0.5 + (Math.abs(w) / maxW) * 3.5,
    color: w >= 0 ? "var(--viz-prediction)" : "var(--viz-error)",
    opacity: 0.25 + (Math.abs(w) / maxW) * 0.55,
  });

  const inY = [col(2, 0), col(2, 1)];
  const hidY = net.W2.map((_, j) => col(H, j));
  const outY = col(1, 0);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`A neural network: 2 inputs, ${H} hidden ${H === 1 ? "unit" : "units"}, 1 output. Edge thickness is each weight's size, colour its sign.`} className="h-auto w-full">
      {/* input → hidden */}
      {net.W1.map((w, j) =>
        [0, 1].map((k) => {
          const s = stroke(w[k]);
          return <line key={`i${j}-${k}`} x1={colX[0]} y1={inY[k]} x2={colX[1]} y2={hidY[j]} stroke={s.color} strokeWidth={s.width} strokeOpacity={s.opacity} />;
        }),
      )}
      {/* hidden → output */}
      {net.W2.map((w, j) => {
        const s = stroke(w);
        return <line key={`h${j}`} x1={colX[1]} y1={hidY[j]} x2={colX[2]} y2={outY} stroke={s.color} strokeWidth={s.width} strokeOpacity={s.opacity} />;
      })}
      {/* nodes */}
      {inY.map((y, k) => (
        <g key={`in${k}`}>
          <circle cx={colX[0]} cy={y} r={13} fill="var(--surface-bg)" stroke="var(--viz-neutral-ink)" strokeWidth={1.5} />
          <text x={colX[0]} y={y + 4} textAnchor="middle" fontSize={12} fontFamily="var(--font-mono)" fill="var(--ink-muted)">x{k + 1}</text>
        </g>
      ))}
      {hidY.map((y, j) => (
        <circle key={`h${j}`} cx={colX[1]} cy={y} r={11} fill="var(--surface-raised)" stroke="var(--viz-param)" strokeWidth={1.5} />
      ))}
      <g>
        <circle cx={colX[2]} cy={outY} r={13} fill="var(--surface-bg)" stroke="var(--viz-truth-ink)" strokeWidth={1.5} />
        <text x={colX[2]} y={outY + 4} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink-muted)">ŷ</text>
      </g>
      <text x={colX[0]} y={height - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">inputs</text>
      <text x={colX[1]} y={height - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">hidden</text>
      <text x={colX[2]} y={height - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">output</text>
    </svg>
  );
}
