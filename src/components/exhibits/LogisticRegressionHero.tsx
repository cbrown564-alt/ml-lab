"use client";

import { useEffect, useId, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { accuracy, boundaryX2, createLogisticDescent, proba, score, sigmoid, type LogisticParams, type LogisticStep } from "@/lib/models/logistic";
import { logisticPoints } from "@content/exhibits/logistic-regression/experiment";

/**
 * The specimen hero — what a classifier learns, as a before/after. Untrained vs
 * trained decision fields, linked by a RepresentationPortal: a movable probe on the
 * 2-D plane drives a 1-D sigmoid strip where the p=0.5 crossing is tethered to the
 * decision boundary. Reduced motion renders fields drawn.
 */

const TRACE: LogisticStep[] = (() => {
  const run = createLogisticDescent(logisticPoints, { lr: 0.5, l2: 1e-3 });
  run.run(220);
  return [...run.trace];
})();
const UNTRAINED = TRACE[0].params;
const TRAINED = TRACE[TRACE.length - 1].params;
const ACC0 = Math.round(accuracy(logisticPoints, UNTRAINED) * 100);
const ACC1 = Math.round(accuracy(logisticPoints, TRAINED) * 100);
const DOMAIN: [number, number] = [-3.6, 3.6];
const PROBE_DEFAULT = { x1: 0.2, x2: 0.5 };

/** ProbeLens — 1-D sigmoid linked to the 2-D probe; 0.5 mark tracks the boundary. */
function SigmoidPortal({
  params,
  probeX1,
  width = 520,
}: {
  params: LogisticParams;
  probeX1: number;
  width?: number;
}) {
  const h = 72;
  const m = { l: 44, r: 14, t: 10, b: 22 };
  const plotW = width - m.l - m.r;
  const plotH = h - m.t - m.b;
  const xScale = (v: number) => m.l + ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * plotW;
  const yScale = (p: number) => m.t + plotH * (1 - p);

  const boundaryX1 =
    params.w1 !== 0 ? -(params.b + params.w2 * probeX1) / params.w1 : probeX1;

  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x1 = DOMAIN[0] + ((DOMAIN[1] - DOMAIN[0]) * i) / 80;
    const z = score(params, x1, boundaryX2(params, x1));
    pts.push(`${xScale(x1)},${yScale(sigmoid(z))}`);
  }

  return (
    <svg viewBox={`0 0 ${width} ${h}`} className="w-full" role="img" aria-label="Sigmoid curve along the decision boundary slice; probe marks current probability.">
      <line x1={m.l} x2={width - m.r} y1={yScale(0.5)} y2={yScale(0.5)} stroke="var(--viz-neutral-ink)" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
      <text x={m.l} y={yScale(0.5) - 4} fontSize={9} fontFamily="var(--font-mono)" fill="var(--viz-neutral-ink)">p = ½</text>
      <polyline points={pts.join(" ")} fill="none" stroke="var(--viz-prediction)" strokeWidth={2.5} />
      <line
        x1={xScale(probeX1)}
        x2={xScale(probeX1)}
        y1={m.t}
        y2={h - m.b}
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <circle cx={xScale(probeX1)} cy={yScale(proba(params, probeX1, boundaryX2(params, probeX1)))} r={5} fill="var(--accent)" stroke="var(--surface-bg)" strokeWidth={1.5} />
      <text x={xScale(probeX1) + 6} y={m.t + 10} fontSize={9} fontFamily="var(--font-mono)" fill="var(--accent)">probe x₁</text>
      {Number.isFinite(boundaryX1) && boundaryX1 >= DOMAIN[0] && boundaryX1 <= DOMAIN[1] && (
        <line x1={xScale(boundaryX1)} x2={xScale(boundaryX1)} y1={m.t} y2={h - m.b} stroke="var(--ink)" strokeWidth={2} opacity={0.5} />
      )}
      <text x={width - m.r} y={h - 4} textAnchor="end" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">x₁ → sigmoid(z)</text>
    </svg>
  );
}

function ProbeOverlay({
  params,
  probe,
  onMove,
}: {
  params: LogisticParams;
  probe: { x1: number; x2: number };
  onMove: (p: { x1: number; x2: number }) => void;
}) {
  const clipId = useId();
  const w = 520;
  const h = 400;
  const m = { top: 14, right: 14, bottom: 36, left: 44 };
  const sx = (v: number) => m.left + ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (w - m.left - m.right);
  const sy = (v: number) => h - m.bottom - ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (h - m.top - m.bottom);

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={m.left} y={m.top} width={w - m.left - m.right} height={h - m.top - m.bottom} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx={sx(probe.x1)}
          cy={sy(probe.x2)}
          r={9}
          fill="var(--accent)"
          fillOpacity={0.25}
          stroke="var(--accent)"
          strokeWidth={2}
          className="pointer-events-auto cursor-grab"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
            const move = (ev: PointerEvent) => {
              const px = m.left + ((ev.clientX - rect.left) / rect.width) * (w - m.left - m.right);
              const py = m.top + ((ev.clientY - rect.top) / rect.height) * (h - m.top - m.bottom);
              const x1 = DOMAIN[0] + ((px - m.left) / (w - m.left - m.right)) * (DOMAIN[1] - DOMAIN[0]);
              const x2 = DOMAIN[0] + (1 - (py - m.top) / (h - m.top - m.bottom)) * (DOMAIN[1] - DOMAIN[0]);
              onMove({
                x1: Math.max(DOMAIN[0], Math.min(DOMAIN[1], x1)),
                x2: Math.max(DOMAIN[0], Math.min(DOMAIN[1], x2)),
              });
            };
            const up = () => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }}
        />
      </g>
    </svg>
  );
}

function Panel({
  kicker,
  acc,
  accHue,
  params,
  reveal,
  probe,
  onProbe,
  showPortal,
}: {
  kicker: string;
  acc: number;
  accHue: string;
  params: LogisticParams;
  reveal: number;
  probe: { x1: number; x2: number };
  onProbe: (p: { x1: number; x2: number }) => void;
  showPortal: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</span>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: accHue }}>
          {acc}%
        </span>
      </div>
      <div className="relative" style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
        <DecisionField points={logisticPoints} params={params} showProb width={520} height={400} />
        {showPortal && <ProbeOverlay params={params} probe={probe} onMove={onProbe} />}
      </div>
      {showPortal && reveal > 0.5 && (
        <div className="mt-2 border-t border-line pt-2">
          <SigmoidPortal params={params} probeX1={probe.x1} />
        </div>
      )}
    </div>
  );
}

export function LogisticRegressionHero() {
  const [reveal, setReveal] = useState(0);
  const [probe, setProbe] = useState(PROBE_DEFAULT);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 360);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Logistic regression
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          2-D field ↔ 1-D sigmoid · drag probe
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        <Panel kicker="untrained — no opinion" acc={ACC0} accHue="var(--ink-muted)" params={UNTRAINED} reveal={reveal} probe={probe} onProbe={setProbe} showPortal={false} />
        <Panel kicker="trained — the boundary" acc={ACC1} accHue="var(--viz-prediction-ink)" params={TRAINED} reveal={reveal} probe={probe} onProbe={setProbe} showPortal />
      </div>
    </figure>
  );
}
