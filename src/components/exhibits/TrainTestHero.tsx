"use client";

import { useEffect, useState } from "react";
import { ErrorSpreadStrip, type SpreadMark } from "@/components/exhibits/ErrorSpreadStrip";
import { kFoldCV, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE, TT_LAMBDA } from "@content/exhibits/train-test-generalization/experiment";

/**
 * The specimen hero — why one train/test split can't be trusted. The same model,
 * scored on many random splits: the test error scatters across a wide band (the
 * histogram fills in on load — a single split could hand you any of these numbers),
 * while 5-fold cross-validation averages the luck out to one stable estimate (the
 * pin that drops in last). Reduced motion renders it already filled.
 */

const SEEDS = Array.from({ length: 80 }, (_, i) => i + 1);
const SCORES = SEEDS.map((s) => scoreSplit(splitPoints(pooledPoints, 0.3, s), TT_DEGREE, TT_LAMBDA));
const TEST_ERRS = SCORES.map((s) => s.testErr);
const TRAIN_ERR = SCORES.reduce((a, s) => a + s.trainErr, 0) / SCORES.length;
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1, TT_LAMBDA).meanErr;
const LO = Math.min(...TEST_ERRS);
const HI = Math.max(...TEST_ERRS);
const AXIS_MAX = Math.max(0.2, HI * 1.12);

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
  const marks: SpreadMark[] = [
    { value: TRAIN_ERR, label: "train — flatters", color: "var(--viz-neutral)" },
    ...(p >= 1 ? [{ value: CV, label: "CV — stable", color: "var(--accent)" }] : []),
  ];

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          One split is a lottery
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          test error {LO.toFixed(2)}–{HI.toFixed(2)} · CV pins it at {CV.toFixed(2)}
        </span>
      </figcaption>
      <div className="px-4 py-5">
        <ErrorSpreadStrip errs={errs} marks={marks} axisMax={AXIS_MAX} bins={28} width={1200} height={300} />
      </div>
    </figure>
  );
}
