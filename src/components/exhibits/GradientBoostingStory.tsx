"use client";

import { useMemo } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { BoostingLossCurves } from "@/components/viz/BoostingLossCurves";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { GradientBoostingFrame } from "@content/exhibits/gradient-boosting/spine";
import { boosterAccuracy, boosterLogLoss, boosterProba } from "@/lib/models/gradient-boosting";
import {
  BOOST_MAX,
  FULL_BOOSTER,
  bestRound,
  boostDomain,
  boostPoints,
  boostTestPoints,
} from "@content/exhibits/gradient-boosting/experiment";

/**
 * The See-it graphic: the boosted boundary at the round the beat asserts, paired with the
 * loss curves that are the node's real story. Early on, one weak round; by ~20 rounds a
 * clean boundary at the held-out loss's low point; past it, the boundary contorts as the
 * held-out loss climbs. Object constancy — the same moons, the same two curves, only the
 * round marker moves.
 */
export function GradientBoostingStory() {
  const frame = useActiveFrame<GradientBoostingFrame>();
  const rounds = Math.max(1, Math.min(frame?.rounds ?? 20, BOOST_MAX));

  const predict = useMemo(() => (x1: number, x2: number) => boosterProba(FULL_BOOSTER, x1, x2, rounds), [rounds]);
  const acc = useMemo(() => boosterAccuracy(boostTestPoints, FULL_BOOSTER, rounds), [rounds]);
  const trainLL = useMemo(() => boosterLogLoss(boostPoints, FULL_BOOSTER, rounds), [rounds]);
  const testLL = useMemo(() => boosterLogLoss(boostTestPoints, FULL_BOOSTER, rounds), [rounds]);

  const caption =
    rounds <= 1
      ? "One round — a single weak tree"
      : rounds <= bestRound + 4
        ? `${rounds} rounds — descending to a clean boundary`
        : `${rounds} rounds — overshooting into the noise`;

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{caption}</figcaption>

      <DecisionField
        points={boostPoints}
        predictProba={predict}
        domain={boostDomain}
        width={560}
        height={320}
        label={`The boosted boundary after ${rounds} round${rounds === 1 ? "" : "s"}; ${Math.round(
          acc * 100,
        )}% accurate on held-out data, training log-loss ${trainLL.toFixed(2)}, held-out ${testLL.toFixed(2)}.`}
      />

      <BoostingLossCurves current={rounds} width={520} height={150} />

      <StatGrid
        caption="The descent so far"
        stats={[
          { label: "train log-loss", value: trainLL.toFixed(3), hue: "var(--ink-muted)", note: "sinks toward zero" },
          { label: "held-out log-loss", value: testLL.toFixed(3), hue: "var(--accent)", note: rounds > bestRound + 4 ? "climbing — overshot" : "the score that counts" },
          { label: "held-out accuracy", value: `${Math.round(acc * 100)}%`, hue: "var(--viz-param)", note: "robust even as loss overfits" },
        ]}
      />
    </figure>
  );
}
