"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { StatGrid } from "@/components/viz/StatGrid";
import { ErrorSpreadStrip } from "@/components/exhibits/ErrorSpreadStrip";
import { useActHandoffFrame } from "@/components/exhibits/ActHandoffContext";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import type { Point } from "@/lib/models/linear-regression";
import { predictPoly } from "@/lib/models/polynomial";
import { kFoldCV, scoreSplit, splitPoints } from "@/lib/models/generalization";
import { pooledPoints, TT_DEGREE, TT_LAMBDA, trainTestScenario } from "@content/exhibits/train-test-generalization/experiment";
import type { TrainTestFrame } from "@content/exhibits/train-test-generalization/spine";

/**
 * Train/test bench: one pool of points, split live. The model is fit on the gold
 * training points and scored on the hollow held-out ones. Reshuffle and the test error
 * jumps while the training error barely moves — a single split is a lottery. The
 * 5-fold cross-validation score averages over every fold to pin the estimate down.
 */
const TEST_FRAC = 0.3;
const CV = kFoldCV(pooledPoints, TT_DEGREE, 5, 1, TT_LAMBDA).meanErr;

/** The held-out test points, hollow, so "scored on what it hasn't seen" is visible. */
function TestPoints({ points }: { points: Point[] }) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {points.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r={4} fill="var(--surface-bg)" stroke="var(--viz-prediction)" strokeWidth={1.75} />
      ))}
    </g>
  );
}

export function TrainTestLab() {
  const storyFrame = useActHandoffFrame<TrainTestFrame>();
  const appliedHandoff = useRef(false);
  const [seed, setSeed] = useState(1);
  const [history, setHistory] = useState<number[]>([]);
  const split = useMemo(() => splitPoints(pooledPoints, TEST_FRAC, seed), [seed]);
  const score = useMemo(() => scoreSplit(split, TT_DEGREE, TT_LAMBDA), [split]);

  // Seed Run-it histogram from the See-it story stage when the learner advances.
  useEffect(() => {
    if (appliedHandoff.current || !storyFrame || storyFrame.stage === "split") return;
    appliedHandoff.current = true;
    const seeds = storyFrame.stage === "cv" ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5];
    setHistory(
      seeds.map(
        (s) => scoreSplit(splitPoints(pooledPoints, TEST_FRAC, s), TT_DEGREE, TT_LAMBDA).testErr,
      ),
    );
    setSeed(seeds[seeds.length - 1]!);
  }, [storyFrame]);

  // Seed the history with the first split (adjust during render, no effect needed).
  const [seenSeed, setSeenSeed] = useState<number | null>(null);
  if (seenSeed !== seed) {
    setSeenSeed(seed);
    setHistory((h) => [...h, score.testErr]);
  }

  const reshuffle = () => {
    whenHydrated(() => useLearner.getState().recordPractice("train-test-generalization"));
    setSeed(Math.floor(Math.random() * 1e6) + 2);
  };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{trainTestScenario.prompt}</p>

          <button
            type="button"
            onClick={reshuffle}
            className="self-start rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Reshuffle the split
          </button>

          <StatGrid
            direction="col"
            className={
              storyFrame && storyFrame.stage !== "split" ? "chrome-redundant-metrics" : undefined
            }
            caption={`${split.train.length} train · ${split.test.length} validation · ${history.length} splits drawn`}
            stats={[
              { label: "training error", value: score.trainErr.toFixed(3), hue: "var(--viz-neutral-ink)", note: "on data it has seen — flatters" },
              { label: "validation error (this split)", value: score.testErr.toFixed(3), hue: "var(--viz-prediction)", note: "honest, but jumps every reshuffle" },
              { label: "5-fold CV error", value: CV.toFixed(3), hue: "var(--viz-truth-ink)", note: "averaged over folds — stable" },
            ]}
          />

          <p className="text-sm leading-relaxed text-ink-faint">
            Keep reshuffling: the blue validation-error histogram spreads as the splits disagree,
            but the cross-validation mark barely moves. That spread is why you never trust a
            single split.
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={620}
            height={440}
            xDomain={[-0.02, 1.02]}
            yDomain={[-1.8, 1.8]}
            ariaLabel={`A degree-${TT_DEGREE} polynomial fit on ${split.train.length} training points (gold) and scored on ${split.test.length} held-out points (hollow blue); training error ${score.trainErr.toFixed(3)}, validation error ${score.testErr.toFixed(3)}.`}
          >
            <Axes />
            <TestPoints points={split.test} />
            <PolyCurve predict={(xv) => predictPoly(score.fit, xv)} />
            <DataPoints points={split.train} />
          </Plot>
          <figure className="mt-4 rounded-xl border border-line bg-raised p-3">
            <figcaption className="mb-1 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Validation error across splits</figcaption>
            <ErrorSpreadStrip
              errs={history}
              axisMax={0.2}
              accentLatest
              marks={[
                { value: score.trainErr, label: "train", color: "var(--viz-neutral)" },
                { value: CV, label: "CV", color: "var(--accent)" },
              ]}
              width={620}
              height={150}
            />
          </figure>
        </div>
      </div>
    </div>
  );
}
