"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { DecisionTreeDiagram } from "@/components/viz/DecisionTreeDiagram";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  bootstrapSample,
  buildTree,
  countLeaves,
  predictProbaTree,
  rootSplit,
  treeAccuracy,
} from "@/lib/models/decision-tree";
import {
  treeAtDepth,
  treeDomain,
  treeMaxDepth,
  treePoints,
  treeTestPoints,
} from "@content/exhibits/decision-trees/experiment";

/**
 * The interactive "Break it" lab, with the tree's two failures side by side so the
 * learner can trigger and tell them apart:
 *   · Grow it too deep — drive depth to the max and watch it memorize (train → 100%,
 *     held-out slips, the boundary splinters).
 *   · Resample the data — draw a fresh bootstrap and refit; the cuts jump and the
 *     boundary lurches while held-out barely moves. That high variance is the whole
 *     case for averaging many trees — bagging, a random forest, which comes next.
 */
const SWEET = 2;
const OVERFIT_AT = Math.max(6, treeMaxDepth - 1);
const RESAMPLE_DEPTH = 4;
const feat = (f: 0 | 1) => (f === 0 ? "x₁" : "x₂");

type Mode = "depth" | "resample";

export function DecisionTreeBreakIt() {
  const [mode, setMode] = useState<Mode>("depth");

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Which failure to trigger" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
          {([["Grow it too deep", "depth"], ["Resample the data", "resample"]] as const).map(([label, value]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-full px-3.5 py-1 transition-colors ${mode === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] text-ink-faint">
          {mode === "depth" ? "failure ① — overfitting (high variance from too much depth)" : "failure ② — instability (high variance from the data sample)"}
        </p>
      </div>
      {mode === "depth" ? <DepthFailure /> : <ResampleFailure />}
    </div>
  );
}

function DepthFailure() {
  const [depth, setDepth] = useState(SWEET);
  const [pushedDeep, setPushedDeep] = useState(false);
  useEffect(() => {
    if (pushedDeep) reportTaskEvent("decision-trees:overfit-by-depth");
  }, [pushedDeep]);

  const tree = useMemo(() => treeAtDepth(depth), [depth]);
  const trainAcc = useMemo(() => treeAccuracy(treePoints, tree), [tree]);
  const testAcc = useMemo(() => treeAccuracy(treeTestPoints, tree), [tree]);
  const leaves = useMemo(() => countLeaves(tree), [tree]);
  const predict = useMemo(() => (x1: number, x2: number) => predictProbaTree(tree, x1, x2), [tree]);
  const broken = depth >= OVERFIT_AT;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {broken ? (
          <Guidance
            tone="broken"
            kicker="Symptom · it broke"
            body={
              <>
                Training accuracy is a perfect{" "}
                <span className="font-medium text-ink-muted">100%</span>, but the boundary has
                splintered — a jagged edge sprouting a few{" "}
                <span className="font-medium text-[var(--viz-error-ink)]">single-point islands</span> —
                and the gap to the <span className="font-medium" style={{ color: "var(--accent)" }}>held-out</span> score has yawned open.
              </>
            }
            foot={
              <>
                <span className="font-medium text-ink">Diagnose:</span> with no depth limit the tree
                splits until every leaf is pure, boxing each noisy point.{" "}
                <span className="font-medium text-ink">Repair:</span> cap the depth (or require a
                minimum leaf size) and tune it on held-out data — slide back to the shallow sweet spot.
              </>
            }
          />
        ) : (
          <Guidance
            tone="trigger"
            kicker="Trigger it"
            body={
              <>
                The tree starts shallow: a clean boundary, the best held-out score. Now{" "}
                <span className="font-medium text-ink">drag depth to the maximum</span> and watch
                freedom turn into memorization.
              </>
            }
            foot="Training accuracy will climb to 100% — and the gap between it and the held-out score, the only one that matters, will yawn open."
          />
        )}

        <Slider
          id="breakit-depth"
          label="Tree depth"
          value={depth}
          min={1}
          max={treeMaxDepth}
          left="shallow · generalizes"
          right="deep · memorizes"
          onChange={(d) => {
            whenHydrated(() => useLearner.getState().recordPractice("decision-trees"));
            if (d >= OVERFIT_AT) setPushedDeep(true);
            setDepth(d);
          }}
        />

        <div className="grid grid-cols-2 gap-3">
          <Readout label="train" value={`${Math.round(trainAcc * 100)}%`} hue="var(--ink-muted)" hint={trainAcc > 0.99 ? "perfect — memorized" : "fitting the shape"} />
          <Readout label="held-out" value={`${Math.round(testAcc * 100)}%`} hue="var(--accent)" hint={broken ? "the gap below train is overfitting" : "the score that counts"} />
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
          label={`A decision tree of depth ${depth} carving the plane into ${leaves} boxes; at high depth the boundary splinters into a few single-point islands. ${Math.round(testAcc * 100)}% accurate on held-out data.`}
        />
      </div>
    </div>
  );
}

function ResampleFailure() {
  const [seed, setSeed] = useState(0); // 0 = the original sample, before any resample
  const [history, setHistory] = useState<number[]>([]);

  // The instability is a manipulation to complete, not just read — once the learner has
  // resampled a few times and watched the tree change its mind, the task is done.
  useEffect(() => {
    if (history.length >= 3) reportTaskEvent("decision-trees:instability-by-resample");
  }, [history.length]);

  const sample = useMemo(
    () => (seed === 0 ? treePoints : bootstrapSample(treePoints, seed)),
    [seed],
  );
  const tree = useMemo(() => buildTree(sample, { maxDepth: RESAMPLE_DEPTH }), [sample]);
  const testAcc = useMemo(() => treeAccuracy(treeTestPoints, tree), [tree]);
  const leaves = useMemo(() => countLeaves(tree), [tree]);
  const root = rootSplit(tree);
  const predict = useMemo(() => (x1: number, x2: number) => predictProbaTree(tree, x1, x2), [tree]);

  const resample = () => {
    whenHydrated(() => useLearner.getState().recordPractice("decision-trees"));
    const next = seed + 1;
    setSeed(next);
    setHistory((h) => [...h, treeAccuracy(treeTestPoints, buildTree(bootstrapSample(treePoints, next), { maxDepth: RESAMPLE_DEPTH }))]);
  };

  const lo = history.length ? Math.min(...history) : testAcc;
  const hi = history.length ? Math.max(...history) : testAcc;
  const sprung = history.length >= 2;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {sprung ? (
          <Guidance
            tone="broken"
            kicker="Symptom · it broke"
            body={
              <>
                Same data-generating process, a fresh sample each click — and the tree keeps{" "}
                <span className="font-medium text-[var(--viz-error-ink)]">changing its mind</span>. The
                first cut jumps, the whole boundary lurches, yet{" "}
                <span className="font-medium" style={{ color: "var(--accent)" }}>held-out</span> only
                bounces around {Math.round(lo * 100)}–{Math.round(hi * 100)}%.
              </>
            }
            foot={
              <>
                <span className="font-medium text-ink">Diagnose:</span> a single tree is a high-variance
                estimator — a few different points flip a near-tie at the root and the choice cascades.{" "}
                <span className="font-medium text-ink">Repair:</span> average many trees, each on its
                own resample, so the idiosyncrasies cancel and the shared signal survives. That is
                bagging — a random forest — and it&apos;s next.
              </>
            }
          />
        ) : (
          <Guidance
            tone="trigger"
            kicker="Trigger it"
            body={
              <>
                The depth is fixed at {RESAMPLE_DEPTH} — this isn&apos;t about overfitting. Click{" "}
                <span className="font-medium text-ink">Resample &amp; refit</span> a few times: each
                draws a fresh bootstrap of the same data and regrows the tree.
              </>
            }
            foot="Watch the first question and the boundary jump from sample to sample — while the held-out score swings far less and never collapses. Unstable shape, roughly stable score."
          />
        )}

        <div className="flex flex-col gap-3 rounded-lg border border-line bg-sunken p-4">
          <button
            type="button"
            onClick={resample}
            className="self-start rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            Resample &amp; refit
          </button>
          <div className="flex items-baseline justify-between font-mono text-xs">
            <span className="text-ink-muted">
              first cut:{" "}
              <span className="text-[var(--viz-param-ink)]">
                {root ? `${feat(root.feature)} ≤ ${root.threshold.toFixed(2)}` : "—"}
              </span>
            </span>
            <span className="text-ink-faint">{seed === 0 ? "original sample" : `resample ${seed}`}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Readout label="held-out now" value={`${Math.round(testAcc * 100)}%`} hue="var(--accent)" hint="swings less than the shape" />
          <Readout label="held-out range" value={history.length ? `${Math.round(lo * 100)}–${Math.round(hi * 100)}%` : "—"} hue="var(--ink-muted)" hint={`${history.length} resamples`} />
        </div>
        <p className="font-mono text-[11px] text-ink-faint">{leaves} leaves · a different tree every draw</p>
      </div>

      <div className="mt-6 lg:mt-0 flex flex-col gap-4">
        <DecisionField
          points={sample}
          predictProba={predict}
          domain={treeDomain}
          width={600}
          height={420}
          label={`A depth-${RESAMPLE_DEPTH} tree on ${seed === 0 ? "the original sample" : `bootstrap resample ${seed}`}; the boundary shifts from sample to sample while held-out accuracy stays near ${Math.round(testAcc * 100)}%.`}
        />
        <DecisionTreeDiagram tree={tree} caption="A fresh tree every resample — watch the top question move" />
      </div>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  left,
  right,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  left: string;
  right: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-sunken p-4">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
        <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
      <div className="flex justify-between font-mono text-[10px] text-ink-faint">
        <span>{left}</span>
        <span>{right}</span>
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

function Guidance({
  tone,
  kicker,
  body,
  foot,
}: {
  tone: "trigger" | "broken";
  kicker: string;
  body: React.ReactNode;
  foot: React.ReactNode;
}) {
  return (
    <div>
      <p
        className={`font-mono text-[11px] tracking-[0.16em] uppercase ${tone === "broken" ? "text-[var(--viz-error-ink)]" : "text-accent"}`}
      >
        {kicker}
      </p>
      <p className="mt-2 leading-relaxed text-ink">{body}</p>
      <p className="mt-3 leading-relaxed text-ink-muted">{foot}</p>
    </div>
  );
}
