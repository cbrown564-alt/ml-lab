"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { buildTree, predictProbaTree, treeAccuracy } from "@/lib/models/decision-tree";
import { forestAccuracy, forestProba } from "@/lib/models/random-forest";
import { FULL_FOREST, forestDomain, forestPoints, forestTestPoints } from "@content/exhibits/random-forests/experiment";

/**
 * The specimen hero — the node's thesis as a before/after. Left: one fully-grown decision
 * tree, its boundary a jagged, overfit staircase. Right: the same data, the averaged vote
 * of a whole forest — a smooth, steadier boundary that scores higher on held-out data.
 * One model, two readings: a single tree's wobble, and the crowd that cancels it.
 */
const SINGLE = buildTree(forestPoints); // fully grown — jagged
const SINGLE_ACC = Math.round(treeAccuracy(forestTestPoints, SINGLE) * 100);

export function RandomForestHero() {
  const [reveal, setReveal] = useState(0);
  const forestAcc = useMemo(() => Math.round(forestAccuracy(forestTestPoints, FULL_FOREST) * 100), []);
  const forestPredict = useMemo(() => (x1: number, x2: number) => forestProba(FULL_FOREST, x1, x2), []);

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
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">Random forests</span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          one jagged tree ↔ a smooth crowd
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        <Panel kicker="one tree — jagged, unstable" acc={SINGLE_ACC} accHue="var(--ink-muted)" reveal={reveal}>
          <DecisionField
            points={forestPoints}
            predictProba={(x1, x2) => predictProbaTree(SINGLE, x1, x2)}
            domain={forestDomain}
            width={520}
            height={400}
            label={`A single fully-grown decision tree on two moons — a jagged, overfit staircase, ${SINGLE_ACC}% on held-out data.`}
          />
        </Panel>
        <Panel kicker="a forest — smooth, steady" acc={forestAcc} accHue="var(--accent)" reveal={reveal}>
          <DecisionField
            points={forestPoints}
            predictProba={forestPredict}
            domain={forestDomain}
            width={520}
            height={400}
            label={`The averaged vote of ${FULL_FOREST.length} trees on the same moons — a smooth boundary, ${forestAcc}% on held-out data.`}
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
        <span
          className="font-mono text-[11px] tabular-nums"
          style={{ color: accHue === "var(--accent)" ? "var(--viz-accent-ink)" : accHue }}
        >
          {acc}%
        </span>
      </div>
      <div style={{ opacity: reveal, transition: "opacity 500ms ease" }}>{children}</div>
    </div>
  );
}
