"use client";

import { useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { boosterAccuracy, boosterLogLoss, boosterProba } from "@/lib/models/gradient-boosting";
import { FULL_BOOSTER, bestRound, boostDomain, boostPoints, boostTestPoints } from "@content/exhibits/gradient-boosting/experiment";

/**
 * The compact live instrument beside the Explain-it checks: the same booster at three
 * round counts — too few (underfit), the early-stop sweet spot, and too many (overshot) —
 * so the learner answers each question against the running model and its held-out loss.
 */
const STAGES = [
  { id: "few", label: "Too few", rounds: 2, blurb: "barely started" },
  { id: "best", label: "Early stop", rounds: bestRound, blurb: "held-out loss at its low" },
  { id: "many", label: "Too many", rounds: 200, blurb: "overshot into the noise" },
] as const;

export function GradientBoostingCheckLab() {
  const [stageId, setStageId] = useState<(typeof STAGES)[number]["id"]>("best");
  const stage = STAGES.find((s) => s.id === stageId)!;
  const predict = useMemo(() => (x1: number, x2: number) => boosterProba(FULL_BOOSTER, x1, x2, stage.rounds), [stage.rounds]);
  const acc = useMemo(() => boosterAccuracy(boostTestPoints, FULL_BOOSTER, stage.rounds), [stage.rounds]);
  const testLL = useMemo(() => boosterLogLoss(boostTestPoints, FULL_BOOSTER, stage.rounds), [stage.rounds]);

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        The same booster, three round counts
      </figcaption>
      <div role="group" aria-label="Number of rounds" className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs">
        {STAGES.map((s) => (
          <button key={s.id} type="button" aria-pressed={stageId === s.id} onClick={() => setStageId(s.id)}
            className={`rounded-full px-3 py-1 transition-colors ${stageId === s.id ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}>{s.label}</button>
        ))}
      </div>
      <DecisionField points={boostPoints} predictProba={predict} domain={boostDomain} width={460} height={360}
        label={`The boosted boundary after ${stage.rounds} rounds — ${stage.blurb}; held-out log-loss ${testLL.toFixed(2)}, ${Math.round(acc * 100)}% accurate.`} />
      <div className="mt-2 flex justify-between text-[11px]">
        <span className="text-ink-faint">{stage.blurb}</span>
        <span className="font-mono tabular-nums" style={{ color: "var(--accent)" }}>held-out loss {testLL.toFixed(2)}</span>
      </div>
    </figure>
  );
}
