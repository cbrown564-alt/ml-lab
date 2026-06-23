"use client";

import { useActiveFrame } from "@/components/exhibits/story-frame";
import { StatGrid } from "@/components/viz/StatGrid";
import { ErrorSpreadStrip, type SpreadMark } from "@/components/exhibits/ErrorSpreadStrip";
import type { TrainTestFrame } from "@content/exhibits/train-test-generalization/spine";
import { kFoldCV, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE, TT_LAMBDA } from "@content/exhibits/train-test-generalization/experiment";

/**
 * The See-it graphic: the test error from many random splits, drawn as a binned
 * distribution against the flattering training error and the stable cross-validation
 * estimate. The active beat reveals it in stages — one split, the lottery of many, then
 * the CV mark pinning the number down.
 */
const SEEDS = Array.from({ length: 24 }, (_, i) => i + 1);
const SCORES = SEEDS.map((s) => scoreSplit(splitPoints(pooledPoints, 0.3, s), TT_DEGREE, TT_LAMBDA));
const TEST_ERRS = SCORES.map((s) => s.testErr);
const TRAIN_ERR = SCORES.reduce((a, s) => a + s.trainErr, 0) / SCORES.length;
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1, TT_LAMBDA).meanErr;

export function TrainTestStory() {
  const frame = useActiveFrame<TrainTestFrame>();
  const stage = frame?.stage ?? "lottery";
  const shown = stage === "split" ? TEST_ERRS.slice(0, 1) : TEST_ERRS;
  const marks: SpreadMark[] = [
    { value: TRAIN_ERR, label: "train", color: "var(--viz-neutral)" },
    ...(stage === "cv" ? [{ value: CV, label: "CV — stable", color: "var(--accent)" }] : []),
  ];

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {stage === "split" ? "One split — one number" : stage === "lottery" ? "Many splits — the lottery" : "Cross-validation pins it down"}
      </figcaption>
      <ErrorSpreadStrip errs={shown} axisMax={0.2} marks={marks} width={620} height={170} />
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
                  { label: "5-fold CV", value: CV.toFixed(3), hue: "var(--viz-truth-ink)", note: "stable estimate" },
                ]
          }
        />
      </div>
    </figure>
  );
}
