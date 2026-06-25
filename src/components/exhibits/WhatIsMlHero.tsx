"use client";

import { useEffect, useId, useState } from "react";
import { Plot, usePlot } from "@/components/viz/Plot";
import { accuracy, boundaryX2, fitLogistic, proba } from "@/lib/models/logistic";
import { bestRuleAccuracy, whatIsMlData } from "@content/exhibits/what-is-ml/experiment";

/**
 * The specimen hero — the whole exhibit's thesis as a before/after. The SAME
 * labelled dots, twice. Left: the best rule you can draw BY HAND — one feature,
 * one vertical cut — its decision zones tinted, its mistakes ringed red and left
 * stranded on the wrong side. Right (easing in on load): the rule the MACHINE
 * learns from the same dots — both features, a tilted boundary — whose zones catch
 * almost everything, leaving only a couple of reds. A scrubber replays the morph
 * hand → learned; mistake ghosts from the hand rule persist as faint rings so the
 * learner sees what the machine fixed. Reduced motion shows both at rest.
 */

const XD: [number, number] = [-3.3, 3.3];
const YD: [number, number] = [-3.1, 3.1];
const BEST = bestRuleAccuracy(whatIsMlData);
const LEARNED = fitLogistic(whatIsMlData);
const T = BEST.t;
const HAND_PCT = Math.round(BEST.acc * 100);
const LEARNED_PCT = Math.round(accuracy(whatIsMlData, LEARNED) * 100);

type Pt = { x1: number; x2: number; y: 0 | 1 };
const handPredict = (p: Pt) => (p.x1 > T ? 1 : 0);
const machinePredict = (p: Pt) => (proba(LEARNED, p.x1, p.x2) >= 0.5 ? 1 : 0);
const HAND_MISTAKES = (whatIsMlData as Pt[]).filter((p) => handPredict(p) !== p.y);

const ZONE0 = "var(--viz-truth)";
const ZONE1 = "var(--viz-prediction)";
const ZONE_OP = 0.1;

/** Persistent mistake ghosts — hand-rule errors that stay visible as faint rings. */
function MistakeGhosts({ opacity = 0.55 }: { opacity?: number }) {
  const { x, y } = usePlot();
  return (
    <g aria-hidden opacity={opacity}>
      {HAND_MISTAKES.map((p, i) => (
        <circle
          key={i}
          cx={x(p.x1)}
          cy={y(p.x2)}
          r={8}
          fill="none"
          stroke="var(--viz-error)"
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.7}
        />
      ))}
    </g>
  );
}

function Dots({ predict }: { predict: (p: Pt) => number }) {
  const { x, y } = usePlot();
  return (
    <g>
      {(whatIsMlData as Pt[]).map((p, i) => {
        const wrong = predict(p) !== p.y;
        return (
          <circle
            key={i}
            cx={x(p.x1)}
            cy={y(p.x2)}
            r={wrong ? 6 : 5.5}
            fill={p.y === 1 ? ZONE1 : ZONE0}
            stroke={wrong ? "var(--viz-error)" : "var(--surface-bg)"}
            strokeWidth={wrong ? 3 : 1.25}
          />
        );
      })}
    </g>
  );
}

function HandGraphic() {
  const { x, y } = usePlot();
  const tx = x(T);
  const x0 = x(XD[0]);
  const x1 = x(XD[1]);
  const yT = y(YD[1]);
  const yB = y(YD[0]);
  return (
    <g>
      <rect x={x0} y={yT} width={tx - x0} height={yB - yT} fill={ZONE0} opacity={ZONE_OP} />
      <rect x={tx} y={yT} width={x1 - tx} height={yB - yT} fill={ZONE1} opacity={ZONE_OP} />
      <line x1={tx} x2={tx} y1={yT} y2={yB} stroke="var(--viz-neutral-ink)" strokeWidth={2.5} strokeDasharray="6 4" />
      <Dots predict={handPredict} />
      <text x={tx + 7} y={yT + 16} fontSize={12} fontFamily="var(--font-mono)" paintOrder="stroke" stroke="var(--surface-bg)" strokeWidth={3} fill="var(--viz-neutral-ink)">
        your cut
      </text>
    </g>
  );
}

function MachineGraphic({ morph }: { morph: number }) {
  const { x, y } = usePlot();
  const clipId = useId();
  const x0 = x(XD[0]);
  const x1 = x(XD[1]);
  const yT = y(YD[1]);
  const yB = y(YD[0]);
  // CounterfactualReplay: morph boundary from hand vertical cut → learned tilted line.
  const handTop = y(YD[1]);
  const handBot = y(YD[0]);
  const learnedA = [x0, y(boundaryX2(LEARNED, XD[0]))];
  const learnedB = [x1, y(boundaryX2(LEARNED, XD[1]))];
  const bx0 = x(T);
  const A: [number, number] = [bx0 + (learnedA[0] - bx0) * morph, handTop + (learnedA[1] - handTop) * morph];
  const B: [number, number] = [bx0 + (learnedB[0] - bx0) * morph, handBot + (learnedB[1] - handBot) * morph];
  const predictAtMorph = (p: Pt) => {
    if (morph < 0.02) return handPredict(p);
    if (morph > 0.98) return machinePredict(p);
    // Mid-morph: use the interpolated boundary as a soft classifier.
    const bx = boundaryX2(LEARNED, p.x1);
    const handSide = p.x1 > T ? 1 : 0;
    const machSide = p.x2 > bx ? 1 : 0;
    return Math.round(handSide * (1 - morph) + machSide * morph);
  };
  const topIs1 = predictAtMorph({ x1: 0, x2: YD[1], y: 1 }) === 1;
  const top = [[x0, yT], [x1, yT], B, A].map((p) => p.join(",")).join(" ");
  const bot = [[x0, yB], [x1, yB], B, A].map((p) => p.join(",")).join(" ");
  const ghostOpacity = 0.35 + 0.4 * morph;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x={x0} y={yT} width={x1 - x0} height={yB - yT} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <polygon points={top} fill={topIs1 ? ZONE1 : ZONE0} opacity={ZONE_OP} />
        <polygon points={bot} fill={topIs1 ? ZONE0 : ZONE1} opacity={ZONE_OP} />
      </g>
      <MistakeGhosts opacity={ghostOpacity} />
      <Dots predict={predictAtMorph} />
      <g clipPath={`url(#${clipId})`}>
        <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="var(--accent)" strokeWidth={3} />
      </g>
      {morph > 0.55 && (
        <text x={x1 - 8} y={yT + 16} textAnchor="end" fontSize={12} fontFamily="var(--font-mono)" paintOrder="stroke" stroke="var(--surface-bg)" strokeWidth={3} fill="var(--accent)">
          the machine&apos;s boundary
        </text>
      )}
    </g>
  );
}

function Panel({
  kicker,
  pct,
  tone,
  note,
  style,
  children,
}: {
  kicker: string;
  pct: number;
  tone: "neutral" | "accent";
  note: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex-1" style={style}>
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</span>
        <span
          className="text-2xl font-semibold tabular-nums"
          style={{ color: tone === "accent" ? "var(--accent)" : "var(--viz-neutral-ink)" }}
        >
          {pct}%
        </span>
      </div>
      {children}
      <p className="px-1 pt-1 text-xs leading-snug text-ink-muted">{note}</p>
    </div>
  );
}

export function WhatIsMlHero() {
  const [morph, setMorph] = useState(0);
  const [autoPlayed, setAutoPlayed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => {
        setMorph(1);
        setAutoPlayed(true);
      });
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const DURATION = 1100;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / DURATION);
      setMorph(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setAutoPlayed(true);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 360);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, []);

  const morphPct = Math.round((HAND_PCT + (LEARNED_PCT - HAND_PCT) * morph) * 10) / 10;

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">What machine learning is</span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">same dots · you vs the machine</span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        <Panel kicker="by hand · one cut" pct={HAND_PCT} tone="neutral" note="one feature, one vertical cut — and it tops out here, reds stranded on the wrong side">
          <Plot
            width={460}
            height={380}
            xDomain={XD}
            yDomain={YD}
            ariaLabel={`Two labelled classes. The best rule drawn by hand — a single vertical cut on one feature — scores ${HAND_PCT}% and leaves several points ringed red on the wrong side.`}
          >
            <HandGraphic />
          </Plot>
        </Panel>
        <Panel kicker="the machine · learned" pct={Math.round(morphPct)} tone="accent" note="both features, a tilted boundary — mistake ghosts show what the hand rule got wrong">
          <Plot
            width={460}
            height={380}
            xDomain={XD}
            yDomain={YD}
            ariaLabel={`The same dots. Scrub to replay the morph from your vertical cut to the machine's tilted boundary. Faint red rings are persistent mistake ghosts from the hand rule.`}
          >
            <MachineGraphic morph={morph} />
          </Plot>
          {autoPlayed && (
            <label className="mt-2 flex items-center gap-3 px-1">
              <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">replay</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(morph * 100)}
                onChange={(e) => setMorph(Number(e.target.value) / 100)}
                className="min-w-0 flex-1 accent-[var(--accent)]"
                aria-label="Replay morph from hand rule to learned rule"
              />
              <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-faint">{Math.round(morph * 100)}%</span>
            </label>
          )}
        </Panel>
      </div>
    </figure>
  );
}
