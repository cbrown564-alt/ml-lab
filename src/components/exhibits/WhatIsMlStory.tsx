"use client";

import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { WhatIsMlFrame } from "@content/exhibits/what-is-ml/spine";
import { accuracy, boundaryX2, fitLogistic } from "@/lib/models/logistic";
import { bestRuleAccuracy, whatIsMlData } from "@content/exhibits/what-is-ml/experiment";

/**
 * The See-it graphic: the same labelled points, shown as a hand-written rule (a vertical
 * cut on one feature), then as the examples handed to the machine, then as the learned
 * tilted rule. The rules are computed once so the beats are deterministic.
 */
const DOMAIN: [number, number] = [-3, 3];
const BEST = bestRuleAccuracy(whatIsMlData);
const LEARNED = fitLogistic(whatIsMlData);
const LEARNED_ACC = accuracy(whatIsMlData, LEARNED);
const clampD = (v: number) => Math.max(DOMAIN[0], Math.min(DOMAIN[1], v));

function Graphic({ stage }: { stage: WhatIsMlFrame["stage"] }) {
  const { x, y } = usePlot();
  const showHand = stage === "hand";
  const showLearned = stage === "learned";
  return (
    <g>
      {whatIsMlData.map((p, i) => {
        const wrong = showHand && (p.x1 > BEST.t ? 1 : 0) !== p.y;
        return (
          <circle key={i} cx={x(p.x1)} cy={y(p.x2)} r={5} fill={p.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"} stroke={wrong ? "var(--viz-error)" : "var(--surface-bg)"} strokeWidth={wrong ? 2 : 1} />
        );
      })}
      {showHand && (
        <>
          <line x1={x(BEST.t)} x2={x(BEST.t)} y1={y(DOMAIN[1])} y2={y(DOMAIN[0])} stroke="var(--viz-neutral-ink)" strokeWidth={2.5} strokeDasharray="6 4" />
          <text x={x(BEST.t) + 6} y={y(DOMAIN[1]) + 14} fontSize={11} fontFamily="var(--font-mono)" fill="var(--viz-neutral-ink)">your rule</text>
        </>
      )}
      {showLearned && (
        <line x1={x(DOMAIN[0])} y1={y(clampD(boundaryX2(LEARNED, DOMAIN[0])))} x2={x(DOMAIN[1])} y2={y(clampD(boundaryX2(LEARNED, DOMAIN[1])))} stroke="var(--accent)" strokeWidth={3} />
      )}
    </g>
  );
}

export function WhatIsMlStory() {
  const frame = useActiveFrame<WhatIsMlFrame>();
  const stage = frame?.stage ?? "hand";
  const caption =
    stage === "hand"
      ? "The rule you write — one feature, one cut"
      : stage === "learned"
        ? "The rule it learns — both features, tilted"
        : "Show the machine the labelled examples";
  const acc = stage === "hand" ? BEST.acc : stage === "learned" ? LEARNED_ACC : null;

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-center justify-between font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        <span>{caption}</span>
        {acc !== null && <span className={stage === "hand" ? "text-[var(--viz-neutral-ink)]" : "text-accent"}>{Math.round(acc * 100)}%</span>}
      </figcaption>
      <Plot width={520} height={420} xDomain={[-3.2, 3.2]} yDomain={[-3.2, 3.2]} ariaLabel={`Two classes in a plane, framed as ${stage}. ${caption}.`}>
        <Axes />
        <Graphic stage={stage} />
      </Plot>
    </figure>
  );
}
