"use client";

import { useEffect, useState } from "react";
import { StepMicroscope } from "@/components/viz/primitives/StepMicroscope";
import { usePrefersReducedMotion } from "@/components/viz/primitives/shared";
import type { DescentStep, LinearParams } from "@/lib/models/linear-regression";

/**
 * Step microscope — freeze one gradient-descent update and decompose it: the
 * gradient components, the scaled step (α·∇L), the parameter delta, and the
 * loss change before resuming the walk. Composes the shared StepMicroscope layout.
 */

type Props = {
  before: DescentStep;
  after: DescentStep;
  learningRate: number;
  /** Hero entrance; reduced motion shows the full decomposition immediately. */
  reveal?: boolean;
  className?: string;
};

function ThetaSketch({
  params,
  label,
  accent = false,
}: {
  params: LinearParams;
  label: string;
  accent?: boolean;
}) {
  return (
    <svg viewBox="0 0 140 72" className="h-auto w-full min-w-[100px]" aria-hidden>
      <rect x={0} y={8} width={140} height={56} rx={6} fill="var(--surface-sunken)" stroke="var(--line)" />
      <circle cx={48} cy={42} r={5} fill={accent ? "var(--viz-prediction)" : "var(--viz-param)"} />
      <text
        x={48}
        y={28}
        textAnchor="middle"
        fontSize={8}
        fontFamily="var(--font-mono)"
        fill={accent ? "var(--viz-prediction-ink)" : "var(--viz-param-ink)"}
      >
        {label}
      </text>
      <text x={70} y={22} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        ŵ={params.slope.toFixed(2)}
      </text>
      <text x={70} y={34} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        b={params.intercept.toFixed(2)}
      </text>
    </svg>
  );
}

function DecompositionBars({
  before,
  after,
  learningRate,
}: {
  before: DescentStep;
  after: DescentStep;
  learningRate: number;
}) {
  const g = before.gradient;
  const dSlope = after.params.slope - before.params.slope;
  const dInt = after.params.intercept - before.params.intercept;
  const stepSlope = -learningRate * g.dSlope;
  const stepInt = -learningRate * g.dIntercept;
  const dLoss = after.loss - before.loss;

  const scale =
    38 /
    Math.max(
      0.01,
      Math.abs(g.dSlope),
      Math.abs(g.dIntercept),
      Math.abs(stepSlope),
      Math.abs(stepInt),
      Math.abs(dSlope),
      Math.abs(dInt),
    );
  const barH = 11;
  const row = (y: number, label: string, w: number, fill: string, value: string, opacity = 1) => (
    <g key={label}>
      <text x={0} y={y - 3} fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        {label}
      </text>
      <rect x={0} y={y} width={Math.max(2, w)} height={barH} rx={2} fill={fill} fillOpacity={opacity} />
      <text x={Math.max(2, w) + 5} y={y + barH / 2 + 3} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
        {value}
      </text>
    </g>
  );

  return (
    <svg
      viewBox="0 0 280 200"
      className="h-auto w-full min-w-[200px]"
      role="img"
      aria-label={`Gradient (${g.dSlope.toFixed(3)}, ${g.dIntercept.toFixed(3)}), scaled step, parameter delta, loss ${before.loss.toFixed(2)} to ${after.loss.toFixed(2)}.`}
    >
      <text x={140} y={12} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--viz-param-ink)">
        ∇L → α·∇L → Δθ
      </text>
      {row(28, "∂L/∂ŵ", Math.abs(g.dSlope) * scale, "var(--viz-param)", g.dSlope.toFixed(3))}
      {row(52, "∂L/∂b", Math.abs(g.dIntercept) * scale, "var(--viz-param)", g.dIntercept.toFixed(3))}
      {row(84, "Δŵ step", Math.abs(stepSlope) * scale, "var(--viz-param)", stepSlope.toFixed(4), 0.75)}
      {row(108, "Δb step", Math.abs(stepInt) * scale, "var(--viz-param)", stepInt.toFixed(4), 0.75)}
      {row(140, "Δŵ", Math.abs(dSlope) * scale, "var(--viz-prediction)", dSlope.toFixed(4))}
      {row(164, "Δb", Math.abs(dInt) * scale, "var(--viz-prediction)", dInt.toFixed(4))}
      <g transform="translate(0, 182)">
        <text fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          LOSS {before.loss.toFixed(2)} → {after.loss.toFixed(2)} · ΔL={dLoss >= 0 ? "+" : ""}
          {dLoss.toFixed(3)}
          {dLoss <= 0 ? " ↓" : " ↑"} · α={learningRate}
        </text>
      </g>
    </svg>
  );
}

export function GradientDescentMicroscope({ before, after, learningRate, reveal = false, className }: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setShown(1);
      return;
    }
    const delay = reveal ? 280 : 0;
    const t = window.setTimeout(() => setShown(1), delay);
    return () => window.clearTimeout(t);
  }, [reveal, reduceMotion, before.step]);

  return (
    <div
      className={`overflow-x-auto ${className ?? ""}`}
      style={{ opacity: shown, transition: reduceMotion ? undefined : "opacity 450ms ease" }}
    >
      <StepMicroscope
        stepIndex={before.step}
        before={<ThetaSketch params={before.params} label="θₜ" />}
        vector={
          <DecompositionBars before={before} after={after} learningRate={learningRate} />
        }
        after={<ThetaSketch params={after.params} label="θₜ₊₁" accent />}
        vectorLabel="decomposition"
        updateLabel="θ ← θ − α∇L"
        ariaLabel={`Step ${before.step} to ${after.step}: frozen gradient-descent update with gradient, scaled step, parameter delta, and loss change.`}
      />
    </div>
  );
}
