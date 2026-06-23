"use client";

import { useMemo, useState } from "react";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { crossValR2, type Matrix } from "@/lib/models/leakage";
import { dataLeakageExperiment } from "@content/exhibits/data-leakage/experiment";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * Data-leakage bench: the same noise data and model, scored two ways. Leaky =
 * select the most target-correlated features using all the data, then cross-validate
 * (the selection has peeked at every test fold). Honest = select inside each fold.
 * The toggle swaps the CV R², the per-fold bars, and the predicted-vs-actual scatter
 * — the leaky one hugs the diagonal like a real model; the honest one is a cloud.
 */
const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;

type Mode = "leaky" | "honest";

function Scatter({ points }: { points: { actual: number; predicted: number }[] }) {
  const W = 300;
  const H = 300;
  const m = 30;
  const ext = 2.8;
  const sx = (v: number) => m + ((v + ext) / (2 * ext)) * (W - 2 * m);
  const sy = (v: number) => H - m - ((v + ext) / (2 * ext)) * (H - 2 * m);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Predicted versus actual for the held-out points. A real model hugs the diagonal; pure noise scatters off it." className="h-auto w-full max-w-[300px]">
      <rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} fill="none" stroke="var(--line)" />
      {/* y = x: where a perfect model would sit */}
      <line x1={sx(-ext)} y1={sy(-ext)} x2={sx(ext)} y2={sy(ext)} stroke="var(--ink-faint)" strokeDasharray="4 4" />
      <text x={sx(ext) - 4} y={sy(ext) + 14} textAnchor="end" fontSize={10} fill="var(--ink-faint)" fontStyle="italic">predicted = actual</text>
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.actual)} cy={sy(Math.max(-ext, Math.min(ext, p.predicted)))} r={3.5} fill="var(--viz-prediction)" fillOpacity={0.7} />
      ))}
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--ink-faint)" fontFamily="var(--font-mono)">actual →</text>
    </svg>
  );
}

function FoldBars({ foldR2 }: { foldR2: number[] }) {
  const W = 300;
  const H = 110;
  const m = { l: 30, r: 8, t: 10, b: 18 };
  const lim = 1;
  const zero = m.t + (H - m.t - m.b) / 2;
  const bw = (W - m.l - m.r) / foldR2.length;
  const barH = (v: number) => (Math.max(-lim, Math.min(lim, v)) / lim) * ((H - m.t - m.b) / 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`R² for each of the ${foldR2.length} folds.`} className="h-auto w-full max-w-[300px]">
      <line x1={m.l} x2={W - m.r} y1={zero} y2={zero} stroke="var(--line)" />
      <text x={m.l - 4} y={zero + 3} textAnchor="end" fontSize={9} fill="var(--ink-faint)" fontFamily="var(--font-mono)">0</text>
      {foldR2.map((v, i) => {
        const h = barH(v);
        return (
          <rect key={i} x={m.l + i * bw + bw * 0.2} y={h >= 0 ? zero - h : zero} width={bw * 0.6} height={Math.abs(h)} fill={v >= 0 ? "var(--viz-prediction)" : "var(--viz-error)"} />
        );
      })}
      <text x={(m.l + W - m.r) / 2} y={H - 4} textAnchor="middle" fontSize={9} fill="var(--ink-faint)" fontFamily="var(--font-mono)">R² per fold</text>
    </svg>
  );
}

export function DataLeakageLab() {
  const leaky = useMemo(() => crossValR2(X, Y, K, FOLDS, true), []);
  const honest = useMemo(() => crossValR2(X, Y, K, FOLDS, false), []);
  const [mode, setMode] = useState<Mode>("leaky");
  const cur = mode === "leaky" ? leaky : honest;
  const other = mode === "leaky" ? honest : leaky;

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
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
                }}
                className={`rounded-full px-4 py-1 transition-colors ${mode === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <StatGrid
            direction="col"
            caption={mode === "leaky" ? "Cross-validation says…" : "Honest cross-validation says…"}
            stats={[
              { label: "CV R²", value: cur.meanR2.toFixed(2), hue: mode === "leaky" ? "var(--viz-error)" : "var(--viz-neutral)", note: mode === "leaky" ? "looks like real skill" : "the truth: ~0, no signal" },
              { label: mode === "leaky" ? "…but the honest score" : "…the leaky score was", value: other.meanR2.toFixed(2), hue: "var(--ink-faint)" },
            ]}
          />

          <p className="rounded-lg border border-line bg-surface p-3 text-sm leading-relaxed text-ink-muted">
            {mode === "leaky"
              ? "A model that explains nearly half the variance — on data with no signal at all. The leak: the ten features were chosen because they correlated with the target across the whole set, so every test fold helped pick them. The score is measuring that peek, not skill."
              : "Select the features inside each fold, on its training rows only, and the mirage is gone: R² sits at zero (or below). This is the honest answer — there was never anything to predict."}
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 lg:mt-0">
          <Scatter points={cur.points} />
          <FoldBars foldR2={cur.foldR2} />
        </div>
      </div>
    </div>
  );
}
