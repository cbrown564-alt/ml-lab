"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  buildTree,
  countLeaves,
  predictProbaTree,
  treeAccuracy,
} from "@/lib/models/decision-tree";
import {
  treeDomain,
  treeMaxDepth,
  treePoints,
  treeTestPoints,
} from "@content/exhibits/decision-trees/experiment";

/**
 * The interactive "Break it" lab. The tree starts at its shallow sweet spot — clean
 * boundary, best held-out score. Drive depth to the maximum and watch it overfit in
 * real time: training accuracy to a perfect 100%, the boundary splintering into
 * single-point islands, the held-out score sliding down. Trigger → symptom → diagnose →
 * repair: a tree's freedom to keep splitting is exactly what lets it memorize.
 */
const SWEET = 2;
const OVERFIT_AT = Math.max(6, treeMaxDepth - 1); // "they pushed it into the failure"

export function DecisionTreeBreakIt() {
  const [depth, setDepth] = useState(SWEET);
  const [pushedDeep, setPushedDeep] = useState(false);

  // The task asks the learner to *drive* the overfit, so it fires once they've pushed
  // depth into the memorizing regime — not on mount (panel rule: trigger, don't watch).
  useEffect(() => {
    if (pushedDeep) reportTaskEvent("decision-trees:overfit-by-depth");
  }, [pushedDeep]);

  const tree = useMemo(() => buildTree(treePoints, { maxDepth: depth }), [depth]);
  const trainAcc = useMemo(() => treeAccuracy(treePoints, tree), [tree]);
  const testAcc = useMemo(() => treeAccuracy(treeTestPoints, tree), [tree]);
  const leaves = useMemo(() => countLeaves(tree), [tree]);
  const predict = useMemo(() => (x1: number, x2: number) => predictProbaTree(tree, x1, x2), [tree]);

  const broken = depth >= OVERFIT_AT;

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance broken={broken} />

          <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-4">
            <div className="flex items-baseline justify-between">
              <label htmlFor="breakit-depth" className="text-sm font-medium text-ink">
                Tree depth
              </label>
              <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{depth}</span>
            </div>
            <input
              id="breakit-depth"
              type="range"
              min={1}
              max={treeMaxDepth}
              step={1}
              value={depth}
              onChange={(e) => {
                const d = Number(e.target.value);
                whenHydrated(() => useLearner.getState().recordPractice("decision-trees"));
                if (d >= OVERFIT_AT) setPushedDeep(true);
                setDepth(d);
              }}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between font-mono text-[10px] text-ink-faint">
              <span>shallow · generalizes</span>
              <span>deep · memorizes</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Readout label="train" value={`${Math.round(trainAcc * 100)}%`} hue="var(--viz-prediction-ink)" hint={trainAcc > 0.99 ? "perfect — memorized" : "fitting the shape"} />
            <Readout label="held-out" value={`${Math.round(testAcc * 100)}%`} hue={broken ? "var(--viz-error-ink)" : "var(--viz-prediction-ink)"} hint={broken ? "fell below the sweet spot" : "the score that counts"} />
          </div>
          <p className="font-mono text-[11px] text-ink-faint">
            {leaves} leaves · {broken ? "a box around individual points" : "a handful of clean boxes"}
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <DecisionField
            points={treePoints}
            predictProba={predict}
            domain={treeDomain}
            width={600}
            height={500}
            label={`A decision tree of depth ${depth} carving the plane into ${leaves} boxes; at high depth the boundary splinters into single-point islands. ${Math.round(
              testAcc * 100,
            )}% accurate on held-out data.`}
          />
        </div>
      </div>
    </div>
  );
}

function Readout({ label, value, hue, hint }: { label: string; value: string; hue: string; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-sunken p-3">
      <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">{label}</div>
      <div className="mt-0.5 font-mono text-2xl tabular-nums" style={{ color: hue }}>{value}</div>
      <div className="mt-0.5 text-[11px] leading-tight text-ink-faint">{hint}</div>
    </div>
  );
}

function Guidance({ broken }: { broken: boolean }) {
  if (broken) {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">
          Symptom · it broke
        </p>
        <p className="mt-2 leading-relaxed text-ink">
          Training accuracy is a perfect{" "}
          <span className="font-medium text-[var(--viz-prediction-ink)]">100%</span>, but the boundary
          has splintered — tiny{" "}
          <span className="font-medium text-[var(--viz-error-ink)]">single-point islands</span> in the
          other class&apos;s territory — and the held-out score has{" "}
          <span className="font-medium text-[var(--viz-error-ink)]">fallen</span> below the shallow
          tree&apos;s.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> with no depth limit the tree splits
          until every leaf is pure, drawing a box around each noisy point — fitting this sample, not
          the shape.{" "}
          <span className="font-medium text-ink">Repair:</span> cap the depth (or require a minimum
          leaf size) and tune it on held-out data — slide back to the shallow sweet spot.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Trigger it</p>
      <p className="mt-2 leading-relaxed text-ink">
        The tree starts at a shallow depth: a clean boundary and the best held-out score. Now{" "}
        <span className="font-medium text-ink">drag depth to the maximum</span> and watch what
        freedom does to it.
      </p>
      <p className="mt-3 leading-relaxed text-ink-muted">
        Keep an eye on both numbers. Training accuracy will climb to 100% — and the held-out score,
        the only one that matters, will peak early and then slide back down.
      </p>
    </div>
  );
}
