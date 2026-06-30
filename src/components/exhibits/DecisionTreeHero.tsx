"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { countLeaves, predictProbaTree, treeAccuracy } from "@/lib/models/decision-tree";
import { fitLogistic, accuracy as logAccuracy } from "@/lib/models/logistic";
import { treeAtDepth, treeDomain, treePoints } from "@content/exhibits/decision-trees/experiment";

/**
 * The specimen hero — the node's thesis as a before/after. Left: the best straight line
 * logistic regression can draw across two interleaving moons, confidently miscut by the
 * curve. Right: a shallow decision tree carving the same plane into a staircase of boxes
 * that follows the arcs. Same data, two ways to split it — a line you must bend by hand,
 * versus questions that bend on their own. Reduced motion renders both fields drawn.
 */
const LOGISTIC_FIT = fitLogistic(treePoints, { steps: 4000, lr: 0.4 });
const LOGISTIC_ACC = Math.round(logAccuracy(treePoints, LOGISTIC_FIT) * 100);

export function DecisionTreeHero() {
  const [reveal, setReveal] = useState(0);

  const tree = useMemo(() => treeAtDepth(3), []);
  const treeAcc = Math.round(treeAccuracy(treePoints, tree) * 100);
  const leaves = countLeaves(tree);
  const predict = useMemo(() => (x1: number, x2: number) => predictProbaTree(tree, x1, x2), [tree]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 360);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Decision trees
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          one line ↔ a staircase of questions
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        <Panel kicker="a line — it can't bend" acc={LOGISTIC_ACC} accHue="var(--ink-muted)" reveal={reveal}>
          <DecisionField
            points={treePoints}
            params={LOGISTIC_FIT}
            domain={treeDomain}
            width={520}
            height={400}
            label={`Logistic regression's best straight boundary across two moons — ${LOGISTIC_ACC}% of training points correct, miscut by the curve.`}
          />
        </Panel>
        <Panel kicker="a tree — questions that bend" acc={treeAcc} accHue="var(--viz-prediction-ink)" reveal={reveal}>
          <DecisionField
            points={treePoints}
            predictProba={predict}
            domain={treeDomain}
            width={520}
            height={400}
            fieldMode="crisp"
            label={`A depth-3 decision tree carving the same plane into ${leaves} axis-aligned boxes that follow the arcs — ${treeAcc}% of training points correct.`}
          />
        </Panel>
      </div>
    </figure>
  );
}

function Panel({
  kicker,
  acc,
  accHue,
  reveal,
  children,
}: {
  kicker: string;
  acc: number;
  accHue: string;
  reveal: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</span>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: accHue }}>
          {acc}%
        </span>
      </div>
      <div style={{ opacity: reveal, transition: "opacity 500ms ease" }}>{children}</div>
    </div>
  );
}
