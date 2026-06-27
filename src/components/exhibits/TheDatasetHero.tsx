"use client";

import { useEffect, useState } from "react";
import { Plot, usePlot } from "@/components/viz/Plot";
import { PointRowLink } from "@/components/viz/primitives/PointRowLink";
import { easeProgress } from "@/components/viz/primitives/interpolation";
import { usePrefersReducedMotion } from "@/components/viz/primitives/shared";
import { olsFit, type LinearParams } from "@/lib/models/linear-regression";
import { corruptedRows, houses, toPoints } from "@content/exhibits/the-dataset/experiment";

/**
 * The specimen hero — why "a dataset is just a table" matters. The twelve honest
 * houses set an upward size→price trend (the dashed reference). Then, on load, one
 * mistyped row drops in — a 112 m² flat fat-fingered to 12 m² — and the fitted line
 * visibly flattens toward it: the model only sees the table, so one bad row drags
 * the whole rule. A provenance lens tethers the outlier point to its table row so
 * leverage reads as a data-entry mistake, not a stray dot. Reduced motion renders
 * it already dragged.
 */

const CLEAN = olsFit(toPoints(houses));
const DIRTY = olsFit(toPoints([...houses, ...corruptedRows]));
const OUTLIER = corruptedRows[0];
const X_DOMAIN: [number, number] = [0, 132];
const Y_DOMAIN: [number, number] = [0, 400];
const MORPH_MS = 480;

const at = (p: LinearParams, x: number) => p.slope * x + p.intercept;

function HeroGraphic({ t }: { t: number }) {
  const { x, y } = usePlot();
  const dragged: LinearParams = {
    slope: CLEAN.slope + (DIRTY.slope - CLEAN.slope) * t,
    intercept: CLEAN.intercept + (DIRTY.intercept - CLEAN.intercept) * t,
  };
  const [x0, x1] = X_DOMAIN;
  const px = x(OUTLIER.size);
  const py = y(OUTLIER.price);
  return (
    <g>
      {houses.map((h) => (
        <circle
          key={h.id}
          cx={x(h.size)}
          cy={y(h.price)}
          r={5}
          fill="var(--viz-truth)"
          stroke="var(--surface-bg)"
          strokeWidth={1.5}
        />
      ))}
      <line
        x1={x(x0)}
        y1={y(at(CLEAN, x0))}
        x2={x(x1)}
        y2={y(at(CLEAN, x1))}
        stroke="var(--viz-neutral-ink)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text
        x={x(x1) - 6}
        y={y(at(CLEAN, x1)) - 10}
        textAnchor="end"
        fontSize={11}
        fontFamily="var(--font-mono)"
        paintOrder="stroke"
        stroke="var(--surface-bg)"
        strokeWidth={4}
        fill="var(--viz-neutral-ink)"
      >
        honest trend
      </text>
      <line
        x1={x(x0)}
        y1={y(at(dragged, x0))}
        x2={x(x1)}
        y2={y(at(dragged, x1))}
        stroke="var(--viz-prediction)"
        strokeWidth={3}
      />
      <g opacity={t}>
        <line
          x1={px}
          y1={y(at(dragged, OUTLIER.size))}
          x2={px}
          y2={py}
          stroke="var(--viz-error)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          opacity={0.65}
        />
        <circle cx={px} cy={py} r={7} fill="var(--viz-error)" stroke="var(--surface-bg)" strokeWidth={2} />
        <PointRowLink
          point={[px, py]}
          card={[px + 48, py + 10]}
          cardWidth={152}
          cardHeight={48}
          kicker="row · provenance"
          lines={[`size ${OUTLIER.size} m² (typo)`, `price €${OUTLIER.price}k`]}
          tone="error"
          opacity={t}
        />
      </g>
    </g>
  );
}

export function TheDatasetHero() {
  const reduceMotion = usePrefersReducedMotion();
  const [t, setT] = useState(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      const id = requestAnimationFrame(() => setT(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      setT(easeProgress(now - start, MORPH_MS));
      if (now - start < MORPH_MS) raf = requestAnimationFrame(tick);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 280);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  const slopeDrop = `${CLEAN.slope.toFixed(1)} → ${DIRTY.slope.toFixed(1)}`;

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          A dataset is just a table
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          one bad row · slope {slopeDrop}
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <Plot
          width={1200}
          height={360}
          xDomain={X_DOMAIN}
          yDomain={Y_DOMAIN}
          ariaLabel={`Twelve houses scatter size against price along an upward trend (dashed). One mistyped row — a 112 m² flat recorded as 12 m² at a high price — drags the fitted line flat: its slope falls from ${CLEAN.slope.toFixed(1)} to ${DIRTY.slope.toFixed(1)}. A provenance lens tethers the outlier to its table row.`}
        >
          <HeroGraphic t={t} />
        </Plot>
      </div>
    </figure>
  );
}
