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
      setT(1);
      return;
    }
    setT(0);
    let raf = 0;
    let start = 0;
    const DURATION = 400;
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
  const y1 = 72 - t * 42;
  const y2 = 72 - t * 48;
  return (
    <>
      <line x1="22" y1={y1} x2="100" y2={y2} stroke="var(--viz-prediction)" strokeWidth="2.5" strokeLinecap="round" />
      {[[30, 70], [44, 60], [58, 56], [80, 34], [92, 36]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--viz-truth)" />
      ))}
      {t > 0.6 && (
        <line x1="80" y1="34" x2="80" y2="54" stroke="var(--viz-error)" strokeWidth="1.5" strokeDasharray="3 3" opacity={(t - 0.6) / 0.4} />
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
  return (
    <>
      <path d="M26 26 C 44 92, 76 92, 94 26" fill="none" stroke="var(--viz-prediction)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="54" r="4" fill="var(--viz-truth)" />
      <line x1="70" y1="54" x2="70" y2="74" stroke="var(--viz-error)" strokeWidth="2" strokeDasharray="3 3" />
    </>
  );
}

function TheGradient({ t }: { t: number }) {
  const len = 28 * t;
  return (
    <>
      <ellipse cx="54" cy="56" rx="28" ry="18" fill="none" stroke="var(--viz-prediction)" strokeWidth="1.5" opacity="0.5" />
      <path d={`M50 70 L${50 + len * 0.75} ${70 - len}`} stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
    </>
  );
}

function GradientDescent({ t }: { t: number }) {
  const pts = [
    [34, 50],
    [46, 68],
    [56, 79],
    [60, 83],
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
  const rx = 20 - t * 7;
  const ry = 8 + t * 5;
  return (
    <>
      <ellipse cx="60" cy="50" rx={rx} ry={ry} fill="none" stroke="var(--viz-error)" strokeWidth="2" opacity={0.7 + t * 0.3} />
      <path
        d={`M34 50 L${46 + t * 8} 50`}
        stroke="var(--viz-param)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity={t}
      />
      <circle cx="60" cy="50" r="2.5" fill="var(--viz-truth)" />
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
  return (
    <>
      <rect x="26" y="28" width="34" height="44" rx="5" fill="none" stroke="var(--viz-truth)" strokeWidth="2" />
      <rect x="80" y="28" width="14" height="44" rx="5" fill="none" stroke="var(--viz-error)" strokeWidth="2" />
      <path d="M80 50 C 70 50, 62 50, 58 50" fill="none" stroke="var(--viz-error)" strokeWidth="2" strokeDasharray="4 4" />
    </>
  );
}

function NeuralNet({ t }: { t: number }) {
  const folds = Math.ceil(t * 3);
  return (
    <>
      {[[30, 36], [30, 60]].map(([x, y], i) => (
        <circle key={`in${i}`} cx={x} cy={y} r="3.5" fill="var(--viz-truth)" />
      ))}
      {[28, 48, 68].slice(0, folds).map((y, i) => (
        <g key={i}>
          <line x1="30" y1="36" x2="58" y2={y} stroke="var(--line)" strokeWidth="1" />
          <line x1="30" y1="60" x2="58" y2={y} stroke="var(--line)" strokeWidth="1" />
          <circle cx="58" cy={y} r="3.5" fill="var(--viz-param)" />
        </g>
      ))}
      <circle cx="86" cy="48" r="4" fill="var(--viz-prediction)" />
      {folds >= 2 && (
        <path
          d="M20 48 C 40 20, 80 76, 100 48"
          fill="none"
          stroke="var(--viz-neutral)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity={t}
        />
      )}
    </>
  );
}
