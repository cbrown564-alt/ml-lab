"use client";

import { useMemo } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { StatGrid } from "@/components/viz/StatGrid";
import { RegularizationCurves } from "@/components/exhibits/RegularizationCurves";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { RegularizationFrame } from "@content/exhibits/overfitting-regularization/spine";
import type { Point } from "@/lib/models/linear-regression";
import { chebMSE, predictCheb, ridgeFitCheb } from "@/lib/models/polynomial";
import { REG_DEGREE } from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The See-it graphic: the degree-12 fit under the penalty the active beat asserts —
 * overfit wiggle at λ→0, relaxed onto the smooth shape once λ bites — with the
 * error-vs-λ chart beside it.
 */
const TRAIN: Point[] = fixtures.train as Point[];
const TEST: Point[] = fixtures.test as Point[];

function TestPoints({ points }: { points: Point[] }) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {points.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r={3.5} fill="none" stroke="var(--viz-truth)" strokeWidth={1.25} strokeOpacity={0.55} />
      ))}
    </g>
  );
}

export function RegularizationStory() {
  const frame = useActiveFrame<RegularizationFrame>();
  const lambda = frame?.lambda ?? 1e-4;
  const m = useMemo(() => ridgeFitCheb(TRAIN, REG_DEGREE, lambda), [lambda]);
  const trainErr = chebMSE(TRAIN, m);
  const testErr = chebMSE(TEST, m);
  const regime = lambda < 0.02 ? "no penalty — overfitting" : lambda > 5 ? "over-penalised — underfitting" : "reined in";

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        λ = {lambda < 0.01 ? lambda.toExponential(0) : lambda.toFixed(2)} — {regime}
      </figcaption>
      <Plot
        width={640}
        height={420}
        xDomain={[-0.02, 1.02]}
        yDomain={[-1.8, 1.8]}
        ariaLabel={`A degree-${REG_DEGREE} polynomial with ridge penalty λ = ${lambda.toExponential(1)}; training error ${trainErr.toFixed(3)}, test error ${testErr.toFixed(3)}. ${regime}.`}
      >
        <Axes />
        <TestPoints points={TEST} />
        <PolyCurve predict={(xv) => predictCheb(m, xv)} />
        <DataPoints points={TRAIN} />
      </Plot>
      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <StatGrid
          caption="The two scores"
          stats={[
            { label: "training error", value: trainErr.toFixed(3), hue: "var(--viz-neutral)", note: "seen" },
            { label: "test error", value: testErr.toFixed(3), hue: "var(--viz-error)", note: "unseen — honest" },
          ]}
        />
        <RegularizationCurves train={TRAIN} test={TEST} degree={REG_DEGREE} lambda={lambda} width={340} height={170} />
      </div>
    </figure>
  );
}
