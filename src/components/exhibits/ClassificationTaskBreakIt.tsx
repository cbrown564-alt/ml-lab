"use client";

import { useEffect, useMemo, useState } from "react";
import { StatGrid } from "@/components/viz/StatGrid";
import { ConfusionMatrix, ProbabilityStrip } from "@/components/exhibits/ClassificationViews";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { accuracyOf, confusion, precision, recall } from "@/lib/models/classification-metrics";
import { imbalancedScored } from "@content/exhibits/classification-task/imbalance";

/**
 * The interactive "Break it" lab for the classification task. The data is 95% one
 * class — fraud, a rare disease — and a model that simply calls everything negative
 * scores 95% accuracy while catching zero positives. Tune the threshold to maximise
 * accuracy and you keep that useless model. The repair is to stop watching accuracy:
 * lower the threshold and watch recall — the share of real positives caught — climb,
 * even as accuracy dips. Trigger → symptom → diagnose → repair.
 */
type Phase = "broken" | "repaired";

export function ClassificationTaskBreakIt() {
  const [threshold, setThreshold] = useState(0.5);
  const [hasSeenTrap, setHasSeenTrap] = useState(false);
  const cm = useMemo(() => confusion(imbalancedScored, threshold), [threshold]);
  const rec = recall(cm);
  const acc = accuracyOf(cm);

  // The trap: high accuracy with zero recall (the all-negative model).
  const trapped = rec === 0;
  if (trapped && !hasSeenTrap) setHasSeenTrap(true);
  useEffect(() => {
    if (hasSeenTrap) reportTaskEvent("classification-task:accuracy-trap");
  }, [hasSeenTrap]);

  const phase: Phase = trapped ? "broken" : hasSeenTrap && rec >= 0.66 ? "repaired" : "broken";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="rounded-lg border border-line bg-sunken p-4">
            <label className="flex items-center justify-between text-sm text-ink-muted">
              <span>Decision threshold</span>
              <span className="font-mono tabular-nums text-ink">{threshold.toFixed(2)}</span>
            </label>
            <input
              type="range"
              aria-label="Decision threshold"
              min={0.02}
              max={0.98}
              step={0.01}
              value={threshold}
              onChange={(e) => {
                whenHydrated(() => useLearner.getState().recordPractice("classification-task"));
                setThreshold(Number(e.target.value));
              }}
              className="mt-2 w-full accent-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
                trapped ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]" : rec >= 0.66 ? "border-accent text-accent" : "border-line text-ink-faint"
              }`}
            >
              {trapped ? "95% accurate, useless" : rec >= 0.66 ? "Catching positives" : "Some caught"}
            </span>
          </div>

          <StatGrid
            direction="col"
            caption="3 positives hide among 57 negatives"
            stats={[
              { label: "accuracy", value: `${Math.round(acc * 100)}%`, hue: "var(--viz-neutral-ink)", note: "flatters the all-negative model" },
              { label: "recall", value: rec.toFixed(2), hue: "var(--viz-error)", note: "of 3 real positives, how many caught" },
              { label: "precision", value: precision(cm).toFixed(2), hue: "var(--viz-prediction)" },
            ]}
          />
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:mt-0">
          <ProbabilityStrip scored={imbalancedScored} threshold={threshold} />
          <div className="max-w-[360px]">
            <ConfusionMatrix tp={cm.tp} fp={cm.fp} fn={cm.fn} tn={cm.tn} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Guidance({ phase }: { phase: Phase }) {
  if (phase === "repaired") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          Lower the threshold and the model finally <span className="font-medium text-accent">catches the positives</span> — recall
          climbs even as accuracy dips below the 95% the do-nothing model got. The dip is
          the point: you traded worthless accuracy for real detection.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> don&apos;t crank recall to 1
          blindly either — that floods you with false positives. Pick the threshold from the
          cost of a miss versus a false alarm, reading recall and precision, never accuracy alone.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
      <p className="mt-2 leading-relaxed text-ink">
        Only 3 of these 60 points are positive. At the default threshold the model calls
        every point negative and scores <span className="font-medium text-[var(--viz-error-ink)]">95% accuracy</span> — while catching
        zero of the 3 positives. A model that does nothing looks excellent.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        <span className="font-medium text-ink">Diagnose:</span> accuracy rewards getting the
        majority right, and the majority is negative — so it hides total failure on the rare
        class. <span className="font-medium text-ink">Repair:</span> lower the threshold and
        watch <em>recall</em>, not accuracy.
      </p>
    </div>
  );
}
