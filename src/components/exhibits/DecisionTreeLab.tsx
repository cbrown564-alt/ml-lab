"use client";

import { useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { DecisionTreeDiagram } from "@/components/viz/DecisionTreeDiagram";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  buildTree,
  countLeaves,
  predictProbaTree,
  treeAccuracy,
  treeDepth,
} from "@/lib/models/decision-tree";
import {
  decisionTreeScenario,
  depthParam,
  treeAccuracyByDepth,
  treeDomain,
  treeMaxDepth,
  treePoints,
  treeTestPoints,
} from "@content/exhibits/decision-trees/experiment";

/**
 * Decision-tree bench: one knob, tree depth. Drag it and watch the plane subdivide, the
 * diagram sprout questions, and — the point of the whole node — the train and held-out
 * accuracy curves diverge: training marches to 100% while the held-out score peaks at a
 * shallow depth and then falls. The complexity knob you met as bias and variance, here a
 * thing you can drag.
 */
export function DecisionTreeLab() {
  const [depth, setDepth] = useState(depthParam.default);

  const tree = useMemo(() => buildTree(treePoints, { maxDepth: depth }), [depth]);
  const trainAcc = useMemo(() => treeAccuracy(treePoints, tree), [tree]);
  const testAcc = useMemo(() => treeAccuracy(treeTestPoints, tree), [tree]);
  const leaves = useMemo(() => countLeaves(tree), [tree]);
  const actualDepth = useMemo(() => treeDepth(tree), [tree]);
  const predict = useMemo(() => (x1: number, x2: number) => predictProbaTree(tree, x1, x2), [tree]);

  const bestTestDepth = useMemo(() => {
    let best = treeAccuracyByDepth[0];
    for (const r of treeAccuracyByDepth) if (r.testAccuracy > best.testAccuracy) best = r;
    return best.depth;
  }, []);

  const note =
    depth <= 1
      ? "Underfit — one cut can't separate two arcs."
      : depth === bestTestDepth
        ? "The sweet spot — best on data it never saw."
        : trainAcc > 0.99
          ? "Memorized — perfect on training, worse on new data."
          : depth > bestTestDepth
            ? "Past the peak — the held-out score is slipping."
            : "Bending to the curve.";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{decisionTreeScenario.prompt}</p>

          <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-4">
            <div className="flex items-baseline justify-between">
              <label htmlFor="tree-depth" className="text-sm font-medium text-ink">
                {depthParam.label}
              </label>
              <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">
                {depth}
                {actualDepth < depth ? ` (grown ${actualDepth})` : ""}
              </span>
            </div>
            <input
              id="tree-depth"
              type="range"
              min={depthParam.min}
              max={depthParam.max}
              step={depthParam.step}
              value={depth}
              onChange={(e) => {
                whenHydrated(() => useLearner.getState().recordPractice("decision-trees"));
                setDepth(Number(e.target.value));
              }}
              className="w-full accent-[var(--accent)]"
            />
            <p className="text-xs leading-relaxed text-ink-faint">{depthParam.hint}</p>
          </div>

          <StatGrid
            direction="col"
            caption={note}
            stats={[
              {
                label: "train accuracy",
                value: `${Math.round(trainAcc * 100)}%`,
                hue: "var(--viz-prediction)",
                note: "climbs to 100% as you go deeper",
              },
              {
                label: "held-out accuracy",
                value: `${Math.round(testAcc * 100)}%`,
                hue: "var(--viz-error)",
                note: "peaks shallow, then falls",
              },
              {
                label: "leaves",
                value: `${leaves}`,
                hue: "var(--viz-param)",
                note: "boxes the plane is cut into",
              },
            ]}
          />

          <DepthAccuracyChart current={depth} />
        </div>

        <div className="mt-6 lg:mt-0 flex flex-col gap-4">
          <DecisionField
            points={treePoints}
            predictProba={predict}
            domain={treeDomain}
            width={600}
            height={480}
            label={`A decision tree of depth ${depth} carving the plane into ${leaves} axis-aligned boxes; amber regions vote class 0, blue vote class 1, and a point ringed in red sits in the wrong-coloured box.`}
          />
          <DecisionTreeDiagram tree={tree} caption="The tree — drag depth to grow it" />
        </div>
      </div>
    </div>
  );
}

/** Train vs held-out accuracy across depth — the bias–variance U-curve, read off the
 * scikit-learn-verified fixture, with a marker at the current depth. */
function DepthAccuracyChart({ current }: { current: number }) {
  const w = 320;
  const h = 132;
  const m = { top: 12, right: 12, bottom: 24, left: 30 };
  const xs = (d: number) =>
    m.left + ((d - 1) / (treeMaxDepth - 1)) * (w - m.left - m.right);
  const lo = 0.74;
  const ys = (a: number) => h - m.bottom - ((a - lo) / (1 - lo)) * (h - m.top - m.bottom);
  const path = (key: "trainAccuracy" | "testAccuracy") =>
    treeAccuracyByDepth
      .map((r, i) => `${i === 0 ? "M" : "L"}${xs(r.depth).toFixed(1)},${ys(r[key]).toFixed(1)}`)
      .join(" ");

  return (
    <figure>
      <figcaption className="mb-1 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Accuracy vs depth
      </figcaption>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Train accuracy rises with depth to 100% while held-out accuracy peaks at a shallow depth and then declines — the overfitting curve."
        className="h-auto w-full"
      >
        <line x1={xs(current)} y1={m.top} x2={xs(current)} y2={h - m.bottom} stroke="var(--viz-param)" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.7} />
        {([1, 0.9, 0.8] as const).map((a) => (
          <text key={a} x={m.left - 4} y={ys(a) + 3} textAnchor="end" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
            {a === 1 ? "100" : Math.round(a * 100)}
          </text>
        ))}
        <path d={path("trainAccuracy")} fill="none" stroke="var(--viz-prediction)" strokeWidth={2} />
        <path d={path("testAccuracy")} fill="none" stroke="var(--viz-error)" strokeWidth={2} />
        {treeAccuracyByDepth.map((r) => (
          <g key={r.depth}>
            <circle cx={xs(r.depth)} cy={ys(r.trainAccuracy)} r={r.depth === current ? 3.5 : 2} fill="var(--viz-prediction)" />
            <circle cx={xs(r.depth)} cy={ys(r.testAccuracy)} r={r.depth === current ? 3.5 : 2} fill="var(--viz-error)" />
            <text x={xs(r.depth)} y={h - 8} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">{r.depth}</text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex gap-4 font-mono text-[10px] text-ink-faint">
        <span><span style={{ color: "var(--viz-prediction)" }}>—</span> train</span>
        <span><span style={{ color: "var(--viz-error)" }}>—</span> held-out</span>
        <span>depth →</span>
      </div>
    </figure>
  );
}
