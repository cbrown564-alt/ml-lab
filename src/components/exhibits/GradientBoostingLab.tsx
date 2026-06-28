"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { BoostingLossCurves } from "@/components/viz/BoostingLossCurves";
import { StatGrid } from "@/components/viz/StatGrid";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { boosterAccuracy, boosterLogLoss, boosterProba } from "@/lib/models/gradient-boosting";
import {
  FULL_BOOSTER,
  bestRound,
  boostDomain,
  boostPoints,
  boostTestPoints,
  gradientBoostingScenario,
  roundsParam,
} from "@content/exhibits/gradient-boosting/experiment";

/**
 * Gradient-boosting bench: one knob, the number of rounds. Drag it and the boundary
 * sharpens while the loss curves split — training sinking toward zero, held-out bottoming
 * at ~the early-stop mark and then climbing. The overfit you can't read off the (flat)
 * accuracy, made plain in the loss.
 */
const OVERSHOOT = bestRound + 60;

export function GradientBoostingLab() {
  const [rounds, setRounds] = useState(roundsParam.default);
  const [overshot, setOvershot] = useState(false);
  useEffect(() => {
    if (overshot) reportTaskEvent("gradient-boosting:overfit-by-rounds");
  }, [overshot]);

  const predict = useMemo(() => (x1: number, x2: number) => boosterProba(FULL_BOOSTER, x1, x2, rounds), [rounds]);
  const acc = useMemo(() => boosterAccuracy(boostTestPoints, FULL_BOOSTER, rounds), [rounds]);
  const trainLL = useMemo(() => boosterLogLoss(boostPoints, FULL_BOOSTER, rounds), [rounds]);
  const testLL = useMemo(() => boosterLogLoss(boostTestPoints, FULL_BOOSTER, rounds), [rounds]);

  const note =
    rounds <= 2
      ? "Just started — a weak first step."
      : rounds <= bestRound + 4
        ? "Near the sweet spot — held-out loss at its low."
        : "Past the low point — held-out loss is climbing.";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{gradientBoostingScenario.prompt}</p>

          <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-4">
            <div className="flex items-baseline justify-between">
              <label htmlFor="rounds" className="text-sm font-medium text-ink">{roundsParam.label}</label>
              <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{rounds}</span>
            </div>
            <input
              id="rounds"
              type="range"
              min={roundsParam.min}
              max={roundsParam.max}
              step={roundsParam.step}
              value={rounds}
              onChange={(e) => {
                const v = Number(e.target.value);
                whenHydrated(() => useLearner.getState().recordPractice("gradient-boosting"));
                if (v >= OVERSHOOT) setOvershot(true);
                setRounds(v);
              }}
              className="w-full accent-[var(--accent)]"
            />
            <p className="text-xs leading-relaxed text-ink-faint">{roundsParam.hint}</p>
          </div>

          <StatGrid
            direction="col"
            caption={note}
            stats={[
              { label: "train log-loss", value: trainLL.toFixed(3), hue: "var(--ink-muted)", note: "sinks toward zero" },
              { label: "held-out log-loss", value: testLL.toFixed(3), hue: "var(--accent)", note: rounds > bestRound + 4 ? "climbing — overshot" : "bottoms near the early-stop mark" },
              { label: "held-out accuracy", value: `${Math.round(acc * 100)}%`, hue: "var(--viz-param)", note: "plateaus — the overfit is in the loss" },
            ]}
          />

          <BoostingLossCurves current={rounds} />
        </div>

        <div className="mt-6 lg:mt-0">
          <DecisionField
            points={boostPoints}
            predictProba={predict}
            domain={boostDomain}
            width={600}
            height={500}
            label={`The boosted boundary after ${rounds} rounds; ${Math.round(acc * 100)}% on held-out data, the boundary contorting as rounds pass the early-stop point.`}
          />
        </div>
      </div>
    </div>
  );
}
