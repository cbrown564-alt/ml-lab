"use client";

import { linearScale } from "@/lib/viz/scale";
import type { DescentStep } from "@/lib/models/linear-regression";

/**
 * Training curve — loss vs step on a log-10 y axis (viz kit v1). Log scale
 * is the only honest frame for descent: convergence shrinks the loss by
 * decades and divergence grows it by decades, and both must stay readable.
 * Loss is always the error hue.
 */

const MARGIN = { top: 16, right: 16, bottom: 36, left: 56 };
const LOG_FLOOR = 1e-12;

const logLoss = (loss: number) => Math.log10(Math.max(loss, LOG_FLOOR));

const decadeLabel = (exp: number) =>
  exp >= -3 && exp <= 4 ? String(10 ** exp) : `1e${exp}`;

export function TrainingCurve({
  trace,
  cursor,
  width = 440,
  height = 420,
}: {
  trace: ReadonlyArray<DescentStep>;
  /** Index into the trace currently shown by the exhibit (scrub position). */
  cursor: number;
  width?: number;
  height?: number;
}) {
  const finite = trace.filter((s) => Number.isFinite(s.loss));

  let lo = Infinity;
  let hi = -Infinity;
  for (const s of finite) {
    const v = logLoss(s.loss);
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (finite.length === 0) {
    lo = 0;
    hi = 1;
  }
  lo = Math.floor(lo);
  hi = Math.ceil(hi);
  if (hi - lo < 2) hi = lo + 2; // never flatline the frame

  const xMax = Math.max(20, trace.length - 1);
  const x = linearScale([0, xMax], [MARGIN.left, width - MARGIN.right]);
  const y = linearScale([lo, hi], [height - MARGIN.bottom, MARGIN.top]);
  const yBase = height - MARGIN.bottom;

  // Non-finite losses (true divergence) pin to the top of the frame.
  const yFor = (s: DescentStep) => (Number.isFinite(s.loss) ? y(logLoss(s.loss)) : y(hi));
  // Round emitted coordinates: a precomputed trace is rendered on the server and
  // rehydrated on the client, and Math.log10 over a long walk can differ by a
  // ULP between V8 builds — enough to mismatch the path string. Two decimals is
  // sub-pixel and deterministic across both.
  const snap = (n: number) => Math.round(n * 100) / 100;
  const path = trace.map((s) => `${snap(x(s.step))},${snap(yFor(s))}`).join(" ");

  const decadeStep = Math.max(1, Math.ceil((hi - lo) / 6));
  const decades: number[] = [];
  for (let d = lo; d <= hi; d += decadeStep) decades.push(d);

  const current = trace[Math.min(cursor, trace.length - 1)];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        current
          ? `Training curve: loss over ${trace.length - 1} descent steps, log scale. At step ${current.step} the loss is ${Number.isFinite(current.loss) ? current.loss.toPrecision(3) : "infinite"}.`
          : "Training curve: loss over descent steps, log scale."
      }
      className="h-auto w-full select-none"
    >
      <g aria-hidden>
        {decades.map((d) => (
          <g key={d} transform={`translate(${MARGIN.left},${y(d)})`}>
            <line x1={-5} stroke="var(--line)" />
            <line x2={width - MARGIN.right - MARGIN.left} stroke="var(--line)" strokeOpacity={0.35} />
            <text
              x={-9}
              dy="0.32em"
              textAnchor="end"
              fontSize={11}
              fill="var(--ink-faint)"
              fontFamily="var(--font-mono)"
            >
              {decadeLabel(d)}
            </text>
          </g>
        ))}
        {x.ticks(5).map((t) => (
          <g key={t} transform={`translate(${x(t)},${yBase})`}>
            <line y2={5} stroke="var(--line)" />
            <text
              y={20}
              textAnchor="middle"
              fontSize={11}
              fill="var(--ink-faint)"
              fontFamily="var(--font-mono)"
            >
              {t}
            </text>
          </g>
        ))}
        <line x1={MARGIN.left} x2={width - MARGIN.right} y1={yBase} y2={yBase} stroke="var(--line)" />
        <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={yBase} stroke="var(--line)" />
        <text
          x={width - MARGIN.right}
          y={yBase + 32}
          textAnchor="end"
          fontSize={11}
          fill="var(--ink-faint)"
        >
          step
        </text>
        <text x={MARGIN.left} y={MARGIN.top - 4} fontSize={11} fill="var(--ink-faint)">
          loss (log)
        </text>

        {trace.length > 1 && (
          <polyline
            points={path}
            fill="none"
            stroke="var(--viz-error)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}
        {current && (
          <circle
            cx={snap(x(current.step))}
            cy={snap(yFor(current))}
            r={5}
            fill="var(--viz-error)"
            stroke="var(--surface-bg)"
            strokeWidth={1.5}
          />
        )}
      </g>
    </svg>
  );
}
