"use client";

import { useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { forestAccuracy, forestProba } from "@/lib/models/random-forest";
import { FULL_FOREST, forestDomain, forestPoints, forestTestPoints } from "@content/exhibits/random-forests/experiment";

/**
 * The compact live instrument pinned beside the Explain-it checks: the same forest at
 * three sizes — one tree, a few, the full crowd — so the learner answers each question
 * against the running model rather than from memory.
 */
const STAGES = [
  { id: "one", label: "1 tree", k: 1, blurb: "jagged, unstable" },
  { id: "few", label: "A few", k: 6, blurb: "already smoother" },
  { id: "many", label: "A crowd", k: FULL_FOREST.length, blurb: "smooth and steady" },
] as const;

export function RandomForestCheckLab() {
  const [stageId, setStageId] = useState<(typeof STAGES)[number]["id"]>("many");
  const stage = STAGES.find((s) => s.id === stageId)!;
  const crowd = useMemo(() => FULL_FOREST.slice(0, stage.k), [stage.k]);
  const predict = useMemo(() => (x1: number, x2: number) => forestProba(crowd, x1, x2), [crowd]);
  const acc = useMemo(() => forestAccuracy(forestTestPoints, crowd), [crowd]);

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        The same forest, three sizes
      </figcaption>
      <div role="group" aria-label="Forest size" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs">
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
        points={forestPoints}
        predictProba={predict}
        domain={forestDomain}
        width={460}
        height={360}
        label={`A forest of ${stage.k} tree${stage.k === 1 ? "" : "s"}, ${Math.round(acc * 100)}% on held-out data — ${stage.blurb}.`}
      />
      <div className="mt-2 flex justify-between text-[11px]">
        <span className="text-ink-faint">{stage.blurb}</span>
        <span className="font-mono tabular-nums" style={{ color: "var(--accent)" }}>held-out {Math.round(acc * 100)}%</span>
      </div>
    </figure>
  );
}
