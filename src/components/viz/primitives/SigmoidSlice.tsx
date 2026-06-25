"use client";

import { boundaryX2, proba, score, sigmoid, type LogisticParams } from "@/lib/models/logistic";
import { MOTION_QUICK, usePrefersReducedMotion } from "./shared";

/**
 * 1-D sigmoid slice linked to a 2-D probe — the p=½ crossing is tethered to the
 * decision boundary at the probe's x₂.
 */
export function SigmoidSlice({
  params,
  probeX1,
  probeX2,
  width = 520,
  height = 76,
  linked = false,
}: {
  params: LogisticParams;
  probeX1: number;
  probeX2: number;
  width?: number;
  height?: number;
  /** When true, accent stroke connects probe to the sigmoid readout. */
  linked?: boolean;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const domain: [number, number] = [-3.6, 3.6];
  const m = { l: 44, r: 14, t: 12, b: 24 };
  const plotW = width - m.l - m.r;
  const plotH = height - m.t - m.b;
  const xScale = (v: number) => m.l + ((v - domain[0]) / (domain[1] - domain[0])) * plotW;
  const yScale = (p: number) => m.t + plotH * (1 - p);

  const boundaryX1 =
    params.w1 !== 0 ? -(params.b + params.w2 * probeX2) / params.w1 : probeX1;
  const probeP = proba(params, probeX1, probeX2);

  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x1 = domain[0] + ((domain[1] - domain[0]) * i) / 80;
    const z = score(params, x1, probeX2);
    pts.push(`${xScale(x1)},${yScale(sigmoid(z))}`);
  }

  const boundaryInView =
    Number.isFinite(boundaryX1) &&
    boundaryX1 >= domain[0] &&
    boundaryX1 <= domain[1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`Sigmoid along x₁ at fixed x₂=${probeX2.toFixed(1)}; probe probability ${probeP.toFixed(2)}; decision boundary at x₁=${boundaryInView ? boundaryX1.toFixed(2) : "—"}.`}
    >
      {/* p=½ baseline — attached to boundary crossing */}
      <line
        x1={m.l}
        x2={width - m.r}
        y1={yScale(0.5)}
        y2={yScale(0.5)}
        stroke="var(--viz-neutral-ink)"
        strokeWidth={1}
        strokeDasharray="4 3"
        opacity={0.55}
      />
      <text
        x={m.l + 2}
        y={yScale(0.5) - 5}
        fontSize={9}
        fontFamily="var(--font-mono)"
        fill="var(--viz-neutral-ink)"
      >
        p = ½
      </text>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--viz-prediction)"
        strokeWidth={2.5}
      />
      {boundaryInView && (
        <>
          <line
            x1={xScale(boundaryX1)}
            x2={xScale(boundaryX1)}
            y1={m.t}
            y2={height - m.b}
            stroke="var(--ink)"
            strokeWidth={2}
            opacity={0.65}
          />
          <circle
            cx={xScale(boundaryX1)}
            cy={yScale(0.5)}
            r={4}
            fill="var(--surface-bg)"
            stroke="var(--ink)"
            strokeWidth={1.5}
          />
          <text
            x={xScale(boundaryX1)}
            y={height - 6}
            textAnchor="middle"
            fontSize={9}
            fontFamily="var(--font-mono)"
            fill="var(--ink-muted)"
          >
            boundary
          </text>
        </>
      )}
      <line
        x1={xScale(probeX1)}
        x2={xScale(probeX1)}
        y1={m.t}
        y2={height - m.b}
        stroke="var(--accent)"
        strokeWidth={linked ? 2 : 1.5}
        strokeDasharray="3 3"
        style={{
          transition: reduceMotion ? undefined : `stroke-width ${MOTION_QUICK}`,
        }}
      />
      <circle
        cx={xScale(probeX1)}
        cy={yScale(probeP)}
        r={5.5}
        fill="var(--accent)"
        stroke="var(--surface-bg)"
        strokeWidth={1.5}
        style={{
          transition: reduceMotion
            ? undefined
            : `cx ${MOTION_QUICK}, cy ${MOTION_QUICK}`,
        }}
      />
      <text
        x={xScale(probeX1) + 7}
        y={m.t + 11}
        fontSize={9}
        fontFamily="var(--font-mono)"
        fill="var(--accent)"
      >
        p = {probeP.toFixed(2)}
      </text>
      <text
        x={width - m.r}
        y={height - 6}
        textAnchor="end"
        fontSize={9}
        fontFamily="var(--font-mono)"
        fill="var(--ink-faint)"
      >
        x₁ → σ(z) · x₂ fixed
      </text>
    </svg>
  );
}
