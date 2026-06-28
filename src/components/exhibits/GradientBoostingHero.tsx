"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { BoostingLossCurves } from "@/components/viz/BoostingLossCurves";
import { boosterAccuracy, boosterProba } from "@/lib/models/gradient-boosting";
import { FULL_BOOSTER, bestRound, boostDomain, boostPoints, boostTestPoints } from "@content/exhibits/gradient-boosting/experiment";

/**
 * The specimen hero — boosting's whole tension in one frame. Left: the boosted boundary at
 * the early-stopping point, a clean curve a sequence of shallow trees descended to. Right:
 * the loss curves that got it there and the trap beyond — training loss sinking to zero,
 * held-out loss bottoming and then climbing. Power, and the line you must not cross.
 */
export function GradientBoostingHero() {
  const [reveal, setReveal] = useState(0);
  const acc = useMemo(() => Math.round(boosterAccuracy(boostTestPoints, FULL_BOOSTER, bestRound) * 100), []);
  const predict = useMemo(() => (x1: number, x2: number) => boosterProba(FULL_BOOSTER, x1, x2, bestRound), []);

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
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">Gradient boosting</span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          descend the loss ↔ overshoot it
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
            <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              boosted to the sweet spot
            </span>
            <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--accent)" }}>{acc}%</span>
          </div>
          <div style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
            <DecisionField
              points={boostPoints}
              predictProba={predict}
              domain={boostDomain}
              width={520}
              height={400}
              label={`The boosted boundary at the early-stopping point (~${bestRound} rounds) — a clean curve, ${acc}% on held-out data.`}
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
            <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              the descent — and the overshoot
            </span>
          </div>
          <div className="flex h-full items-center" style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
            <BoostingLossCurves current={bestRound} width={520} height={360} />
          </div>
        </div>
      </div>
    </figure>
  );
}
