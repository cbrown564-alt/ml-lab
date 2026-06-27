"use client";

import { useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import {
  buildTree,
  countLeaves,
  predictProbaTree,
  treeAccuracy,
} from "@/lib/models/decision-tree";
import { treeDomain, treeMaxDepth, treePoints, treeTestPoints } from "@content/exhibits/decision-trees/experiment";

/**
 * The compact live instrument pinned beside the Explain-it checks: the same tree, at
 * three settings — underfit, the sweet spot, and the memorized overfit — so the learner
 * answers each question against the running model rather than from memory.
 */
const STAGES = [
  { id: "under", label: "Underfit", depth: 1, blurb: "one cut — too simple" },
  { id: "sweet", label: "Sweet spot", depth: 2, blurb: "shallow — best on new data" },
  { id: "over", label: "Overfit", depth: treeMaxDepth, blurb: "deep — memorized the noise" },
] as const;

export function DecisionTreeCheckLab() {
  const [stageId, setStageId] = useState<(typeof STAGES)[number]["id"]>("sweet");
  const stage = STAGES.find((s) => s.id === stageId)!;

  const tree = useMemo(() => buildTree(treePoints, { maxDepth: stage.depth }), [stage.depth]);
  const trainAcc = useMemo(() => treeAccuracy(treePoints, tree), [tree]);
  const testAcc = useMemo(() => treeAccuracy(treeTestPoints, tree), [tree]);
  const leaves = useMemo(() => countLeaves(tree), [tree]);
  const predict = useMemo(() => (x1: number, x2: number) => predictProbaTree(tree, x1, x2), [tree]);

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        The same tree, three depths
      </figcaption>
      <div role="group" aria-label="Tree depth regime" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={stageId === s.id}
            onClick={() => setStageId(s.id)}
            className={`rounded-full px-3 py-1 transition-colors ${stageId === s.id ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <DecisionField
        points={treePoints}
        predictProba={predict}
        domain={treeDomain}
        width={460}
        height={360}
        label={`The ${stage.label.toLowerCase()} tree at depth ${stage.depth}, ${leaves} boxes, ${Math.round(
          testAcc * 100,
        )}% accurate on held-out data.`}
      />
      <p className="mt-2 text-[11px] text-ink-faint">{stage.blurb}</p>
      <div className="mt-3 flex justify-between font-mono text-xs tabular-nums">
        <span style={{ color: "var(--viz-prediction-ink)" }}>train {Math.round(trainAcc * 100)}%</span>
        <span style={{ color: "var(--viz-error-ink)" }}>held-out {Math.round(testAcc * 100)}%</span>
        <span className="text-ink-faint">{leaves} leaves</span>
      </div>
    </figure>
  );
}
