"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { StatGrid } from "@/components/viz/StatGrid";
import { RandomForestStability } from "@/components/exhibits/RandomForestStability";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { forestAccuracy, forestProba } from "@/lib/models/random-forest";
import {
  FOREST_MAX,
  FULL_FOREST,
  forestAccCurve,
  forestDomain,
  forestPoints,
  forestTestPoints,
  nTreesParam,
  randomForestScenario,
  singleTreeBaseline,
} from "@content/exhibits/random-forests/experiment";

/**
 * Random-forest bench: one knob, the number of trees. Drag it and the jagged single tree
 * blurs into a smooth boundary while the held-out curve climbs and then plateaus — never
 * the systematic U a single tree's depth made (the small run-to-run jiggles are just
 * 120-point test-set noise). Below, a resample instrument shows *why* the plateau is safe.
 */
const GROWN = Math.max(40, FOREST_MAX - 10);

export function RandomForestLab() {
  const [k, setK] = useState(nTreesParam.default);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (grown) reportTaskEvent("random-forests:grow-the-crowd");
  }, [grown]);

  const crowd = useMemo(() => FULL_FOREST.slice(0, k), [k]);
  const predict = useMemo(() => (x1: number, x2: number) => forestProba(crowd, x1, x2), [crowd]);
  const acc = useMemo(() => forestAccuracy(forestTestPoints, crowd), [crowd]);

  const note =
    k === 1
      ? "One tree — jagged, and unstable when you resample (try it below)."
      : k < 8
        ? "A few trees — already smoother and steadier."
        : "A crowd — the vote has settled; more trees only plateau it, never a U.";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{randomForestScenario.prompt}</p>

          <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-4">
            <div className="flex items-baseline justify-between">
              <label htmlFor="ntrees" className="text-sm font-medium text-ink">
                {nTreesParam.label}
              </label>
              <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{k}</span>
            </div>
            <input
              id="ntrees"
              type="range"
              min={nTreesParam.min}
              max={nTreesParam.max}
              step={nTreesParam.step}
              value={k}
              onChange={(e) => {
                const v = Number(e.target.value);
                whenHydrated(() => useLearner.getState().recordPractice("random-forests"));
                if (v >= GROWN) setGrown(true);
                setK(v);
              }}
              className="w-full accent-[var(--accent)]"
            />
            <p className="text-xs leading-relaxed text-ink-faint">{nTreesParam.hint}</p>
          </div>

          <StatGrid
            direction="col"
            caption={note}
            stats={[
              {
                label: "held-out accuracy",
                value: `${Math.round(acc * 100)}%`,
                hue: "var(--accent)",
                note: "climbs, then plateaus",
              },
              {
                label: "vs a single deep tree",
                value: `${Math.round(singleTreeBaseline.testAccuracy * 100)}%`,
                hue: "var(--ink-muted)",
                note: "the baseline the forest beats",
              },
              { label: "trees", value: `${k}`, hue: "var(--viz-param)", note: "averaged into one vote" },
            ]}
          />

          <TreesAccuracyChart current={k} />
          <RandomForestStability />
        </div>

        <div className="mt-6 lg:mt-0">
          <DecisionField
            points={forestPoints}
            predictProba={predict}
            domain={forestDomain}
            width={600}
            height={500}
            label={`The averaged vote of ${k} decision trees; ${Math.round(acc * 100)}% accurate on held-out data, the boundary smoother the more trees are averaged.`}
          />
        </div>
      </div>
    </div>
  );
}

/** Held-out accuracy of the shown forest vs its size (log-x). It climbs and then plateaus
 * — never the systematic U depth makes; the small jiggles are test-set noise. Reads the
 * same live curve the field and the readout do, so every number on screen agrees. */
function TreesAccuracyChart({ current }: { current: number }) {
  const w = 320;
  const h = 132;
  const m = { top: 12, right: 12, bottom: 24, left: 30 };
  const maxT = forestAccCurve[forestAccCurve.length - 1].nTrees;
  const xs = (t: number) => m.left + (Math.log(t) / Math.log(maxT)) * (w - m.left - m.right);
  const lo = 0.87;
  const hi = 0.94;
  const ys = (a: number) => h - m.bottom - ((a - lo) / (hi - lo)) * (h - m.top - m.bottom);
  const path = forestAccCurve
    .map((r, i) => `${i === 0 ? "M" : "L"}${xs(r.nTrees).toFixed(1)},${ys(r.testAccuracy).toFixed(1)}`)
    .join(" ");
  const cur = forestAccCurve[Math.max(0, Math.min(current, forestAccCurve.length) - 1)];

  return (
    <figure>
      <figcaption className="mb-1 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Held-out vs forest size
      </figcaption>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Held-out accuracy of the forest climbs as trees are added and then plateaus — it never makes the systematic U a single tree's depth does; small jiggles are test-set noise."
        className="h-auto w-full"
      >
        <line x1={xs(Math.max(1, current))} y1={m.top} x2={xs(Math.max(1, current))} y2={h - m.bottom} stroke="var(--viz-param)" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.7} />
        {([0.93, 0.92, 0.9, 0.88] as const).map((a) => (
          <text key={a} x={m.left - 4} y={ys(a) + 3} textAnchor="end" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">{Math.round(a * 100)}</text>
        ))}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2.25} />
        <circle cx={xs(cur.nTrees)} cy={ys(cur.testAccuracy)} r={3} fill="var(--accent)" />
        {[1, 10, maxT].map((t) => (
          <text key={t} x={xs(t)} y={h - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">{t}</text>
        ))}
      </svg>
      <p className="mt-1 font-mono text-[10px] text-ink-faint">trees → · climbs, then plateaus — never a U</p>
    </figure>
  );
}
