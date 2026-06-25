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
 * the whole rule. A provenance lens tethers the outlier point to its table row so
 * leverage reads as a data-entry mistake, not a stray dot. Reduced motion renders
 * it already dragged.
 */

const CLEAN = olsFit(toPoints(houses));
const DIRTY = olsFit(toPoints([...houses, ...corruptedRows]));
const OUTLIER = corruptedRows[0];
const X_DOMAIN: [number, number] = [0, 132];
const Y_DOMAIN: [number, number] = [0, 400];

const at = (p: LinearParams, x: number) => p.slope * x + p.intercept;

/** ProvenancePipe — tether + lens linking the scatter point to its table row. */
function ProvenanceLens({ t }: { t: number }) {
  const { x, y } = usePlot();
  const px = x(OUTLIER.size);
  const py = y(OUTLIER.price);
  const lx = px + 52;
  const ly = py - 38;
  return (
    <g opacity={t} aria-hidden>
      <line
        x1={px}
        y1={py}
        x2={lx - 8}
        y2={ly + 22}
        stroke="var(--viz-error)"
        strokeWidth={1.5}
        strokeDasharray="5 4"
        opacity={0.75}
      />
      <rect
        x={lx}
        y={ly}
        width={148}
        height={52}
        rx={6}
        fill="var(--surface-bg)"
        stroke="var(--viz-error)"
        strokeWidth={1.25}
        opacity={0.95}
      />
      <text x={lx + 8} y={ly + 16} fontSize={10} fontFamily="var(--font-mono)" fill="var(--viz-error-ink)" fontWeight={600}>
        row · provenance
      </text>
      <text x={lx + 8} y={ly + 30} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
        size {OUTLIER.size} m² (typo)
      </text>
      <text x={lx + 8} y={ly + 42} fontSize={10} fontFamily="var(--font-mono)" fill="var(--viz-truth-ink)">
        price €{OUTLIER.price}k
      </text>
    </g>
  );
}

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
          x1={x(OUTLIER.size)}
          y1={y(at(dragged, OUTLIER.size))}
          x2={x(OUTLIER.size)}
          y2={y(OUTLIER.price)}
          stroke="var(--viz-error)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          opacity={0.6}
        />
        <circle
          cx={x(OUTLIER.size)}
          cy={y(OUTLIER.price)}
          r={7}
          fill="var(--viz-error)"
          stroke="var(--surface-bg)"
          strokeWidth={2}
        />
        <ProvenanceLens t={t} />
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
          ariaLabel={`Twelve houses scatter size against price along an upward trend (dashed). One mistyped row — a 112 m² flat recorded as 12 m² at a high price — drags the fitted line flat: its slope falls from ${CLEAN.slope.toFixed(1)} to ${DIRTY.slope.toFixed(1)}. A provenance lens tethers the outlier to its table row.`}
        >
          <HeroGraphic t={t} />
        </Plot>
      </div>
    </figure>
  );
}
