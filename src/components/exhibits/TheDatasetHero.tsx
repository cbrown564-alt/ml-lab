"use client";

import { useEffect, useState } from "react";
import { Plot, usePlot } from "@/components/viz/Plot";
import { olsFit, type LinearParams } from "@/lib/models/linear-regression";
import { corruptedRows, houses, toPoints } from "@content/exhibits/the-dataset/experiment";

/**
 * The specimen hero — why "a dataset is just a table" matters. The twelve honest
 * houses set an upward size→price trend (the dashed reference). Then, on load, one
 * mistyped row drops in — a 112 m² flat fat-fingered to 12 m² — and the fitted line
 * visibly flattens toward it: the model only sees the table, so one bad row drags
 * the whole rule. Mechanism in the picture: leverage. Reduced motion renders it
 * already dragged. The honest trend stays on as the ghost it fell from.
 */

const CLEAN = olsFit(toPoints(houses));
const DIRTY = olsFit(toPoints([...houses, ...corruptedRows]));
const OUTLIER = corruptedRows[0];
const X_DOMAIN: [number, number] = [0, 132];
const Y_DOMAIN: [number, number] = [0, 400];

const at = (p: LinearParams, x: number) => p.slope * x + p.intercept;

function HeroGraphic({ t }: { t: number }) {
  const { x, y } = usePlot();
  const dragged: LinearParams = {
    slope: CLEAN.slope + (DIRTY.slope - CLEAN.slope) * t,
    intercept: CLEAN.intercept + (DIRTY.intercept - CLEAN.intercept) * t,
  };
  const [x0, x1] = X_DOMAIN;
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
      {/* The honest trend — the line the twelve good rows alone would draw. */}
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
        y={y(at(CLEAN, x1)) - 8}
        textAnchor="end"
        fontSize={12}
        fontFamily="var(--font-mono)"
        paintOrder="stroke"
        stroke="var(--surface-bg)"
        strokeWidth={3}
        fill="var(--viz-neutral-ink)"
      >
        the honest trend
      </text>
      {/* The dragged line — what the model actually fits once the bad row is in. */}
      <line
        x1={x(x0)}
        y1={y(at(dragged, x0))}
        x2={x(x1)}
        y2={y(at(dragged, x1))}
        stroke="var(--viz-prediction)"
        strokeWidth={3}
      />
      {/* The one mistyped row — high leverage at the left edge. */}
      <g opacity={t}>
        <circle
          cx={x(OUTLIER.size)}
          cy={y(OUTLIER.price)}
          r={7}
          fill="var(--viz-error)"
          stroke="var(--surface-bg)"
          strokeWidth={2}
        />
        <text
          x={x(OUTLIER.size) + 13}
          y={y(OUTLIER.price) + 4}
          fontSize={12}
          fontFamily="var(--font-mono)"
          paintOrder="stroke"
          stroke="var(--surface-bg)"
          strokeWidth={3}
          fill="var(--viz-error-ink)"
        >
          one mistyped row
        </text>
      </g>
    </g>
  );
}

export function TheDatasetHero() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setT(1));
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const DURATION = 1100;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / DURATION);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 360);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, []);

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
          ariaLabel={`Twelve houses scatter size against price along an upward trend (dashed). One mistyped row — a 112 m² flat recorded as 12 m² at a high price — drags the fitted line flat: its slope falls from ${CLEAN.slope.toFixed(1)} to ${DIRTY.slope.toFixed(1)}. The model only sees the table, so the single bad row moves the whole rule.`}
        >
          <HeroGraphic t={t} />
        </Plot>
      </div>
    </figure>
  );
}
