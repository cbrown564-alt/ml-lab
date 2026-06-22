"use client";

import { useMemo } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { StatGrid } from "@/components/viz/StatGrid";
import { ErrorCurves } from "@/components/exhibits/ErrorCurves";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { BiasVarianceFrame } from "@content/exhibits/bias-variance/spine";
import type { Point } from "@/lib/models/linear-regression";
import { polyMSE, ridgeFit } from "@/lib/models/polynomial";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The See-it graphic: the fit at the degree the active beat asserts, with the
 * held-out points and the error-vs-complexity chart beside it so underfit →
 * sweet spot → overfit reads as one moving picture.
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

export function BiasVarianceStory() {
  const frame = useActiveFrame<BiasVarianceFrame>();
  const degree = frame?.degree ?? 1;
  const w = useMemo(() => ridgeFit(TRAIN, degree, 0), [degree]);
  const trainErr = polyMSE(TRAIN, w);
  const testErr = polyMSE(TEST, w);
  const regime = degree <= 2 ? "too stiff — underfitting" : testErr > trainErr * 3 ? "too flexible — overfitting" : "about right";

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Degree {degree} — {regime}
      </figcaption>
      <Plot
        width={640}
        height={420}
        xDomain={[-0.02, 1.02]}
        yDomain={[-1.8, 1.8]}
        ariaLabel={`A degree-${degree} polynomial fit; training error ${trainErr.toFixed(3)}, test error ${testErr.toFixed(3)}. ${regime}.`}
      >
        <Axes />
        <TestPoints points={TEST} />
        <PolyCurve weights={w} />
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
        <ErrorCurves train={TRAIN} test={TEST} degree={degree} width={340} height={170} />
      </div>
    </figure>
  );
}
