"use client";

import { useEffect, useId, useState } from "react";
import { crossValR2, type HeldOut, type Matrix } from "@/lib/models/leakage";
import fixtures from "@/lib/models/fixtures/leakage.json";

/** Least-squares line through (x, y) points — inlined so the hero doesn't pull the
 * whole linear-regression model into this route's bundle (keeps it under budget). */
function leastSquares(pts: { x: number; y: number }[]) {
  const n = pts.length || 1;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of pts) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

/**
 * The specimen hero — how leakage manufactures fake skill. The data is pure noise.
 * Pick features on ALL of it and then cross-validate, and the held-out predictions
 * line up on the diagonal at a confident R² — skill that isn't there. Pick features
 * inside each fold (the honest way) and the same data scatters into a shapeless
 * cloud at R² ≈ 0. Same noise, two pipelines, opposite verdicts. The points fade in
 * on load; reduced motion renders them drawn.
 */

const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;
const LEAKED = crossValR2(X, Y, K, FOLDS, true);
const HONEST = crossValR2(X, Y, K, FOLDS, false);

const W = 460;
const H = 380;
const M = 36;
const EXT = 2.8;
// The "truth lane": predictions within ±BAND of the actual value land on the
// diagonal. Points that stray outside it are wrong by more than the tolerance —
// drawn in error-red, so each dot's distance from the diagonal IS its error.
const BAND = 1.0;
const sx = (v: number) => M + ((v + EXT) / (2 * EXT)) * (W - 2 * M);
const sy = (v: number) => H - M - ((v + EXT) / (2 * EXT)) * (H - 2 * M);
const clamp = (v: number) => Math.max(-EXT, Math.min(EXT, v));

function HeroScatter({
  points,
  reveal,
  verdict,
}: {
  points: HeldOut[];
  reveal: number;
  /** Short in-graphic read on the trend's orientation (mechanism, not just prose). */
  verdict: string;
}) {
  const clipId = useId();
  // The line through predicted-vs-actual: it tilts up where the (fake) skill is and
  // lies flat where there's only noise — so "skill vs nothing" reads, not just the R².
  const trend = leastSquares(points.map((p) => ({ x: p.actual, y: p.predicted })));
  const ty = (x: number) => clamp(trend.slope * x + trend.intercept);
  // The lane as a band around y = x, ±BAND in the predicted direction.
  const lane = [
    [sx(-EXT), sy(-EXT + BAND)],
    [sx(EXT), sy(EXT + BAND)],
    [sx(EXT), sy(EXT - BAND)],
    [sx(-EXT), sy(-EXT - BAND)],
  ]
    .map((p) => p.join(","))
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Predicted versus actual for held-out points; a real model's points track up the diagonal lane, pure noise scatters off it into error."
      className="h-auto w-full"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={M} y={M} width={W - 2 * M} height={H - 2 * M} />
        </clipPath>
      </defs>
      <rect x={M} y={M} width={W - 2 * M} height={H - 2 * M} fill="none" stroke="var(--line)" />
      {/* the truth lane — where prediction ≈ actual */}
      <polygon points={lane} fill="var(--viz-truth)" fillOpacity={0.12} clipPath={`url(#${clipId})`} />
      <line x1={sx(-EXT)} y1={sy(-EXT)} x2={sx(EXT)} y2={sy(EXT)} stroke="var(--ink-faint)" strokeDasharray="4 4" />
      <text x={sx(EXT) - 4} y={sy(EXT) + 14} textAnchor="end" fontSize={11} fill="var(--ink-faint)" fontStyle="italic">
        predicted = actual
      </text>
      <g clipPath={`url(#${clipId})`} style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
        {points.map((p, i) => {
          const stray = Math.abs(p.predicted - p.actual) > BAND;
          return (
            <circle
              key={i}
              cx={sx(p.actual)}
              cy={sy(clamp(p.predicted))}
              r={stray ? 4.6 : 4}
              fill={stray ? "var(--viz-error)" : "var(--viz-prediction)"}
              fillOpacity={stray ? 0.85 : 0.62}
            />
          );
        })}
        {/* the held-out trend, on a surface-coloured halo so it reads over the dots:
            tilted = apparent skill tracking the truth, flat = noise ignoring it. */}
        <line x1={sx(-EXT)} y1={sy(ty(-EXT))} x2={sx(EXT)} y2={sy(ty(EXT))} stroke="var(--surface)" strokeWidth={6.5} strokeLinecap="round" />
        <line x1={sx(-EXT)} y1={sy(ty(-EXT))} x2={sx(EXT)} y2={sy(ty(EXT))} stroke="var(--viz-prediction)" strokeWidth={3.25} strokeLinecap="round" />
      </g>
      <text
        x={sx(EXT) - 6}
        y={sy(ty(EXT)) - 8}
        textAnchor="end"
        fontSize={11}
        fontStyle="italic"
        fill="var(--viz-prediction)"
        style={{ opacity: reveal, transition: "opacity 500ms ease" }}
      >
        {verdict}
      </text>
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--ink-faint)" fontFamily="var(--font-mono)">
        actual target →
      </text>
    </svg>
  );
}

function Panel({
  kicker,
  r2,
  note,
  r2hue,
  points,
  reveal,
  verdict,
}: {
  kicker: string;
  r2: number;
  note: string;
  r2hue: string;
  points: HeldOut[];
  reveal: number;
  verdict: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</span>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: r2hue }}>
          R² {r2.toFixed(2)}
        </span>
      </div>
      <HeroScatter points={points} reveal={reveal} verdict={verdict} />
      <p className="px-1 pt-1 text-xs leading-snug text-ink-muted">{note}</p>
    </div>
  );
}

export function DataLeakageHero() {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 360);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Data leakage
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          same noise, two pipelines
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        <Panel
          kicker="features picked on all data"
          r2={LEAKED.meanR2}
          r2hue="var(--viz-error-ink)"
          note="The held-out points line up — skill that looks real, but it leaked from peeking at the test rows."
          points={LEAKED.points}
          reveal={reveal}
          verdict="rises with actual"
        />
        <Panel
          kicker="picked inside each fold — honest"
          r2={HONEST.meanR2}
          r2hue="var(--ink-muted)"
          note="Same data, leak closed: a shapeless cloud at R² ≈ 0. The honest truth — there was never any signal."
          points={HONEST.points}
          reveal={reveal}
          verdict="flat — ignores actual"
        />
      </div>
    </figure>
  );
}
