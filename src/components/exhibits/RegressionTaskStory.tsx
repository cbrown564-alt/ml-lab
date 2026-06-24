"use client";

import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { RegressionTaskFrame } from "@content/exhibits/regression-task/spine";
import { toClass } from "@/lib/models/regression-task";
import {
  PASS_LINE,
  queryPoints,
  shownExamples,
  X_LABEL,
  Y_LABEL,
  type Example,
} from "@content/exhibits/regression-task/experiment";

/**
 * The See-it graphic: the same study-hours/score data, framed two ways. As a regression
 * task the score is a continuous height and a prediction's error is a distance (one demo
 * residual); as a classification task the scores split at the pass line into two coloured
 * classes and a prediction is simply right or wrong.
 */
const ALL: Example[] = [...shownExamples, ...queryPoints].sort((a, b) => a.x - b.x);
const DEMO = queryPoints[1] ?? queryPoints[0]; // a representative point for the residual
const DEMO_PRED = Math.min(100, DEMO.y + 11);

function Points({ mode }: { mode: RegressionTaskFrame["mode"] }) {
  const { x, y } = usePlot();
  if (mode === "classification") {
    return (
      <g>
        <line x1={x(0)} x2={x(10.4)} y1={y(PASS_LINE)} y2={y(PASS_LINE)} stroke="var(--viz-neutral-ink)" strokeWidth={1.5} strokeDasharray="5 3" />
        <text x={x(10.2)} y={y(PASS_LINE) - 6} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" fill="var(--viz-neutral-ink)">pass line · {PASS_LINE}</text>
        {ALL.map((p, i) => {
          const pass = toClass(p.y, PASS_LINE) === "pass";
          return <circle key={i} cx={x(p.x)} cy={y(p.y)} r={5} fill={pass ? "var(--viz-prediction)" : "var(--viz-truth)"} />;
        })}
      </g>
    );
  }
  return (
    <g>
      {ALL.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r={5} fill="var(--viz-truth)" />
      ))}
      {mode === "regression" && (
        <g>
          <line x1={x(DEMO.x)} x2={x(DEMO.x)} y1={y(DEMO_PRED)} y2={y(DEMO.y)} stroke="var(--viz-error)" strokeWidth={2.5} />
          <line x1={x(DEMO.x) - 24} x2={x(DEMO.x) + 24} y1={y(DEMO_PRED)} y2={y(DEMO_PRED)} stroke="var(--viz-prediction)" strokeWidth={3} strokeLinecap="round" />
          <circle cx={x(DEMO.x)} cy={y(DEMO_PRED)} r={5.5} fill="var(--viz-prediction)" stroke="var(--surface-bg)" strokeWidth={1.5} />
          <text x={x(DEMO.x) + 10} y={(y(DEMO_PRED) + y(DEMO.y)) / 2} fontSize={12} fontWeight={600} fill="var(--viz-error-ink)">distance</text>
        </g>
      )}
    </g>
  );
}

function AxisCaptions() {
  const { x, y, height } = usePlot();
  return (
    <g aria-hidden fill="var(--ink-faint)" fontSize={11} fontFamily="var(--font-mono)">
      <text x={(x.range[0] + x.range[1]) / 2} y={height - 4} textAnchor="middle">{X_LABEL}</text>
      <text transform={`translate(12, ${(y.range[0] + y.range[1]) / 2}) rotate(-90)`} textAnchor="middle">{Y_LABEL}</text>
    </g>
  );
}

export function RegressionTaskStory() {
  const frame = useActiveFrame<RegressionTaskFrame>();
  const mode = frame?.mode ?? "anatomy";
  const caption =
    mode === "classification"
      ? "As classification — pass / fail, scored right-or-wrong"
      : mode === "regression"
        ? "As regression — predict a number, error is a distance"
        : "Examples: features in, a continuous answer out";

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">{caption}</figcaption>
      <Plot
        width={580}
        height={420}
        xDomain={[0, 10.4]}
        yDomain={[0, 100]}
        ariaLabel={`Study hours versus exam score, framed as ${mode}. ${caption}.`}
      >
        <Axes />
        <AxisCaptions />
        <Points mode={mode} />
      </Plot>
    </figure>
  );
}
