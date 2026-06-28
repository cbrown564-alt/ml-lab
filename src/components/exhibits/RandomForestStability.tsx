"use client";

import { useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { bootstrapSample, buildTree, predictProbaTree, treeAccuracy } from "@/lib/models/decision-tree";
import { buildForest, forestAccuracy, forestProba } from "@/lib/models/random-forest";
import { forestDomain, forestPoints, forestTestPoints } from "@content/exhibits/random-forests/experiment";

/**
 * Variance reduction, made manipulable — the answer to the instability the decision-tree
 * node ended on. Resample the data and refit BOTH a single deep tree and a forest: the
 * tree's boundary lurches from draw to draw while the forest's barely moves, and the
 * held-out range tells the same story — the single tree's score swings wide, the forest's
 * stays in a narrow band. This is *why* more trees is safe: the average is steady.
 */
const N_TREES = 24;

export function RandomForestStability() {
  const [seed, setSeed] = useState(1);
  const [treeAccs, setTreeAccs] = useState<number[]>([]);
  const [forestAccs, setForestAccs] = useState<number[]>([]);

  const sample = useMemo(() => bootstrapSample(forestPoints, seed), [seed]);
  const tree = useMemo(() => buildTree(sample), [sample]); // fully grown — high variance
  const forest = useMemo(() => buildForest(sample, { nTrees: N_TREES, maxFeatures: 1, seed }), [sample, seed]);
  const treePredict = useMemo(() => (x1: number, x2: number) => predictProbaTree(tree, x1, x2), [tree]);
  const forestPredict = useMemo(() => (x1: number, x2: number) => forestProba(forest, x1, x2), [forest]);

  const resample = () => {
    whenHydrated(() => useLearner.getState().recordPractice("random-forests"));
    const next = seed + 1;
    const s = bootstrapSample(forestPoints, next);
    setTreeAccs((h) => [...h, treeAccuracy(forestTestPoints, buildTree(s))]);
    setForestAccs((h) => [...h, forestAccuracy(forestTestPoints, buildForest(s, { nTrees: N_TREES, maxFeatures: 1, seed: next }))]);
    setSeed(next);
  };

  const range = (xs: number[]) =>
    xs.length ? `${Math.round(Math.min(...xs) * 100)}–${Math.round(Math.max(...xs) * 100)}%` : "—";
  const spread = (xs: number[]) => (xs.length >= 2 ? Math.round((Math.max(...xs) - Math.min(...xs)) * 100) : null);
  const n = treeAccs.length;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-sunken p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">Why more trees is safe: resample &amp; refit</span>
        <button
          type="button"
          onClick={resample}
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
        >
          Resample the data
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Tile label="one tree — lurches" predict={treePredict} />
        <Tile label="the forest — holds" predict={forestPredict} />
      </div>
      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
        <Range label="one tree held-out" value={range(treeAccs)} hue="var(--viz-error-ink)" />
        <Range label="forest held-out" value={range(forestAccs)} hue="var(--accent)" />
      </div>
      <p className="text-[11px] leading-relaxed text-ink-faint">
        {n < 2
          ? "Click Resample a few times. Watch the single tree's boundary jump while the forest's barely moves."
          : `Across ${n} resamples the single tree's score swung ${spread(treeAccs)} points; the forest's, only ${spread(forestAccs)}. The average is steady even though every member jumps — that is why adding trees never hurts.`}
      </p>
    </div>
  );
}

function Tile({ label, predict }: { label: string; predict: (x1: number, x2: number) => number }) {
  return (
    <figure>
      <figcaption className="mb-1 font-mono text-[10px] tracking-wider text-ink-faint uppercase">{label}</figcaption>
      <DecisionField points={forestPoints} predictProba={predict} domain={forestDomain} width={200} height={150} label={label} />
    </figure>
  );
}

function Range({ label, value, hue }: { label: string; value: string; hue: string }) {
  return (
    <div>
      <div className="tracking-wider text-ink-faint uppercase">{label}</div>
      <div className="mt-0.5 tabular-nums" style={{ color: hue }}>{value}</div>
    </div>
  );
}
