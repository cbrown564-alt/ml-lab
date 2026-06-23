"use client";

import { useActiveFrame } from "@/components/exhibits/story-frame";
import { StatGrid } from "@/components/viz/StatGrid";
import type { TrainTestFrame } from "@content/exhibits/train-test-generalization/spine";
import { kFoldCV, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE } from "@content/exhibits/train-test-generalization/experiment";

/**
 * The See-it graphic: the test error from many random splits, scattered on one error
 * axis against the flattering training error and the stable cross-validation estimate.
 * The active beat reveals it in stages — one split, the lottery of many, then the CV
 * mark pinning the number down.
 */
const SEEDS = Array.from({ length: 16 }, (_, i) => i + 1);
const SCORES = SEEDS.map((s) => scoreSplit(splitPoints(pooledPoints, 0.3, s), TT_DEGREE));
const TEST_ERRS = SCORES.map((s) => s.testErr);
const TRAIN_ERR = SCORES.reduce((a, s) => a + s.trainErr, 0) / SCORES.length;
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1).meanErr;

export function TrainTestStory() {
  const frame = useActiveFrame<TrainTestFrame>();
  const stage = frame?.stage ?? "lottery";
  const shown = stage === "split" ? TEST_ERRS.slice(0, 1) : TEST_ERRS;
  const showCV = stage === "cv";

  const W = 620;
  const H = 130;
  const m = { l: 14, r: 14, t: 30, b: 26 };
  // Adaptive axis so the lottery spread fills the strip (clean data has small errors).
  const hi = Math.max(0.05, ...TEST_ERRS, CV, TRAIN_ERR) * 1.25;
  const x = (e: number) => m.l + (Math.min(e, hi) / hi) * (W - m.l - m.r);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {stage === "split" ? "One split — one number" : stage === "lottery" ? "Many splits — the lottery" : "Cross-validation pins it down"}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Test error from ${shown.length} random splits scattered on an error axis; training error ${TRAIN_ERR.toFixed(3)}${showCV ? `, cross-validation estimate ${CV.toFixed(3)}` : ""}.`} className="h-auto w-full">
        <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke="var(--line)" />
        {shown.map((e, i) => (
          <circle key={i} cx={x(e)} cy={H - m.b - 14} r={5} fill="var(--viz-prediction)" fillOpacity={0.4} />
        ))}
        {/* training error — flattering, low, stable */}
        <line x1={x(TRAIN_ERR)} x2={x(TRAIN_ERR)} y1={m.t - 6} y2={H - m.b} stroke="var(--viz-neutral)" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={x(TRAIN_ERR)} y={m.t - 10} textAnchor="middle" fontSize={10} fill="var(--viz-neutral-ink)">train (flatters)</text>
        {showCV && (
          <g>
            <line x1={x(CV)} x2={x(CV)} y1={m.t - 6} y2={H - m.b} stroke="var(--accent)" strokeWidth={2.5} />
            <text x={x(CV)} y={m.t - 10} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--accent)">CV — stable</text>
          </g>
        )}
        <text x={m.l} y={H - 8} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">0</text>
        <text x={W - m.r} y={H - 8} textAnchor="end" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">higher error →</text>
      </svg>
      <div className="mt-4">
        <StatGrid
          caption={stage === "split" ? "This one split" : "Across the splits"}
          stats={
            stage === "split"
              ? [
                  { label: "training error", value: SCORES[0].trainErr.toFixed(3), hue: "var(--viz-neutral-ink)", note: "seen — flatters" },
                  { label: "test error", value: SCORES[0].testErr.toFixed(3), hue: "var(--viz-prediction)", note: "honest" },
                ]
              : [
                  { label: "test error range", value: `${Math.min(...TEST_ERRS).toFixed(2)}–${Math.max(...TEST_ERRS).toFixed(2)}`, hue: "var(--viz-error)", note: "single-split lottery" },
                  { label: "5-fold CV", value: CV.toFixed(3), hue: "var(--viz-truth)", note: "stable estimate" },
                ]
          }
        />
      </div>
    </figure>
  );
}
