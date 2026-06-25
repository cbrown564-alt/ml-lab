"use client";

import { useId, useMemo, useState } from "react";
import { DataLeakageProvenancePipe } from "@/components/exhibits/DataLeakageProvenancePipe";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { fitFold, foldBounds, topKFeatures, type HeldOut, type Matrix } from "@/lib/models/leakage";
import { dataLeakageExperiment } from "@content/exhibits/data-leakage/experiment";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * Data-leakage bench, stepped. The same noise data and model, scored two ways —
 * leaky (features picked once on ALL rows, so every test fold helped choose them)
 * vs honest (features re-picked inside each fold). Rather than a single before/after
 * toggle, you walk the cross-validation fold by fold: each fold's held-out points
 * drop onto the scatter, the running CV R² updates, and the feature row shows the
 * leaky selection frozen (it peeked) while the honest one reshuffles. By the last
 * fold the cloud is the hero's poster — built in front of you, leak visible.
 */
const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;
const P = X[0].length;

type Mode = "leaky" | "honest";
type FoldDetail = { test: number[]; cols: number[]; r2: number; points: HeldOut[] };

/** Per-fold detail for one pipeline — same maths as crossValR2, kept apart so the
 * stepper can show each fold's selection and held-out points in isolation. */
function computeFolds(leaky: boolean): FoldDetail[] {
  const n = Y.length;
  const all = Array.from({ length: n }, (_, i) => i);
  const bounds = foldBounds(n, FOLDS);
  const globalCols = leaky ? topKFeatures(X, Y, all, K) : null;
  const out: FoldDetail[] = [];
  for (let f = 0; f < FOLDS; f++) {
    const test: number[] = [];
    for (let i = bounds[f]; i < bounds[f + 1]; i++) test.push(i);
    const ts = new Set(test);
    const train = all.filter((i) => !ts.has(i));
    const cols = globalCols ?? topKFeatures(X, Y, train, K);
    const fold = fitFold(X, Y, train, test, cols);
    out.push({ test, cols, r2: fold.r2, points: fold.points });
  }
  return out;
}

const SW = 320;
const SH = 320;
const SM = 30;
const EXT = 2.8;
const BAND = 1.0; // the truth lane — same tolerance the hero uses
const sx = (v: number) => SM + ((v + EXT) / (2 * EXT)) * (SW - 2 * SM);
const sy = (v: number) => SH - SM - ((v + EXT) / (2 * EXT)) * (SH - 2 * SM);
const clampE = (v: number) => Math.max(-EXT, Math.min(EXT, v));

function Dot({ p, r }: { p: HeldOut; r: number }) {
  const stray = Math.abs(p.predicted - p.actual) > BAND;
  return (
    <circle
      cx={sx(p.actual)}
      cy={sy(clampE(p.predicted))}
      r={r}
      fill={stray ? "var(--viz-error)" : "var(--viz-prediction)"}
      fillOpacity={stray ? 0.85 : 0.62}
    />
  );
}

function FoldScatter({
  prior,
  current,
  animKey,
  label,
}: {
  prior: HeldOut[];
  current: HeldOut[];
  /** Changes each step so the new fold's points re-run the lift-fog enter. */
  animKey: string;
  label: string;
}) {
  const clipId = useId();
  const lane = [
    [sx(-EXT), sy(-EXT + BAND)],
    [sx(EXT), sy(EXT + BAND)],
    [sx(EXT), sy(EXT - BAND)],
    [sx(-EXT), sy(-EXT - BAND)],
  ]
    .map((p) => p.join(","))
    .join(" ");
  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} role="img" aria-label={label} className="h-auto w-full max-w-[320px]">
      <defs>
        <clipPath id={clipId}>
          <rect x={SM} y={SM} width={SW - 2 * SM} height={SH - 2 * SM} />
        </clipPath>
      </defs>
      <rect x={SM} y={SM} width={SW - 2 * SM} height={SH - 2 * SM} fill="none" stroke="var(--line)" />
      <polygon points={lane} fill="var(--viz-truth)" fillOpacity={0.12} clipPath={`url(#${clipId})`} />
      <line x1={sx(-EXT)} y1={sy(-EXT)} x2={sx(EXT)} y2={sy(EXT)} stroke="var(--ink-faint)" strokeDasharray="4 4" />
      <text x={sx(EXT) - 4} y={sy(EXT) + 14} textAnchor="end" fontSize={10} fill="var(--ink-faint)" fontStyle="italic">
        predicted = actual
      </text>
      <g clipPath={`url(#${clipId})`}>
        {/* folds already stepped through — the cloud built so far */}
        <g opacity={0.8}>
          {prior.map((p, i) => (
            <Dot key={`p${i}`} p={p} r={3.5} />
          ))}
        </g>
        {/* this fold's held-out points, dropping in on each step */}
        <g key={animKey} className="lift-fog">
          {current.map((p, i) => (
            <Dot key={`c${i}`} p={p} r={4.5} />
          ))}
        </g>
      </g>
      <text x={SW / 2} y={SH - 6} textAnchor="middle" fontSize={10} fill="var(--ink-faint)" fontFamily="var(--font-mono)">
        actual →
      </text>
    </svg>
  );
}

/** The k selected features as a strip across all p columns; the lit ticks are this
 * fold's selection. Frozen across folds under the leak, reshuffling when honest. */
function FeatureStrip({ cols }: { cols: number[] }) {
  const lit = new Set(cols);
  const tw = (SW - 2 * SM) / P;
  return (
    <svg viewBox={`0 0 ${SW} 26`} role="img" aria-label={`${cols.length} of ${P} features selected for this fold.`} className="h-auto w-full max-w-[320px]">
      {Array.from({ length: P }, (_, j) => (
        <rect
          key={j}
          x={SM + j * tw}
          y={lit.has(j) ? 4 : 12}
          width={Math.max(1.5, tw - 0.8)}
          height={lit.has(j) ? 18 : 6}
          fill={lit.has(j) ? "var(--accent)" : "var(--line)"}
        />
      ))}
    </svg>
  );
}

function FoldBars({ foldR2, active }: { foldR2: number[]; active: number }) {
  const W = 320;
  const H = 96;
  const m = { l: 30, r: 8, t: 10, b: 16 };
  const lim = 1;
  const zero = m.t + (H - m.t - m.b) / 2;
  const bw = (W - m.l - m.r) / foldR2.length;
  const barH = (v: number) => (Math.max(-lim, Math.min(lim, v)) / lim) * ((H - m.t - m.b) / 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="R² for each fold stepped through so far." className="h-auto w-full max-w-[320px]">
      <line x1={m.l} x2={W - m.r} y1={zero} y2={zero} stroke="var(--line)" />
      <text x={m.l - 4} y={zero + 3} textAnchor="end" fontSize={9} fill="var(--ink-faint)" fontFamily="var(--font-mono)">
        0
      </text>
      {foldR2.map((v, i) => {
        const shown = i <= active;
        const h = barH(v);
        return (
          <g key={i} opacity={shown ? 1 : 0.18}>
            <rect
              x={m.l + i * bw + bw * 0.2}
              y={h >= 0 ? zero - h : zero}
              width={bw * 0.6}
              height={Math.abs(h)}
              fill={v >= 0 ? "var(--viz-prediction)" : "var(--viz-error)"}
              stroke={i === active ? "var(--accent)" : "none"}
              strokeWidth={i === active ? 1.5 : 0}
            />
            <text x={m.l + i * bw + bw / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="var(--ink-faint)" fontFamily="var(--font-mono)">
              {i + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DataLeakageLab() {
  const [mode, setMode] = useState<Mode>("leaky");
  const [active, setActive] = useState(0); // current fold, 0-indexed
  const folds = useMemo(() => computeFolds(mode === "leaky"), [mode]);

  const prior = useMemo(() => folds.slice(0, active).flatMap((f) => f.points), [folds, active]);
  const current = folds[active].points;
  const seenR2 = folds.slice(0, active + 1).map((f) => f.r2);
  const runningMean = seenR2.reduce((s, v) => s + v, 0) / seenR2.length;
  const finalMean = folds.reduce((s, f) => s + f.r2, 0) / folds.length;

  const step = (next: number) => {
    whenHydrated(() => useLearner.getState().recordPractice("data-leakage"));
    setActive(Math.max(0, Math.min(FOLDS - 1, next)));
  };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{dataLeakageExperiment.scenarios[0].prompt}</p>

          <div role="group" aria-label="Where feature selection happens" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
            {(
              [
                ["leaky", "Select on all data"],
                ["honest", "Select inside each fold"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => {
                  whenHydrated(() => useLearner.getState().recordPractice("data-leakage"));
                  setMode(value);
                  setActive(0);
                }}
                className={`rounded-full px-4 py-1 transition-colors ${mode === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* the fold stepper — scrub the cross-validation fold by fold */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs tracking-widest text-ink-faint uppercase tabular-nums">
                Fold {active + 1} / {FOLDS}
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  aria-label="Previous fold"
                  disabled={active === 0}
                  onClick={() => step(active - 1)}
                  className="rounded-full border border-line px-3 py-1 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  aria-label="Next fold"
                  disabled={active === FOLDS - 1}
                  onClick={() => step(active + 1)}
                  className="rounded-full border border-line px-3 py-1 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next fold →
                </button>
              </div>
            </div>
            <div role="group" aria-label="Jump to fold" className="mt-3 flex gap-1.5">
              {folds.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Fold ${i + 1}`}
                  aria-current={i === active ? "step" : undefined}
                  onClick={() => step(i)}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${i === active ? "bg-accent" : i < active ? "bg-ink-faint" : "bg-line hover:bg-ink-muted"}`}
                />
              ))}
            </div>
          </div>

          <StatGrid
            direction="col"
            caption={`CV R² over folds 1–${active + 1}`}
            stats={[
              {
                label: mode === "leaky" ? "leaky CV R² so far" : "honest CV R² so far",
                value: runningMean.toFixed(2),
                hue: mode === "leaky" ? "var(--viz-error-ink)" : "var(--viz-neutral-ink)",
                note: mode === "leaky" ? "looks like real skill" : "the truth: ~0, no signal",
              },
              {
                label: active + 1 < FOLDS ? `all ${FOLDS} folds will average` : "final CV R²",
                value: finalMean.toFixed(2),
                hue: "var(--ink-faint)",
              },
            ]}
          />

          <p className="rounded-lg border border-line bg-surface p-3 text-sm leading-relaxed text-ink-muted">
            {mode === "leaky"
              ? "The ten features were chosen once, using all sixty-four rows — including the very rows each fold then holds out. So the selection has already seen every test fold: the lit ticks never move as you step. The climbing R² is measuring that peek, not skill."
              : "Here the ten features are re-picked inside each fold, from its training rows only — watch the lit ticks reshuffle as you step. The held-out rows stay unseen until they're scored, and R² sits at ~0: the honest answer. There was never any signal."}
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 lg:mt-0">
          <DataLeakageProvenancePipe leaky={mode === "leaky"} r2={runningMean} className="max-w-[640px]" />
          <FoldScatter
            prior={prior}
            current={current}
            animKey={`${mode}-${active}`}
            label={`Predicted versus actual for held-out points, folds 1 to ${active + 1}. ${mode === "leaky" ? "Leaky selection: the cloud tracks the diagonal." : "Honest selection: the cloud scatters off the diagonal."}`}
          />
          <div className="w-full max-w-[320px]">
            <div className="flex items-baseline justify-between px-1 pb-1">
              <span className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
                {K} of {P} features selected
              </span>
              <span className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
                {mode === "leaky" ? "frozen — chose with test in view" : "re-picked per fold"}
              </span>
            </div>
            <FeatureStrip cols={folds[active].cols} />
          </div>
          <FoldBars foldR2={folds.map((f) => f.r2)} active={active} />
        </div>
      </div>
    </div>
  );
}
