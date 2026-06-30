"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Data-leakage provenance pipe — exhibit-specific SVG implementing the
 * {@link ProvenancePipe} visual-argument pattern (train/test wall, boundary
 * violation, contaminated score readout).
 *
 * Stage layout mirrors the shared ProvenancePipe stages: all rows → pick features
 * → fit & score, with the train/test wall between selection and scoring.
 */

export const PROVENANCE_STAGES = [
  { id: "rows", label: "all rows", xFrac: 0.1 },
  { id: "select", label: "pick features", xFrac: 0.3 },
  { id: "score", label: "fit & score", xFrac: 0.78 },
] as const;

const W = 680;
const H = 300;
const M = { l: 24, r: 24, t: 36, b: 44 };
const WALL_X = 0.58;
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
  const prevLeaky = useRef(leaky);
  const [repairFlash, setRepairFlash] = useState(false);

  useEffect(() => {
    if (prevLeaky.current && !leaky) {
      setRepairFlash(true);
      const t = window.setTimeout(() => setRepairFlash(false), 650);
      prevLeaky.current = leaky;
      return () => window.clearTimeout(t);
    }
    prevLeaky.current = leaky;
  }, [leaky]);

  const innerW = W - M.l - M.r;
  const innerH = H - M.t - M.b;
  const wx = wallPx();
  const pipeY = M.t + innerH * 0.38;
  const pipeH = innerH * 0.42;
  const trainW = wx - M.l;
  const testW = W - M.r - wx;

  const stages = PROVENANCE_STAGES.map((s) => ({
    ...s,
    x: M.l + innerW * s.xFrac,
  }));

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
        <marker id="flow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--ink-faint)" />
        </marker>
      </defs>

      <rect x={M.l} y={pipeY} width={innerW} height={pipeH} rx={8} fill="var(--surface-sunken)" stroke="var(--line)" />
      <rect x={M.l} y={pipeY} width={trainW} height={pipeH} fill="var(--viz-truth)" fillOpacity={0.08} clipPath={`url(#${clipId})`} />
      <rect x={wx} y={pipeY} width={testW} height={pipeH} fill="var(--viz-prediction)" fillOpacity={0.08} clipPath={`url(#${clipId})`} />

      <line
        x1={wx}
        y1={pipeY - 10}
        x2={wx}
        y2={pipeY + pipeH + 10}
        stroke={leaky ? "var(--viz-error)" : "var(--accent)"}
        strokeWidth={leaky ? 2.5 : 3}
        strokeDasharray={leaky ? "6 4" : undefined}
        style={{ transition: "stroke 400ms ease, stroke-width 400ms ease" }}
      />
      <text
        x={wx}
        y={pipeY - 16}
        textAnchor="middle"
        fontSize={10}
        fontFamily="var(--font-mono)"
        fill={leaky ? "var(--viz-error-ink)" : "var(--accent)"}
        style={{ transition: "fill 400ms ease" }}
      >
        {leaky ? "wall breached" : "wall sealed"}
      </text>
      <text x={M.l + trainW / 2} y={pipeY + pipeH + 14} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        train folds
      </text>
      <text x={wx + testW / 2} y={pipeY + pipeH + 14} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        held-out folds
      </text>

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

      <rect
        x={stages[1].x - 53}
        y={pipeY - 28}
        width={106}
        height={22}
        rx={4}
        fill="var(--surface-raised)"
        stroke={leaky ? "var(--viz-error)" : "var(--accent)"}
        strokeWidth={1.5}
        style={{ transition: "stroke 400ms ease" }}
      />
      <text x={stages[1].x} y={pipeY - 14} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
        {leaky ? "10 feats · all rows" : "10 feats · train only"}
      </text>

      {[0, 1].map((i) => (
        <line
          key={`fwd${i}`}
          x1={stages[i].x + 36}
          y1={pipeY + pipeH / 2}
          x2={stages[i + 1].x - 40}
          y2={pipeY + pipeH / 2}
          stroke="var(--ink-faint)"
          strokeWidth={1.5}
          markerEnd="url(#flow-arrow)"
          opacity={0.45}
        />
      ))}
      <line
        x1={wx + 12}
        y1={pipeY + pipeH / 2}
        x2={stages[2].x - 50}
        y2={pipeY + pipeH / 2}
        stroke="var(--ink-faint)"
        strokeWidth={1.5}
        opacity={0.45}
      />

      {leaky && (
        <g className="leak-backflow">
          <path
            d={`M ${wx + testW * 0.35} ${pipeY + 8} Q ${wx + innerW * 0.08} ${pipeY - 42} ${stages[1].x} ${pipeY - 28}`}
            fill="none"
            stroke="var(--viz-error)"
            strokeDasharray="5 4"
            markerEnd="url(#leak-arrow)"
          />
          <text x={wx + testW * 0.2} y={pipeY - 48} fontSize={10} fontWeight={600} fill="var(--viz-error-ink)">
            test rows peek
          </text>
        </g>
      )}

      {stages.map((s) => (
        <text key={s.id} x={s.x} y={H - 12} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          {s.label}
        </text>
      ))}

      <g
        transform={`translate(${stages[2].x + 52}, ${pipeY + pipeH / 2 - 28})`}
        className={repairFlash ? "pipe-score-repair" : undefined}
      >
        <rect
          x={0}
          y={0}
          width={72}
          height={56}
          rx={6}
          fill="var(--surface-raised)"
          stroke={leaky ? "var(--viz-error)" : "var(--accent)"}
          strokeWidth={1.5}
          style={{ transition: "stroke 400ms ease" }}
        />
        <text x={36} y={16} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          CV R²
        </text>
        <text
          x={36}
          y={38}
          textAnchor="middle"
          fontSize={20}
          fontFamily="var(--font-mono)"
          fill={r2Hue}
          style={{ transition: "fill 400ms ease" }}
        >
          {r2.toFixed(2)}
        </text>
        <text x={36} y={50} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          {r2Note}
        </text>
      </g>
    </svg>
  );
}
