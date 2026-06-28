"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { StatGrid } from "@/components/viz/StatGrid";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { boundaryRoughness, forestAccuracy, forestProba } from "@/lib/models/random-forest";
import {
  FOREST_MAX,
  FULL_FOREST,
  forestByTrees,
  forestDomain,
  forestPoints,
  forestTestPoints,
  nTreesParam,
  randomForestScenario,
  singleTreeBaseline,
} from "@content/exhibits/random-forests/experiment";

/**
 * Random-forest bench: one knob, the number of trees. Drag it and the jagged single tree
 * blurs into a smooth boundary while the held-out curve climbs and then flattens — never
 * the U a single tree's depth made. The safe knob, made draggable.
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
  const rough = useMemo(() => boundaryRoughness(predict, forestDomain), [predict]);

  const note =
    k === 1
      ? "One tree — jagged, and unstable if you resample."
      : k < 8
        ? "A few trees — already smoother and steadier."
        : "A crowd — the vote has settled; more trees barely change it.";

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
                note: `vs ${Math.round(singleTreeBaseline.testAccuracy * 100)}% for one tree`,
              },
              {
                label: "boundary roughness",
                value: rough.toFixed(2),
                hue: "var(--viz-param)",
                note: "falls and flattens as trees are added",
              },
              { label: "trees", value: `${k}`, hue: "var(--ink-muted)", note: "averaged into one vote" },
            ]}
          />

          <TreesAccuracyChart current={k} />
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

/** Held-out accuracy vs forest size (scikit-learn's committed curve, log-x): it climbs
 * and then flattens — never the U a single tree's depth made. A reference line marks the
 * single tree the forest beats. */
function TreesAccuracyChart({ current }: { current: number }) {
  const w = 320;
  const h = 132;
  const m = { top: 12, right: 12, bottom: 24, left: 30 };
  const maxT = forestByTrees[forestByTrees.length - 1].nTrees; // 100
  const xs = (t: number) => m.left + (Math.log(t) / Math.log(maxT)) * (w - m.left - m.right);
  const lo = 0.82;
  const ys = (a: number) => h - m.bottom - ((a - lo) / (1 - lo)) * (h - m.top - m.bottom);
  const path = forestByTrees
    .map((r, i) => `${i === 0 ? "M" : "L"}${xs(r.nTrees).toFixed(1)},${ys(r.testAccuracy).toFixed(1)}`)
    .join(" ");
  const base = singleTreeBaseline.testAccuracy;

  return (
    <figure>
      <figcaption className="mb-1 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Held-out vs forest size
      </figcaption>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Held-out accuracy climbs as trees are added and then flattens — it never turns back down. A dashed line marks the single tree the forest beats."
        className="h-auto w-full"
      >
        <line x1={xs(Math.max(1, current))} y1={m.top} x2={xs(Math.max(1, current))} y2={h - m.bottom} stroke="var(--viz-param)" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.7} />
        <line x1={m.left} y1={ys(base)} x2={w - m.right} y2={ys(base)} stroke="var(--ink-faint)" strokeWidth={1} strokeDasharray="4 3" />
        <text x={w - m.right} y={ys(base) - 3} textAnchor="end" fontSize={8} fontFamily="var(--font-mono)" fill="var(--ink-faint)">one tree</text>
        {([1, 0.9].map((a) => (
          <text key={a} x={m.left - 4} y={ys(a) + 3} textAnchor="end" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">{a === 1 ? "100" : "90"}</text>
        )))}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2.25} />
        {forestByTrees.map((r) => (
          <g key={r.nTrees}>
            <circle cx={xs(r.nTrees)} cy={ys(r.testAccuracy)} r={2.5} fill="var(--accent)" />
            <text x={xs(r.nTrees)} y={h - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">{r.nTrees}</text>
          </g>
        ))}
      </svg>
      <p className="mt-1 font-mono text-[10px] text-ink-faint">trees → · climbs, then flat — never a U</p>
    </figure>
  );
}
