"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  accuracy,
  createLogisticDescent,
  logLoss,
  type LogisticStep,
} from "@/lib/models/logistic";
import { logisticPoints, logisticRegressionScenario } from "@content/exhibits/logistic-regression/experiment";

/**
 * Logistic-regression bench: press Train and watch gradient descent swing the
 * decision boundary into the gap between the classes, the probability field sharpening
 * from a flat ½-everywhere wash into confident amber/blue regions. Scrub the training
 * to inspect any moment; the readouts track accuracy and log-loss.
 */
const TRACE: LogisticStep[] = (() => {
  const run = createLogisticDescent(logisticPoints, { lr: 0.5, l2: 1e-3 });
  run.run(220);
  return [...run.trace];
})();
const PLAY_MS = 45;

export function LogisticRegressionLab() {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showProb, setShowProb] = useState(true);

  const cur = TRACE[Math.min(cursor, TRACE.length - 1)];
  const acc = useMemo(() => accuracy(logisticPoints, cur.params), [cur.params]);
  const loss = useMemo(() => logLoss(logisticPoints, cur.params), [cur.params]);
  const atEnd = cursor >= TRACE.length - 1;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setCursor((c) => {
        if (c >= TRACE.length - 1) {
          setPlaying(false);
          return c;
        }
        return c + 1;
      });
    }, PLAY_MS);
    return () => clearInterval(t);
  }, [playing]);

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{logisticRegressionScenario.prompt}</p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                whenHydrated(() => useLearner.getState().recordPractice("logistic-regression"));
                if (atEnd) setCursor(0);
                setPlaying((p) => !p);
              }}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              {playing ? "Training…" : atEnd ? "Retrain" : "Train"}
            </button>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" checked={showProb} onChange={(e) => setShowProb(e.target.checked)} className="accent-[var(--accent)]" />
              probability field
            </label>
          </div>

          <StatGrid
            direction="col"
            caption={cursor === 0 ? "Untrained — a coin flip" : atEnd ? "Trained to convergence" : `Step ${cur.step}`}
            stats={[
              { label: "accuracy", value: `${Math.round(acc * 100)}%`, hue: "var(--viz-prediction)", note: "share classified correctly" },
              { label: "log-loss", value: loss.toFixed(3), hue: "var(--viz-error)", note: "what training minimised" },
              { label: "weights", value: `${cur.params.w1.toFixed(1)}, ${cur.params.w2.toFixed(1)}`, hue: "var(--viz-param)", note: "the boundary's tilt" },
            ]}
          />

          <p className="text-sm leading-relaxed text-ink-faint">
            A point ringed in red is misclassified — it sits on the wrong side of the
            boundary, in the overlap no straight line can separate. The line can&apos;t do
            better than the data allows.
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <DecisionField points={logisticPoints} params={cur.params} showProb={showProb} width={600} height={500} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              type="range"
              aria-label="Scrub through training steps"
              min={0}
              max={TRACE.length - 1}
              value={Math.min(cursor, TRACE.length - 1)}
              onChange={(e) => {
                setPlaying(false);
                setCursor(Number(e.target.value));
              }}
              className="flex-1 accent-[var(--accent)]"
            />
            <span className="font-mono text-xs text-ink-faint tabular-nums">step {cur.step}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
