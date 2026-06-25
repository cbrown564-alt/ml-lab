"use client";

import { useEffect, useState } from "react";
import type { DescentStep } from "@/lib/models/linear-regression";

/**
 * Step microscope — freeze one gradient-descent update and decompose it: the
 * gradient components, the scaled step (α·∇L), the parameter delta, and the
 * loss change before resuming the walk.
 */

type Props = {
  before: DescentStep;
  after: DescentStep;
  learningRate: number;
  /** Hero entrance; reduced motion shows the full decomposition immediately. */
  reveal?: boolean;
  className?: string;
};

const W = 640;
const H = 280;

function Bar({
  x,
  y,
  w,
  h,
  fill,
  fillOpacity = 1,
  label,
  value,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  fillOpacity?: number;
  label: string;
  value: string;
}) {
  return (
    <g>
      <text x={x} y={y - 4} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        {label}
      </text>
      <rect x={x} y={y} width={Math.max(2, w)} height={h} rx={2} fill={fill} fillOpacity={fillOpacity} />
      <text x={x + w + 6} y={y + h / 2 + 4} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
        {value}
      </text>
    </g>
  );
}

export function GradientDescentMicroscope({ before, after, learningRate, reveal = false, className }: Props) {
  const [shown, setShown] = useState(reveal ? 1 : 0);
  const g = before.gradient;
  const dSlope = after.params.slope - before.params.slope;
  const dInt = after.params.intercept - before.params.intercept;
  const stepSlope = -learningRate * g.dSlope;
  const stepInt = -learningRate * g.dIntercept;
  const dLoss = after.loss - before.loss;

  useEffect(() => {
    if (!reveal) {
      setShown(1);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(1);
      return;
    }
    const t = window.setTimeout(() => setShown(1), 280);
    return () => window.clearTimeout(t);
  }, [reveal, before.step]);

  const scale = 42 / Math.max(0.01, Math.abs(g.dSlope), Math.abs(g.dIntercept), Math.abs(stepSlope), Math.abs(stepInt));
  const barY = 108;
  const barH = 14;
  const col1 = 24;
  const col2 = 200;
  const col3 = 376;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Step ${before.step} to ${after.step}: gradient (${g.dSlope.toFixed(3)}, ${g.dIntercept.toFixed(3)}), learning-rate step, parameter update, loss ${before.loss.toFixed(2)} to ${after.loss.toFixed(2)}.`}
      className={`h-auto w-full ${className ?? ""}`}
      style={{ opacity: shown, transition: "opacity 450ms ease" }}
    >
      {/* frozen step header */}
      <text x={W / 2} y={22} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        step {before.step} → {after.step} · frozen update
      </text>

      {/* mini parameter-space sketch */}
      <g transform="translate(24, 36)">
        <rect x={0} y={0} width={140} height={56} rx={6} fill="var(--surface-sunken)" stroke="var(--line)" />
        <circle cx={48} cy={34} r={5} fill="var(--viz-param)" />
        <text x={48} y={20} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--viz-param-ink)">
          θₜ
        </text>
        <line x1={48} y1={34} x2={98} y2={18} stroke="var(--viz-param)" strokeWidth={2} markerEnd="url(#micro-arrow)" />
        <circle cx={98} cy={18} r={5} fill="var(--viz-prediction)" />
        <text x={98} y={48} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--viz-prediction-ink)">
          θₜ₊₁
        </text>
        <text x={70} y={12} textAnchor="middle" fontSize={8} fill="var(--viz-param-ink)">
          −α∇L
        </text>
      </g>

      <defs>
        <marker id="micro-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--viz-param)" />
        </marker>
      </defs>

      {/* decomposition columns */}
      <text x={col1} y={96} fontSize={9} fontFamily="var(--font-mono)" fill="var(--viz-param-ink)">
        ∇L(θ)
      </text>
      <Bar x={col1} y={barY} w={Math.abs(g.dSlope) * scale} h={barH} fill="var(--viz-param)" label="∂L/∂ŵ" value={g.dSlope.toFixed(3)} />
      <Bar x={col1} y={barY + 28} w={Math.abs(g.dIntercept) * scale} h={barH} fill="var(--viz-param)" label="∂L/∂b" value={g.dIntercept.toFixed(3)} />

      <text x={col2} y={96} fontSize={9} fontFamily="var(--font-mono)" fill="var(--viz-param-ink)">
        α · ∇L · (−1)
      </text>
      <Bar x={col2} y={barY} w={Math.abs(stepSlope) * scale} h={barH} fill="var(--viz-param)" fillOpacity={0.7} label="Δŵ step" value={stepSlope.toFixed(4)} />
      <Bar x={col2} y={barY + 28} w={Math.abs(stepInt) * scale} h={barH} fill="var(--viz-param)" fillOpacity={0.7} label="Δb step" value={stepInt.toFixed(4)} />

      <text x={col3} y={96} fontSize={9} fontFamily="var(--font-mono)" fill="var(--viz-prediction-ink)">
        θₜ₊₁ − θₜ
      </text>
      <Bar x={col3} y={barY} w={Math.abs(dSlope) * scale} h={barH} fill="var(--viz-prediction)" label="Δŵ" value={dSlope.toFixed(4)} />
      <Bar x={col3} y={barY + 28} w={Math.abs(dInt) * scale} h={barH} fill="var(--viz-prediction)" label="Δb" value={dInt.toFixed(4)} />

      {/* loss change */}
      <g transform="translate(24, 200)">
        <rect x={0} y={0} width={592} height={52} rx={6} fill="var(--surface-sunken)" stroke="var(--line)" />
        <text x={16} y={20} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          LOSS
        </text>
        <text x={16} y={40} fontSize={14} fontFamily="var(--font-mono)" fill="var(--viz-error-ink)">
          {before.loss.toFixed(2)}
        </text>
        <text x={100} y={40} fontSize={14} fill="var(--ink-faint)">
          →
        </text>
        <text x={130} y={40} fontSize={14} fontFamily="var(--font-mono)" fill="var(--viz-error-ink)">
          {after.loss.toFixed(2)}
        </text>
        <text x={280} y={40} fontSize={12} fontFamily="var(--font-mono)" fill={dLoss <= 0 ? "var(--viz-prediction-ink)" : "var(--viz-error-ink)"}>
          ΔL = {dLoss >= 0 ? "+" : ""}
          {dLoss.toFixed(3)}
          {dLoss <= 0 ? " ↓" : " ↑"}
        </text>
        <text x={480} y={40} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          α = {learningRate}
        </text>
      </g>
    </svg>
  );
}
