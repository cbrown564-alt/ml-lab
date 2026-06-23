"use client";

import { useEffect, useState } from "react";
import { Plot, usePlot } from "@/components/viz/Plot";
import { accuracy, boundaryX2, fitLogistic } from "@/lib/models/logistic";
import { bestRuleAccuracy, whatIsMlData } from "@content/exhibits/what-is-ml/experiment";

/**
 * The specimen hero — and the whole exhibit's thesis in one picture. The same
 * labelled dots, with the best rule you can draw BY HAND (one feature, one
 * vertical cut) leaving a scatter of red-ringed mistakes — and, easing in on load,
 * the rule the MACHINE learns from the same dots (both features, tilted) that
 * catches them. The two accuracies flank the scatter, so the doorway's claim —
 * the machine writes a rule you couldn't spell out — is legible before a word of
 * prose. Reduced motion renders the learned rule already in place.
 */

const Y_DOMAIN: [number, number] = [-2.9, 2.9];
// A wide matte (≈square pixels-per-unit at 1200×440) so the boundary's tilt is
// honest and the scatter rests centered with room for the callouts either side.
const X_DOMAIN: [number, number] = [-7.9, 7.9];
const SPAN: [number, number] = [-2.9, 2.9];

const BEST = bestRuleAccuracy(whatIsMlData);
const LEARNED = fitLogistic(whatIsMlData);
const HAND_PCT = Math.round(BEST.acc * 100);
const LEARNED_PCT = Math.round(accuracy(whatIsMlData, LEARNED) * 100);
const clampY = (v: number) => Math.max(SPAN[0], Math.min(SPAN[1], v));

function HeroGraphic({ reveal }: { reveal: number }) {
  const { x, y } = usePlot();
  const ly0 = clampY(boundaryX2(LEARNED, SPAN[0]));
  const ly1 = clampY(boundaryX2(LEARNED, SPAN[1]));
  return (
    <g>
      {whatIsMlData.map((p, i) => {
        const wrong = (p.x1 > BEST.t ? 1 : 0) !== p.y;
        return (
          <circle
            key={i}
            cx={x(p.x1)}
            cy={y(p.x2)}
            r={5}
            fill={p.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"}
            stroke={wrong ? "var(--viz-error)" : "var(--surface-bg)"}
            strokeWidth={wrong ? 2.5 : 1}
          />
        );
      })}
      {/* The rule you write by hand: a single vertical cut. */}
      <line
        x1={x(BEST.t)}
        x2={x(BEST.t)}
        y1={y(SPAN[1])}
        y2={y(SPAN[0])}
        stroke="var(--viz-neutral-ink)"
        strokeWidth={2.5}
        strokeDasharray="6 4"
      />
      <text
        x={x(BEST.t) + 7}
        y={y(SPAN[1]) + 15}
        fontSize={12}
        fontFamily="var(--font-mono)"
        paintOrder="stroke"
        stroke="var(--surface-bg)"
        strokeWidth={3}
        fill="var(--viz-neutral-ink)"
      >
        your rule
      </text>
      {/* The rule the machine learns: both features, tilted — eased in on load. */}
      <line
        x1={x(SPAN[0])}
        y1={y(ly0)}
        x2={x(SPAN[1])}
        y2={y(ly1)}
        stroke="var(--accent)"
        strokeWidth={3}
        opacity={reveal}
      />
      <text
        x={x(SPAN[1]) - 6}
        y={y(ly1) - 8}
        textAnchor="end"
        fontSize={12}
        fontFamily="var(--font-mono)"
        paintOrder="stroke"
        stroke="var(--surface-bg)"
        strokeWidth={3}
        fill="var(--accent)"
        opacity={reveal}
      >
        the machine&apos;s rule
      </text>
    </g>
  );
}

function Callout({
  side,
  kicker,
  detail,
  pct,
  tone,
  style,
}: {
  side: "left" | "right";
  kicker: string;
  detail: string;
  pct: number;
  tone: "neutral" | "accent";
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${side === "left" ? "left-0 pl-6 text-left" : "right-0 pr-6 text-right"} hidden flex-col justify-center gap-1 sm:flex`}
      style={style}
    >
      <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</span>
      <span
        className="text-5xl font-semibold tracking-tight tabular-nums"
        style={{ color: tone === "accent" ? "var(--accent)" : "var(--viz-neutral-ink)" }}
      >
        {pct}%
      </span>
      <span className="max-w-[16ch] text-xs leading-snug text-ink-muted">{detail}</span>
    </div>
  );
}

export function WhatIsMlHero() {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const DURATION = 1100;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / DURATION);
      setReveal(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    // Let the hand rule + its mistakes paint first, then bring in the machine's rule.
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 320);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          What machine learning is
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          you vs the machine
        </span>
      </figcaption>
      <div className="relative px-3 py-2">
        <Plot
          width={1200}
          height={440}
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          ariaLabel={`Two labelled classes in a plane. The best rule drawn by hand — a single vertical cut on one feature — scores ${HAND_PCT}% and leaves several points misclassified (ringed). The rule a machine learns from the same examples, a tilted line using both features, scores ${LEARNED_PCT}%.`}
        >
          <HeroGraphic reveal={reveal} />
        </Plot>
        <Callout side="left" kicker="by hand" pct={HAND_PCT} tone="neutral" detail="one feature, one cut — and it tops out here" />
        <Callout side="right" kicker="the machine" pct={LEARNED_PCT} tone="accent" detail="both features, tilted — learned from the same dots" style={{ opacity: reveal }} />
      </div>
    </figure>
  );
}
