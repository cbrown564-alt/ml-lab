"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorSpreadStrip, type SpreadMark } from "@/components/exhibits/ErrorSpreadStrip";
import { kFoldCV, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE, TT_LAMBDA } from "@content/exhibits/train-test-generalization/experiment";

/**
 * The specimen hero — why one train/test split can't be trusted. VarianceSwarm deals
 * observations like cards into split histogram bins; CV pins the stable estimate.
 * Reduced motion renders already filled.
 */

const SEEDS = Array.from({ length: 80 }, (_, i) => i + 1);
const SCORES = SEEDS.map((s) => scoreSplit(splitPoints(pooledPoints, 0.3, s), TT_DEGREE, TT_LAMBDA));
const TEST_ERRS = SCORES.map((s) => s.testErr);
const TRAIN_ERR = SCORES.reduce((a, s) => a + s.trainErr, 0) / SCORES.length;
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1, TT_LAMBDA).meanErr;
const LO = Math.min(...TEST_ERRS);
const HI = Math.max(...TEST_ERRS);
const AXIS_MAX = Math.max(0.2, HI * 1.12);

/** VarianceSwarm — mini card deck that deals splits into the histogram. */
function CardSwarm({ dealt, total }: { dealt: number; total: number }) {
  const cardW = 22;
  const cardH = 14;
  return (
    <div className="mb-3 flex flex-wrap items-end gap-1" aria-hidden>
      {Array.from({ length: Math.min(dealt, 24) }, (_, i) => (
        <div
          key={i}
          className="rounded border border-line bg-raised shadow-sm transition-transform"
          style={{
            width: cardW,
            height: cardH,
            transform: `rotate(${(i % 5) - 2}deg) translateY(${-(i % 3) * 2}px)`,
            opacity: 0.55 + (i / Math.max(1, dealt)) * 0.45,
            borderColor: i < dealt ? "var(--viz-prediction)" : "var(--line)",
          }}
        />
      ))}
      <span className="ml-2 font-mono text-[10px] text-ink-faint">
        {dealt}/{total} splits dealt
      </span>
    </div>
  );
}

export function TrainTestHero() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setP(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const DURATION = 1200;
    const tick = (now: number) => {
      if (!start) start = now;
      const prog = Math.min(1, (now - start) / DURATION);
      setP(prog);
      if (prog < 1) raf = requestAnimationFrame(tick);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 340);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, []);

  const count = Math.max(1, Math.round(p * TEST_ERRS.length));
  const errs = TEST_ERRS.slice(0, count);
  const marks: SpreadMark[] = useMemo(
    () => [
      { value: TRAIN_ERR, label: "train — flatters", color: "var(--viz-neutral)" },
      ...(p >= 1 ? [{ value: CV, label: "CV — stable", color: "var(--accent)" }] : []),
    ],
    [p],
  );

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          One split is a lottery
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          validation error {LO.toFixed(2)}–{HI.toFixed(2)} · CV pins it at {CV.toFixed(2)}
        </span>
      </figcaption>
      <div className="px-4 py-5">
        <CardSwarm dealt={count} total={TEST_ERRS.length} />
        <ErrorSpreadStrip errs={errs} marks={marks} axisMax={AXIS_MAX} bins={28} width={1200} height={300} />
      </div>
    </figure>
  );
}
