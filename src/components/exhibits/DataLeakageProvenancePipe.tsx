"use client";

import { useEffect, useId, useState } from "react";

/**
 * Data-leakage provenance pipe — exhibit-specific SVG implementing the
 * {@link ProvenancePipe} visual-argument pattern (train/test wall, boundary
 * violation, contaminated score readout).
 */

const W = 680;
const H = 300;
const M = { l: 24, r: 24, t: 36, b: 44 };
const WALL_X = 0.58; // fraction across the pipe interior
const wallPx = () => M.l + WALL_X * (W - M.l - M.r);

type Props = {
  leaky: boolean;
  r2: number;
  /** 0→1 entrance animation for hero load (reduced motion jumps to 1). */
  reveal?: number;
  className?: string;
};

export function DataLeakageProvenancePipe({ leaky, r2, reveal = 1, className }: Props) {
  const clipId = useId();
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!leaky) {
      setPulse(0);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => setPulse((p) => (p + 1) % 3), 900);
    return () => window.clearInterval(id);
  }, [leaky]);

  const innerW = W - M.l - M.r;
  const innerH = H - M.t - M.b;
  const wx = wallPx();
  const pipeY = M.t + innerH * 0.38;
  const pipeH = innerH * 0.42;
  const trainW = wx - M.l;
  const testW = W - M.r - wx;

  const stages = [
    { x: M.l + innerW * 0.1, label: "all rows" },
    { x: M.l + innerW * 0.3, label: "pick features" },
    { x: M.l + innerW * 0.78, label: "fit & score" },
  ];

  const r2Hue = leaky ? "var(--viz-error-ink)" : "var(--viz-neutral-ink)";
  const r2Note = leaky ? "contaminated" : "honest";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={
        leaky
          ? `Provenance pipe with a leak: test-fold information crosses the train-test wall back into feature selection, producing a false CV R² of ${r2.toFixed(2)}.`
          : `Provenance pipe sealed: feature selection stays on training rows only; CV R² is ${r2.toFixed(2)}.`
      }
      className={`h-auto w-full ${className ?? ""}`}
      style={{ opacity: reveal, transition: "opacity 500ms ease" }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={M.l} y={M.t} width={innerW} height={innerH} />
        </clipPath>
        <marker id="leak-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--viz-error)" />
        </marker>
      </defs>

      {/* pipe body */}
      <rect x={M.l} y={pipeY} width={innerW} height={pipeH} rx={8} fill="var(--surface-sunken)" stroke="var(--line)" />
      {/* train / test zones */}
      <rect x={M.l} y={pipeY} width={trainW} height={pipeH} fill="var(--viz-truth)" fillOpacity={0.08} clipPath={`url(#${clipId})`} />
      <rect x={wx} y={pipeY} width={testW} height={pipeH} fill="var(--viz-prediction)" fillOpacity={0.08} clipPath={`url(#${clipId})`} />

      {/* train/test wall */}
      <line
        x1={wx}
        y1={pipeY - 10}
        x2={wx}
        y2={pipeY + pipeH + 10}
        stroke={leaky ? "var(--viz-error)" : "var(--accent)"}
        strokeWidth={leaky ? 2.5 : 3}
        strokeDasharray={leaky ? "6 4" : undefined}
      />
      <text x={wx} y={pipeY - 16} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill={leaky ? "var(--viz-error-ink)" : "var(--accent)"}>
        {leaky ? "wall breached" : "wall sealed"}
      </text>
      <text x={M.l + trainW / 2} y={pipeY + pipeH + 14} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        train folds
      </text>
      <text x={wx + testW / 2} y={pipeY + pipeH + 14} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        held-out folds
      </text>

      {/* row dots in pipe — train side dense, test side peeked in leaky mode */}
      {Array.from({ length: 16 }, (_, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const inTest = i >= 12;
        const cx = inTest
          ? wx + 8 + col * ((testW - 16) / 7)
          : M.l + 8 + col * ((trainW - 16) / 7);
        const cy = pipeY + 12 + row * 14;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={3.2}
            fill={inTest ? "var(--viz-prediction)" : "var(--viz-truth)"}
            fillOpacity={0.75}
          />
        );
      })}

      {/* feature selection box */}
      <rect
        x={stages[1].x - 44}
        y={pipeY - 28}
        width={88}
        height={22}
        rx={4}
        fill="var(--surface-raised)"
        stroke={leaky ? "var(--viz-error)" : "var(--accent)"}
        strokeWidth={1.5}
      />
      <text x={stages[1].x} y={pipeY - 14} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
        {leaky ? "10 feats · all rows" : "10 feats · train only"}
      </text>

      {/* forward flow arrows */}
      {[0, 1].map((i) => (
        <line
          key={`fwd${i}`}
          x1={stages[i].x + 36}
          y1={pipeY + pipeH / 2}
          x2={stages[i + 1].x - 40}
          y2={pipeY + pipeH / 2}
          stroke="var(--ink-faint)"
          strokeWidth={1.5}
          markerEnd="url(#leak-arrow)"
          opacity={0.35}
        />
      ))}
      <line
        x1={wx + 12}
        y1={pipeY + pipeH / 2}
        x2={stages[2].x - 50}
        y2={pipeY + pipeH / 2}
        stroke="var(--ink-faint)"
        strokeWidth={1.5}
        opacity={0.35}
      />

      {/* forbidden back-flow — the leak */}
      {leaky && (
        <g opacity={0.85 + pulse * 0.05}>
          <path
            d={`M ${wx + testW * 0.35} ${pipeY + 8} Q ${wx + innerW * 0.08} ${pipeY - 42} ${stages[1].x} ${pipeY - 28}`}
            fill="none"
            stroke="var(--viz-error)"
            strokeWidth={2.25}
            strokeDasharray="5 4"
            markerEnd="url(#leak-arrow)"
          />
          <text x={wx + testW * 0.2} y={pipeY - 48} fontSize={10} fontWeight={600} fill="var(--viz-error-ink)">
            test rows peek
          </text>
        </g>
      )}

      {/* stage labels */}
      {stages.map((s) => (
        <text key={s.label} x={s.x} y={H - 12} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          {s.label}
        </text>
      ))}

      {/* CV score gauge — the contaminated readout */}
      <g transform={`translate(${stages[2].x + 52}, ${pipeY + pipeH / 2 - 28})`}>
        <rect x={0} y={0} width={72} height={56} rx={6} fill="var(--surface-raised)" stroke={leaky ? "var(--viz-error)" : "var(--line)"} strokeWidth={1.5} />
        <text x={36} y={16} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          CV R²
        </text>
        <text x={36} y={38} textAnchor="middle" fontSize={20} fontFamily="var(--font-mono)" fill={r2Hue}>
          {r2.toFixed(2)}
        </text>
        <text x={36} y={50} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          {r2Note}
        </text>
      </g>
    </svg>
  );
}
