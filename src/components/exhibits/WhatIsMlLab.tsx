"use client";

import { useEffect, useRef, useState } from "react";
import { useActHandoffFrame } from "@/components/exhibits/ActHandoffContext";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { accuracy, boundaryX2, fitLogistic, type LogisticParams } from "@/lib/models/logistic";
import { bestRuleAccuracy, ruleAccuracy, whatIsMlData, whatIsMlScenario } from "@content/exhibits/what-is-ml/experiment";
import type { WhatIsMlFrame } from "@content/exhibits/what-is-ml/spine";

/**
 * "Write the rule, or learn it." The learner first hand-writes a rule — a draggable
 * vertical threshold that watches one feature — and tops out, because the true boundary
 * is tilted. Then they press Learn and the machine fits a rule from the labelled
 * examples that weighs both features: the boundary tilts and beats the hand-tuned cut.
 * That gap is the definition of machine learning.
 */
const DOMAIN: [number, number] = [-3, 3];
const BEST_T = bestRuleAccuracy(whatIsMlData).t;

function ClassPoints({ t, learned }: { t: number; learned: LogisticParams | null }) {
  const { x, y } = usePlot();
  const predictHand = (p: (typeof whatIsMlData)[0]) => (p.x1 > t ? 1 : 0);
  return (
    <g>
      {whatIsMlData.map((p, i) => {
        const wrong = learned ? false : predictHand(p) !== p.y;
        return (
          <circle
            key={i}
            cx={x(p.x1)}
            cy={y(p.x2)}
            r={5}
            fill={p.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"}
            stroke={wrong ? "var(--viz-error)" : "var(--surface-bg)"}
            strokeWidth={wrong ? 2.5 : 1}
          />
        );
      })}
      {learned &&
        whatIsMlData
          .filter((p) => (p.x1 > BEST_T ? 1 : 0) !== p.y)
          .map((p, i) => (
            <circle
              key={`ghost-${i}`}
              cx={x(p.x1)}
              cy={y(p.x2)}
              r={8}
              fill="none"
              stroke="var(--viz-error)"
              strokeWidth={2}
              strokeDasharray="5 3"
              opacity={0.55}
              aria-hidden
            />
          ))}
    </g>
  );
}

function Rules({ t, learned, onDragT }: { t: number; learned: LogisticParams | null; onDragT: (t: number) => void }) {
  const { x, y, svgRef, width, height } = usePlot();
  const toX1 = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return t;
    const px = ((clientX - rect.left) / rect.width) * width;
    return Math.max(DOMAIN[0], Math.min(DOMAIN[1], Math.round(x.invert(px) * 100) / 100));
  };
  const labelY = y(DOMAIN[0]) - 10;
  return (
    <g>
      {learned && (
        <line
          x1={x(DOMAIN[0])}
          y1={y(Math.max(DOMAIN[0], Math.min(DOMAIN[1], boundaryX2(learned, DOMAIN[0]))))}
          x2={x(DOMAIN[1])}
          y2={y(Math.max(DOMAIN[0], Math.min(DOMAIN[1], boundaryX2(learned, DOMAIN[1]))))}
          stroke="var(--accent)"
          strokeWidth={3}
        />
      )}
      {!learned && (
        <>
          <line x1={x(t)} x2={x(t)} y1={y(DOMAIN[1])} y2={y(DOMAIN[0])} stroke="var(--viz-neutral-ink)" strokeWidth={2.5} strokeDasharray="6 4" />
          <text
            x={x(t) + 8}
            y={labelY}
            fontSize={11}
            fontFamily="var(--font-mono)"
            paintOrder="stroke"
            stroke="var(--surface-bg)"
            strokeWidth={4}
            fill="var(--viz-neutral-ink)"
          >
            your rule
          </text>
        </>
      )}
      {!learned && (
        <rect
          x={x.range[0]}
          y={0}
          width={x.range[1] - x.range[0]}
          height={height}
          fill="transparent"
          className="cursor-ew-resize"
          onPointerDown={(e) => {
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            onDragT(toX1(e.clientX));
          }}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            onDragT(toX1(e.clientX));
          }}
        />
      )}
    </g>
  );
}

export function WhatIsMlLab() {
  const storyFrame = useActHandoffFrame<WhatIsMlFrame>();
  const appliedHandoff = useRef(false);
  const [t, setT] = useState(BEST_T);
  const [learned, setLearned] = useState<LogisticParams | null>(null);

  // See-it final frame carries to Run-it: learned boundary already visible.
  useEffect(() => {
    if (appliedHandoff.current || !storyFrame) return;
    if (storyFrame.stage === "learned" || storyFrame.stage === "learning") {
      appliedHandoff.current = true;
      setLearned(fitLogistic(whatIsMlData));
    }
  }, [storyFrame]);

  const ruleAcc = ruleAccuracy(whatIsMlData, t);
  const learnedAcc = learned ? accuracy(whatIsMlData, learned) : null;

  const learn = () => {
    whenHydrated(() => useLearner.getState().recordPractice("what-is-ml"));
    setLearned(fitLogistic(whatIsMlData));
  };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{whatIsMlScenario.prompt}</p>

          <button type="button" onClick={learn} className="self-start rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink hover:opacity-90">
            {learned ? "Re-learn from the examples" : "Learn from the examples ▶"}
          </button>

          <StatGrid
            direction="col"
            caption="Same data, two rules"
            className="chrome-redundant-metrics"
            stats={[
              { label: "your hand-written rule", value: `${Math.round(ruleAcc * 100)}%`, hue: "var(--viz-neutral-ink)", note: "one feature, one threshold" },
              { label: "the learned rule", value: learnedAcc !== null ? `${Math.round(learnedAcc * 100)}%` : "—", hue: "var(--accent)", note: learnedAcc !== null ? "weighs both features, fit from data" : "press Learn" },
            ]}
          />

          {learnedAcc !== null && (
            <p className="text-sm leading-relaxed text-ink-faint">
              The machine never saw your rule. It read the labelled examples and found how to
              weigh <em>both</em> features — the tilted line — beating your best single cut by{" "}
              <span className="font-mono text-accent">{Math.round((learnedAcc - ruleAcc) * 100)}</span>{" "}points. That&apos;s machine
              learning: the rule comes from the data, not from you.
            </p>
          )}
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={560}
            height={460}
            xDomain={[-2.9, 2.9]}
            yDomain={[-2.9, 2.9]}
            ariaLabel={`Two classes in a 2-D plane. Your hand-written vertical-threshold rule scores ${Math.round(ruleAcc * 100)}%${learnedAcc !== null ? `; the learned tilted rule scores ${Math.round(learnedAcc * 100)}%` : ""}. Red-ringed points are the ones your rule gets wrong.`}
            interactive
          >
            <Axes />
            <ClassPoints t={t} learned={learned} />
            <Rules t={t} learned={learned} onDragT={setT} />
          </Plot>
        </div>
      </div>
    </div>
  );
}
