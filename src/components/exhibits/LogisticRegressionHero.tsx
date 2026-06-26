"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import {
  RepresentationPortal,
  SigmoidSlice,
  useRepresentationPortal,
} from "@/components/viz/primitives";
import { MOTION_QUICK, usePrefersReducedMotion } from "@/components/viz/primitives/shared";
import { accuracy, createLogisticDescent, type LogisticParams, type LogisticStep } from "@/lib/models/logistic";
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
const PROBE_ENTITY = "probe";

function ProbeOverlay({
  probe,
  onMove,
}: {
  probe: { x1: number; x2: number };
  onMove: (p: { x1: number; x2: number }) => void;
}) {
  const clipId = useId();
  const reduceMotion = usePrefersReducedMotion();
  const { setActiveEntityId, isHighlighted } = useRepresentationPortal();
  const highlighted = isHighlighted(PROBE_ENTITY);
  const w = 520;
  const h = 400;
  const m = { top: 14, right: 14, bottom: 36, left: 44 };
  const sx = (v: number) => m.left + ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (w - m.left - m.right);
  const sy = (v: number) => h - m.bottom - ((v - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])) * (h - m.top - m.bottom);

  const clamp = (v: number) => Math.max(DOMAIN[0], Math.min(DOMAIN[1], v));

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGCircleElement>) => {
      setActiveEntityId(PROBE_ENTITY);
      e.currentTarget.setPointerCapture(e.pointerId);
      const svg = e.currentTarget.ownerSVGElement as SVGSVGElement;
      const rect = svg.getBoundingClientRect();

      const move = (ev: PointerEvent) => {
        const px = m.left + ((ev.clientX - rect.left) / rect.width) * (w - m.left - m.right);
        const py = m.top + ((ev.clientY - rect.top) / rect.height) * (h - m.top - m.bottom);
        const x1 = DOMAIN[0] + ((px - m.left) / (w - m.left - m.right)) * (DOMAIN[1] - DOMAIN[0]);
        const x2 = DOMAIN[0] + (1 - (py - m.top) / (h - m.top - m.bottom)) * (DOMAIN[1] - DOMAIN[0]);
        onMove({ x1: clamp(x1), x2: clamp(x2) });
      };

      const up = () => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [onMove, setActiveEntityId],
  );

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
          r={highlighted ? 11 : 9}
          fill="var(--accent)"
          fillOpacity={highlighted ? 0.35 : 0.22}
          stroke="var(--accent)"
          strokeWidth={highlighted ? 2.5 : 2}
          className="pointer-events-auto cursor-grab active:cursor-grabbing"
          style={{
            transition: reduceMotion ? undefined : `cx ${MOTION_QUICK}, cy ${MOTION_QUICK}, r ${MOTION_QUICK}`,
          }}
          onPointerDown={handlePointerDown}
          onMouseEnter={() => setActiveEntityId(PROBE_ENTITY)}
          onMouseLeave={() => setActiveEntityId(null)}
        />
      </g>
    </svg>
  );
}

function SigmoidPortal({
  params,
  probe,
}: {
  params: LogisticParams;
  probe: { x1: number; x2: number };
}) {
  const { isHighlighted } = useRepresentationPortal();
  const highlighted = isHighlighted(PROBE_ENTITY);

  return (
    <div
      className="rounded-md"
      style={{
        boxShadow: highlighted
          ? "0 0 0 2px var(--viz-param), 0 0 12px color-mix(in oklab, var(--viz-param) 35%, transparent)"
          : undefined,
        transition: "box-shadow var(--motion-quick)",
      }}
    >
      <SigmoidSlice
        params={params}
        probeX1={probe.x1}
        probeX2={probe.x2}
        linked={highlighted}
      />
    </div>
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
        {showPortal && <ProbeOverlay probe={probe} onMove={onProbe} />}
      </div>
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
      <RepresentationPortal defaultActiveEntityId={PROBE_ENTITY}>
        <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
          <Panel
            kicker="untrained — no opinion"
            acc={ACC0}
            accHue="var(--ink-muted)"
            params={UNTRAINED}
            reveal={reveal}
            probe={probe}
            onProbe={setProbe}
            showPortal={false}
          />
          <Panel
            kicker="trained — the boundary"
            acc={ACC1}
            accHue="var(--viz-prediction-ink)"
            params={TRAINED}
            reveal={reveal}
            probe={probe}
            onProbe={setProbe}
            showPortal
          />
        </div>
        {reveal > 0.5 && (
          <div className="border-t border-line px-3 py-3">
            <SigmoidPortal params={TRAINED} probe={probe} />
          </div>
        )}
      </RepresentationPortal>
    </figure>
  );
}
