"use client";

import { useEffect, useState } from "react";
import { easeProgress } from "@/components/viz/primitives/interpolation";
import { usePrefersReducedMotion } from "@/components/viz/primitives/shared";

/**
 * Live micro-specimen for each exhibit — a warm, diagrammatic preview in the
 * lab's semantic viz grammar. Shown inside homepage jewels instead of abstract
 * glyphs alone. When `intent` is true (hover/focus before navigation), plays a
 * miniature of the exhibit hero animation.
 */
export function MicroSpecimen({
  id,
  intent = false,
  className = "h-full w-full",
}: {
  id: string;
  intent?: boolean;
  className?: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const [t, setT] = useState(intent && !reduceMotion ? 0 : 1);

  useEffect(() => {
    if (!intent || reduceMotion) {
      const f = requestAnimationFrame(() => setT(1));
      return () => cancelAnimationFrame(f);
    }
    let raf = 0;
    let start = 0;
    const DURATION = 400;
    // The first frame eases from 0, so no separate synchronous reset is needed.
    const tick = (now: number) => {
      if (!start) start = now;
      setT(easeProgress(now - start, DURATION));
      if (now - start < DURATION) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [intent, id, reduceMotion]);

  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden role="img">
      <WarmPlate />
      <Specimen id={id} t={t} />
    </svg>
  );
}

/** Soft raised plate so specimens read warm/diagrammatic, not abstract empty gems. */
function WarmPlate() {
  return (
    <rect
      x="8"
      y="10"
      width="104"
      height="76"
      rx="10"
      fill="color-mix(in oklch, var(--surface-raised) 88%, var(--viz-truth) 12%)"
      stroke="var(--line)"
      strokeWidth="1"
    />
  );
}

function Specimen({ id, t }: { id: string; t: number }) {
  switch (id) {
    case "what-is-ml":
      return <WhatIsMl t={t} />;
    case "the-dataset":
      return <TheDataset t={t} />;
    case "regression-task":
      return <RegressionTask />;
    case "linear-regression":
      return <LinearRegression t={t} />;
    case "classification-task":
      return <ClassificationTask />;
    case "logistic-regression":
      return <LogisticRegression />;
    case "loss-functions":
      return <LossFunctions />;
    case "the-gradient":
      return <TheGradient t={t} />;
    case "gradient-descent":
      return <GradientDescent t={t} />;
    case "feature-scaling":
      return <FeatureScaling t={t} />;
    case "train-test-generalization":
      return <TrainTest />;
    case "overfitting-regularization":
      return <Overfitting />;
    case "bias-variance":
      return <BiasVariance />;
    case "data-leakage":
      return <DataLeakage />;
    case "neural-network-fundamentals":
      return <NeuralNet t={t} />;
    default:
      return <FallbackSpecimen id={id} />;
  }
}

function FallbackSpecimen({ id }: { id: string }) {
  return (
    <>
      <line x1="28" y1="72" x2="92" y2="72" stroke="var(--line)" strokeWidth="1.5" />
      <line x1="28" y1="72" x2="28" y2="28" stroke="var(--line)" strokeWidth="1.5" />
      <circle cx="60" cy="48" r="14" fill="none" stroke="var(--viz-neutral)" strokeWidth="2" strokeDasharray="4 3" />
      <text x="60" y="52" textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--ink-faint)">
        {id.slice(0, 3)}
      </text>
    </>
  );
}

function WhatIsMl({ t }: { t: number }) {
  const y = (x: number) => 62 - t * (0.28 * (x - 26));
  return (
    <>
      {[[26, 62], [40, 70], [54, 50], [70, 54], [86, 36]].map(([x, y0], i) => (
        <circle key={i} cx={x} cy={y0} r="3" fill="var(--viz-truth)" />
      ))}
      <path
        d={`M22 72 Q 50 ${72 - t * 18}, 100 ${y(100)}`}
        fill="none"
        stroke="var(--viz-prediction)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {t > 0.4 &&
        [[40, 70], [54, 50]].map(([x, y0], i) => (
          <circle
            key={`g${i}`}
            cx={x}
            cy={y0}
            r="5"
            fill="none"
            stroke="var(--viz-error)"
            strokeWidth="1.5"
            strokeDasharray="3 2"
            opacity={(t - 0.4) / 0.6}
          />
        ))}
    </>
  );
}

function TheDataset({ t }: { t: number }) {
  const slopeClean = 0.55;
  const slopeDirty = 0.22;
  const slope = slopeClean + (slopeDirty - slopeClean) * t;
  const x0 = 24;
  const x1 = 96;
  const y0 = 72;
  const yAt = (x: number) => y0 - slope * (x - x0);
  return (
    <>
      {[
        [36, 58],
        [48, 52],
        [58, 46],
        [68, 40],
        [78, 36],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="var(--viz-truth)" />
      ))}
      <line
        x1={x0}
        y1={yAt(x0)}
        x2={x1}
        y2={yAt(x1)}
        stroke="var(--viz-prediction)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <g opacity={t}>
        <circle cx={32} cy={58} r="5" fill="var(--viz-error)" stroke="var(--surface-bg)" strokeWidth="1.5" />
        <line x1={32} y1={58} x2={32} y2={yAt(32)} stroke="var(--viz-error)" strokeWidth="1.5" strokeDasharray="3 2" opacity={0.7} />
        <line x1={32} y1={58} x2={52} y2={42} stroke="var(--viz-error)" strokeWidth="1" strokeDasharray="3 2" opacity={0.6} />
        <rect x={52} y={34} width={44} height={22} rx={4} fill="var(--surface-bg)" stroke="var(--viz-error)" strokeWidth="1" />
        <text x={56} y={44} fontSize="6" fontFamily="var(--font-mono)" fill="var(--viz-error-ink)">
          12 m² typo
        </text>
        <text x={56} y={52} fontSize="6" fontFamily="var(--font-mono)" fill="var(--ink-muted)">
          row · provenance
        </text>
      </g>
    </>
  );
}

function RegressionTask() {
  return (
    <>
      <line x1="24" y1="22" x2="24" y2="76" stroke="var(--line)" strokeWidth="1.5" />
      <line x1="24" y1="76" x2="98" y2="76" stroke="var(--line)" strokeWidth="1.5" />
      {[[36, 66], [50, 58], [64, 52], [78, 40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--viz-truth)" />
      ))}
      <path d="M32 68 L96 32" fill="none" stroke="var(--viz-prediction)" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function LinearRegression({ t }: { t: number }) {
  // The fit pivots from a flat line at the cloud's mean into the least-squares
  // fit *through* the scatter — settling at (22,72)→(100,30), so it lands on the
  // points instead of floating above them.
  const y1 = 51 + t * 21; // left end drops below the centroid
  const y2 = 51 - t * 21; // right end rises — the line rotates into place
  // Where the fitted line sits at x=80 (tracks the animation, so the residual
  // always connects the off-line point to the line, not to empty space).
  const lineAt80 = 51 - 10.2 * t;
  return (
    <>
      <line x1="22" y1={y1} x2="100" y2={y2} stroke="var(--viz-prediction)" strokeWidth="2.5" strokeLinecap="round" />
      {[[30, 70], [44, 60], [58, 56], [80, 34], [92, 36]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--viz-truth)" />
      ))}
      {t > 0.6 && (
        <line x1="80" y1="34" x2="80" y2={lineAt80} stroke="var(--viz-error)" strokeWidth="1.5" strokeDasharray="3 3" opacity={(t - 0.6) / 0.4} />
      )}
    </>
  );
}

function ClassificationTask() {
  return (
    <>
      <path d="M34 22 C 58 44, 62 56, 88 78" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      {[[34, 56], [44, 66], [48, 50]].map(([x, y], i) => (
        <circle key={`g${i}`} cx={x} cy={y} r="3" fill="var(--viz-truth)" />
      ))}
      {[[76, 34], [86, 44], [88, 30]].map(([x, y], i) => (
        <circle key={`p${i}`} cx={x} cy={y} r="3" fill="var(--viz-param)" />
      ))}
    </>
  );
}

function LogisticRegression() {
  return (
    <>
      <path d="M24 74 C 52 74, 58 26, 96 26" fill="none" stroke="var(--viz-prediction)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="74" r="3" fill="var(--viz-truth)" />
      <circle cx="90" cy="26" r="3" fill="var(--viz-param)" />
    </>
  );
}

function LossFunctions() {
  // A convex loss bowl: a point sits *on* the curve and pays a loss — the dashed
  // drop down to the bowl floor (not a marker floating in the middle of the bowl).
  return (
    <>
      <path d="M26 26 C 44 92, 76 92, 94 26" fill="none" stroke="var(--viz-prediction)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="82" y1="58" x2="82" y2="76" stroke="var(--viz-error)" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="82" cy="58" r="4" fill="var(--viz-truth)" />
    </>
  );
}

function TheGradient({ t }: { t: number }) {
  // Nested contours with the steepest-ascent arrow climbing across them toward
  // the peak — a topographic read, not a single ellipse with a slash through it.
  const tipX = 50 + t * 24;
  const tipY = 70 - t * 36;
  return (
    <>
      {[26, 18, 10].map((r, i) => (
        <ellipse
          key={i}
          cx="54"
          cy="56"
          rx={r + 10}
          ry={r}
          transform="rotate(-24 54 56)"
          fill="none"
          stroke="var(--viz-prediction)"
          strokeWidth="1.4"
          opacity={0.4 + i * 0.16}
        />
      ))}
      <path d={`M50 70 L${tipX} ${tipY}`} stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
      {t > 0.55 && (
        <path
          d={`M${tipX - 9} ${tipY + 5} L${tipX} ${tipY} L${tipX - 1} ${tipY + 10}`}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={(t - 0.55) / 0.45}
        />
      )}
    </>
  );
}

function GradientDescent({ t }: { t: number }) {
  // Steps sampled *on* the bowl curve, settling at its minimum (60,78) rather
  // than overshooting below the floor.
  const pts = [
    [32, 53],
    [42, 68],
    [52, 76],
    [60, 78],
  ];
  const idx = Math.min(pts.length - 1, Math.floor(t * (pts.length - 1)));
  return (
    <>
      <path d="M22 26 C 42 96, 78 96, 98 26" fill="none" stroke="var(--line)" strokeWidth="2" strokeLinecap="round" />
      {pts.slice(0, idx + 1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === idx ? 4.5 : 3} fill={i === idx ? "var(--viz-param)" : "var(--accent)"} opacity={0.5 + i * 0.15} />
      ))}
    </>
  );
}

function FeatureScaling({ t }: { t: number }) {
  // Raw features at unequal scales (a stretched, tilted cloud) normalised into a
  // round one. The before/after both read at rest; hover replays the normalise so
  // it isn't just a lone circle with a dangling stub.
  return (
    <>
      <ellipse cx="38" cy="50" rx="18" ry="7" transform="rotate(-28 38 50)" fill="none" stroke="var(--viz-error)" strokeWidth="2" />
      <circle cx="38" cy="50" r="2.2" fill="var(--viz-truth)" />
      <path d={`M60 50 L${68 + t * 4} 50`} stroke="var(--viz-param)" strokeWidth="2" strokeLinecap="round" opacity={t} />
      <path
        d="M69 46 L74 50 L69 54"
        fill="none"
        stroke="var(--viz-param)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={t}
      />
      <circle cx="90" cy="50" r={11 * t} fill="none" stroke="var(--accent)" strokeWidth="2.4" />
      <circle cx="90" cy="50" r="2.2" fill="var(--viz-truth)" opacity={t} />
    </>
  );
}

function TrainTest() {
  return (
    <>
      <line x1="60" y1="20" x2="60" y2="78" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M20 70 L100 34" stroke="var(--viz-prediction)" strokeWidth="2" strokeLinecap="round" />
      {[[30, 66], [40, 54], [50, 58]].map(([x, y], i) => (
        <circle key={`a${i}`} cx={x} cy={y} r="3" fill="var(--viz-truth)" />
      ))}
      {[[72, 48], [84, 40]].map(([x, y], i) => (
        <circle key={`b${i}`} cx={x} cy={y} r="3" fill="none" stroke="var(--accent)" strokeWidth="2" />
      ))}
    </>
  );
}

function Overfitting() {
  return (
    <>
      <path d="M22 58 C 34 30, 52 84, 80 40 S 96 50, 100 44" fill="none" stroke="var(--viz-error)" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 64 C 44 44, 78 40, 100 34" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      {[[30, 58], [48, 50], [66, 46]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.8" fill="var(--viz-truth)" />
      ))}
    </>
  );
}

function BiasVariance() {
  return (
    <>
      <path d="M26 42 C 48 78, 72 78, 96 42" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 30 Q 44 64, 60 56" fill="none" stroke="var(--viz-prediction)" strokeWidth="1.8" opacity="0.7" />
      <path d="M60 56 Q 80 36, 96 30" fill="none" stroke="var(--viz-param)" strokeWidth="1.8" opacity="0.7" />
      <circle cx="61" cy="68" r="3.5" fill="var(--viz-truth)" />
    </>
  );
}

function DataLeakage() {
  // The target column's answer leaks back into the feature table — an arrowhead
  // gives the leak a direction, and the rows make the left box read as features.
  return (
    <>
      <rect x="26" y="28" width="34" height="44" rx="5" fill="none" stroke="var(--viz-truth)" strokeWidth="2" />
      {[40, 54].map((y) => (
        <line key={y} x1="33" y1={y} x2="53" y2={y} stroke="var(--viz-truth)" strokeWidth="1.6" opacity="0.7" />
      ))}
      <rect x="80" y="28" width="14" height="44" rx="5" fill="none" stroke="var(--viz-error)" strokeWidth="2" />
      <path d="M80 50 L64 50" fill="none" stroke="var(--viz-error)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      <path d="M70 45 L63 50 L70 55" fill="none" stroke="var(--viz-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function NeuralNet({ t }: { t: number }) {
  // input (2) → hidden (3) → output (1). The hidden layer assembles unit by
  // unit; each one wires to *both* inputs and the output, so the graph always
  // reads as a complete, connected network (no floating output, no curve
  // slashing across the nodes).
  const folds = Math.ceil(t * 3);
  const hidden = [26, 48, 70];
  return (
    <>
      {hidden.slice(0, folds).map((hy, i) => (
        <g key={`e${i}`} stroke="var(--line)" strokeWidth="1">
          <line x1="30" y1="34" x2="58" y2={hy} />
          <line x1="30" y1="62" x2="58" y2={hy} />
          <line x1="58" y1={hy} x2="88" y2="48" />
        </g>
      ))}
      {[34, 62].map((y, i) => (
        <circle key={`in${i}`} cx="30" cy={y} r="3.5" fill="var(--viz-truth)" />
      ))}
      {hidden.slice(0, folds).map((hy, i) => (
        <circle key={`h${i}`} cx="58" cy={hy} r="3.5" fill="var(--viz-param)" />
      ))}
      <circle cx="88" cy="48" r="4" fill="var(--viz-prediction)" />
    </>
  );
}
