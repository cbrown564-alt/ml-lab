"use client";

import { useMemo } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { DecisionTreeDiagram } from "@/components/viz/DecisionTreeDiagram";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { DecisionTreeFrame } from "@content/exhibits/decision-trees/spine";
import {
  buildTree,
  countLeaves,
  predictProbaTree,
  treeAccuracy,
} from "@/lib/models/decision-tree";
import { fitLogistic, accuracy as logAccuracy } from "@/lib/models/logistic";
import {
  treePoints,
  treeTestPoints,
  treeDomain,
} from "@content/exhibits/decision-trees/experiment";

/**
 * The See-it graphic: the plane and the tree grown in lockstep to the depth the active
 * beat asserts. The hook shows the straight line logistic regression would draw — the
 * boundary that can't follow the curve; depth 1→2→3 builds the staircase as the diagram
 * sprouts questions; the deep frame is the memorized, jagged overfit. Object constancy:
 * the same 160 points throughout, progressively carved.
 */
const LOGISTIC_FIT = fitLogistic(treePoints, { steps: 4000, lr: 0.4 });
const LOGISTIC_ACC = logAccuracy(treePoints, LOGISTIC_FIT);

export function DecisionTreeStory() {
  const frame = useActiveFrame<DecisionTreeFrame>();
  const depth = frame?.depth ?? 2;
  const showLine = frame?.showLine ?? false;

  const tree = useMemo(() => buildTree(treePoints, { maxDepth: Math.max(depth, 1) }), [depth]);
  const trainAcc = useMemo(() => treeAccuracy(treePoints, tree), [tree]);
  const testAcc = useMemo(() => treeAccuracy(treeTestPoints, tree), [tree]);
  const leaves = useMemo(() => countLeaves(tree), [tree]);
  const predict = useMemo(() => (x1: number, x2: number) => predictProbaTree(tree, x1, x2), [tree]);

  const lineFrame = depth === 0 || showLine;

  const caption = lineFrame
    ? "A straight line — the best logistic regression can do"
    : depth >= 6
      ? "Grown to memorize — the staircase splinters"
      : depth === 1
        ? "One question, one cut"
        : `Depth ${depth} — the staircase bends to the curve`;

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {caption}
      </figcaption>

      {lineFrame ? (
        <DecisionField
          points={treePoints}
          params={LOGISTIC_FIT}
          domain={treeDomain}
          width={600}
          height={440}
          label={`The straight boundary logistic regression fits to the two moons — it classifies ${Math.round(
            LOGISTIC_ACC * 160,
          )} of 160 training points correctly and cannot follow the curve.`}
        />
      ) : (
        <>
          <DecisionField
            points={treePoints}
            predictProba={predict}
            domain={treeDomain}
            width={600}
            height={440}
            label={`A decision tree of depth ${depth} carving the plane into ${leaves} axis-aligned boxes; amber regions vote class 0, blue vote class 1, and a point ringed in red sits in the wrong-coloured box.`}
          />
          <DecisionTreeDiagram tree={tree} caption="The questions that drew those boxes" />
        </>
      )}

      <StatGrid
        caption={lineFrame ? "What a line can manage here" : "The tree's verdict"}
        stats={
          lineFrame
            ? [
                {
                  label: "train accuracy",
                  value: `${Math.round(LOGISTIC_ACC * 100)}%`,
                  hue: "var(--viz-prediction)",
                  note: "a straight line, miscut by the curve",
                },
                {
                  label: "boundary",
                  value: "one line",
                  hue: "var(--viz-param)",
                  note: "no way to bend it",
                },
                { label: "class hues", value: "0 / 1", hue: "var(--viz-truth-ink)", note: "amber · blue" },
              ]
            : [
                {
                  label: "train accuracy",
                  value: `${Math.round(trainAcc * 100)}%`,
                  hue: "var(--viz-prediction)",
                  note: "share of training points correct",
                },
                {
                  label: "held-out",
                  value: `${Math.round(testAcc * 100)}%`,
                  hue: "var(--viz-error)",
                  note: "the score that actually counts",
                },
                {
                  label: "leaves",
                  value: `${leaves}`,
                  hue: "var(--viz-param)",
                  note: "boxes the plane is cut into",
                },
              ]
        }
      />
    </figure>
  );
}
