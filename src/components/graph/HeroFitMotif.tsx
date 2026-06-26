"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/viz/primitives/shared";

/**
 * The front-door hero motif — the homepage's one living moment. A regression line
 * eases onto a scatter and breathes between a gentle slope and the full fit on a
 * slow loop, so the headline's promise ("running the model") is demonstrated, not
 * just asserted. It is the one thing the still jewels below can't show at a glance.
 * Reduced motion rests on the fitted frame.
 */

// A gentle upward scatter; the least-squares fit is ~ y = 0.15 + 0.72·x.
const PTS: [number, number][] = [
  [0.04, 0.18],
  [0.12, 0.31],
  [0.2, 0.25],
  [0.28, 0.43],
  [0.37, 0.37],
  [0.46, 0.53],
  [0.55, 0.49],
  [0.63, 0.67],
  [0.72, 0.61],
  [0.82, 0.79],
  [0.91, 0.83],
  [0.97, 0.8],
];
const sx = (x: number) => 30 + x * 700;
const sy = (y: number) => 160 - y * 140;

const FLAT_Y = sy(0.5); // mean baseline (fraction 0)
const FIT_L = sy(0.15); // best-fit left endpoint (fraction 1)
const FIT_R = sy(0.87); // best-fit right endpoint (fraction 1)

const LOOP = 7000;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Continuous breathing in [0.3, 1], biased to hold near the full fit. */
function fitFraction(p: number): number {
  const tri = p < 0.4 ? p / 0.4 : p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
  return 0.3 + 0.7 * ease(tri);
}

export function HeroFitMotif() {
  const reduce = usePrefersReducedMotion();
  const [f, setF] = useState(1);
  const raf = useRef(0);

  useEffect(() => {
    if (reduce) return; // render rests at the fitted frame (fv below)
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      setF(fitFraction(((now - start) % LOOP) / LOOP));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [reduce]);

  const fv = reduce ? 1 : f;
  const lY = FLAT_Y + fv * (FIT_L - FLAT_Y);
  const rY = FLAT_Y + fv * (FIT_R - FLAT_Y);
  const lineY = (x: number) => lY + (rY - lY) * x;

  return (
    <div className="mx-auto w-full max-w-[760px]" style={{ aspectRatio: "760 / 180" }}>
    <svg
      viewBox="0 0 760 180"
      className="h-full w-full"
      role="img"
      aria-label="A regression line settling onto a scatter of points — a model fitting itself to data."
    >
      {/* residual whiskers, surfacing only as the line settles */}
      <g opacity={Math.max(0, (fv - 0.55) * 1.1)} aria-hidden>
        {PTS.map(([x, y], i) => (
          <line
            key={i}
            x1={sx(x)}
            y1={sy(y)}
            x2={sx(x)}
            y2={lineY(x)}
            stroke="var(--viz-error)"
            strokeWidth={1.25}
          />
        ))}
      </g>
      <line
        x1={sx(0)}
        y1={lY}
        x2={sx(1)}
        y2={rY}
        stroke="var(--viz-prediction)"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {PTS.map(([x, y], i) => (
        <circle
          key={i}
          cx={sx(x)}
          cy={sy(y)}
          r={4.5}
          fill="var(--viz-truth)"
          stroke="var(--surface-bg)"
          strokeWidth={1}
        />
      ))}
    </svg>
    </div>
  );
}
