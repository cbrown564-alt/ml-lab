"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { polyMSE, predictPoly, ridgeFit } from "@/lib/models/polynomial";
import fixtures from "@/lib/models/fixtures/polynomial.json";
import type { Point } from "@/lib/models/linear-regression";

/**
 * The specimen hero — the bias-variance tradeoff. PinAndCompare complexity scrubber
 * sweeps polynomial degree; VarianceSwarm overlays bootstrap-resampled fits so
 * variance reads as a fan of curves. Reduced motion renders settled.
 */

const TRAIN = fixtures.train as Point[];
const TEST = fixtures.test as Point[];
const DEGREES = [1, 2, 3, 4, 5, 6, 8, 10, 12];

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bootstrapFits(degree: number, n = 12): ReturnType<typeof ridgeFit>[] {
  const fits: ReturnType<typeof ridgeFit>[] = [];
  for (let s = 1; s <= n; s++) {
    const rng = mulberry32(s * 17 + degree);
    const idx = Array.from({ length: TRAIN.length }, () => Math.floor(rng() * TRAIN.length));
    const sample = idx.map((i) => TRAIN[i]);
    fits.push(ridgeFit(sample, degree, 0));
  }
  return fits;
}

function TestPoints() {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {TEST.map((p, i) => (
        <circle
          key={i}
          cx={x(p.x)}
          cy={y(p.y)}
          r={3.5}
          fill="none"
          stroke="var(--viz-truth)"
          strokeWidth={1.25}
          strokeOpacity={0.55}
        />
      ))}
    </g>
  );
}

/** Plot-integrated variance fan — exhibit-specific; see `@/components/viz/primitives/VarianceSwarm` for the portable swarm/envelope primitive. */
function VarianceSwarm({ degree, reveal }: { degree: number; reveal: number }) {
  const swarm = useMemo(() => bootstrapFits(degree), [degree]);
  return (
    <g style={{ opacity: reveal * 0.62, transition: "opacity 350ms ease" }} aria-hidden>
      {swarm.map((w, i) => (
        <PolyCurve key={`${degree}-${i}`} predict={(xv) => predictPoly(w, xv)} faint />
      ))}
    </g>
  );
}

export function BiasVarianceHero() {
  const [degreeIdx, setDegreeIdx] = useState(3);
  const [reveal, setReveal] = useState(0);
  const degree = DEGREES[degreeIdx];
  const w = useMemo(() => ridgeFit(TRAIN, degree, 0), [degree]);
  const testErr = useMemo(() => polyMSE(TEST, w), [w]);

  const kicker =
    degree <= 2 ? "too stiff — underfits" : degree >= 10 ? "too flexible — overfits" : "about right";

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const raf = requestAnimationFrame(() => setReveal(0.15));
    const t = window.setTimeout(() => setReveal(1), 120);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [degree]);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The bias–variance tradeoff
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          degree {degree} · test {testErr.toFixed(2)}
        </span>
      </figcaption>
      <div className="px-3 py-3">
        <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
          <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
            deg {degree} · {kicker}
          </span>
          <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--viz-error-ink)" }}>
            test {testErr.toFixed(2)}
          </span>
        </div>
        <Plot
          width={1200}
          height={320}
          xDomain={[-0.02, 1.02]}
          yDomain={[-1.55, 1.55]}
          ariaLabel={`A degree-${degree} polynomial fit (${kicker}); bootstrap resamples fan out as variance swarm; test error ${testErr.toFixed(2)}.`}
        >
          <TestPoints />
          <VarianceSwarm degree={degree} reveal={reveal} />
          <g style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
            <PolyCurve predict={(xv) => predictPoly(w, xv)} />
          </g>
          <DataPoints points={TRAIN} />
        </Plot>
        <label className="mt-3 flex items-center gap-3 px-1">
          <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">stiff</span>
          <input
            type="range"
            min={0}
            max={DEGREES.length - 1}
            value={degreeIdx}
            onChange={(e) => setDegreeIdx(Number(e.target.value))}
            className="min-w-0 flex-1 accent-[var(--viz-prediction)] transition-[accent-color] duration-200"
            aria-label="Scrub model complexity (polynomial degree)"
          />
          <span className="shrink-0 font-mono text-[10px] tracking-wide text-ink-faint uppercase">flexible</span>
        </label>
      </div>
    </figure>
  );
}
