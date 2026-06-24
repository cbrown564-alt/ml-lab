"use client";

import { useId } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { WhatIsMlFrame } from "@content/exhibits/what-is-ml/spine";
import { accuracy, boundaryX2, fitLogistic, proba } from "@/lib/models/logistic";
import { bestRuleAccuracy, whatIsMlData } from "@content/exhibits/what-is-ml/experiment";

/**
 * The See-it graphic: the same labelled points, shown as a hand-written rule (a vertical
 * cut on one feature), then as the examples handed to the machine, then as the learned
 * tilted rule. Each rule tints its decision zones (gold = predict 0, blue = predict 1)
 * and rings the points it gets wrong — so a dot's hue clashing with its zone IS a
 * mistake, the same grammar as the hero. The rules are computed once so beats are
 * deterministic.
 */
const DOMAIN: [number, number] = [-3, 3];
const BEST = bestRuleAccuracy(whatIsMlData);
const LEARNED = fitLogistic(whatIsMlData);
const LEARNED_ACC = accuracy(whatIsMlData, LEARNED);
const clampD = (v: number) => Math.max(DOMAIN[0], Math.min(DOMAIN[1], v));
const ZONE0 = "var(--viz-truth)";
const ZONE1 = "var(--viz-prediction)";
const ZONE_OP = 0.1;
const machinePredict = (p: { x1: number; x2: number }) => (proba(LEARNED, p.x1, p.x2) >= 0.5 ? 1 : 0);

function Graphic({ stage }: { stage: WhatIsMlFrame["stage"] }) {
  const { x, y } = usePlot();
  const clipId = useId();
  const showHand = stage === "hand";
  const showLearned = stage === "learned";
  const [xd0, xd1] = x.domain;
  const [yd0, yd1] = y.domain;
  const tx = x(BEST.t);
  const bA = [x(xd0), y(clampD(boundaryX2(LEARNED, xd0)))];
  const bB = [x(xd1), y(clampD(boundaryX2(LEARNED, xd1)))];
  const topIs1 = machinePredict({ x1: 0, x2: yd1 }) === 1;
  return (
    <g>
      {showHand && (
        <>
          <rect x={x(xd0)} y={y(yd1)} width={tx - x(xd0)} height={y(yd0) - y(yd1)} fill={ZONE0} opacity={ZONE_OP} />
          <rect x={tx} y={y(yd1)} width={x(xd1) - tx} height={y(yd0) - y(yd1)} fill={ZONE1} opacity={ZONE_OP} />
        </>
      )}
      {showLearned && (
        <g clipPath={`url(#${clipId})`}>
          <clipPath id={clipId}>
            <rect x={x(xd0)} y={y(yd1)} width={x(xd1) - x(xd0)} height={y(yd0) - y(yd1)} />
          </clipPath>
          <polygon points={[[x(xd0), y(yd1)], [x(xd1), y(yd1)], bB, bA].map((p) => p.join(",")).join(" ")} fill={topIs1 ? ZONE1 : ZONE0} opacity={ZONE_OP} />
          <polygon points={[[x(xd0), y(yd0)], [x(xd1), y(yd0)], bB, bA].map((p) => p.join(",")).join(" ")} fill={topIs1 ? ZONE0 : ZONE1} opacity={ZONE_OP} />
        </g>
      )}
      {whatIsMlData.map((p, i) => {
        const wrong = showHand
          ? (p.x1 > BEST.t ? 1 : 0) !== p.y
          : showLearned
            ? machinePredict(p) !== p.y
            : false;
        return (
          <circle key={i} cx={x(p.x1)} cy={y(p.x2)} r={wrong ? 5.5 : 5} fill={p.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"} stroke={wrong ? "var(--viz-error)" : "var(--surface-bg)"} strokeWidth={wrong ? 2.75 : 1} />
        );
      })}
      {showHand && (
        <>
          <line x1={tx} x2={tx} y1={y(DOMAIN[1])} y2={y(DOMAIN[0])} stroke="var(--viz-neutral-ink)" strokeWidth={2.5} strokeDasharray="6 4" />
          <text x={tx + 6} y={y(DOMAIN[1]) + 14} fontSize={11} fontFamily="var(--font-mono)" paintOrder="stroke" stroke="var(--surface-bg)" strokeWidth={3} fill="var(--viz-neutral-ink)">your rule</text>
        </>
      )}
      {showLearned && (
        <line x1={bA[0]} y1={bA[1]} x2={bB[0]} y2={bB[1]} stroke="var(--accent)" strokeWidth={3} />
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
      <Plot width={520} height={420} xDomain={[-2.9, 2.9]} yDomain={[-2.9, 2.9]} ariaLabel={`Two classes in a plane, framed as ${stage}. ${caption}.`}>
        <Axes />
        <Graphic stage={stage} />
      </Plot>
    </figure>
  );
}
