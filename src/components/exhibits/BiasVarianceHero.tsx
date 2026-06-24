"use client";

import { useEffect, useState } from "react";
import { DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { polyMSE, predictPoly, ridgeFit } from "@/lib/models/polynomial";
import fixtures from "@/lib/models/fixtures/polynomial.json";
import type { Point } from "@/lib/models/linear-regression";

/**
 * The specimen hero — the bias-variance tradeoff as the same data fit three ways.
 * Too stiff (degree 1) misses the shape and the held-out points alike; about right
 * (degree 4) threads both; too flexible (degree 12) contorts through every training
 * point and flings wild between them, so its honest test error explodes. The test
 * error under each panel traces the U — high, low, high. The curves draw in on load.
 * Reduced motion renders them already drawn.
 */

const TRAIN = fixtures.train as Point[];
const TEST = fixtures.test as Point[];
const PANELS = [
  { degree: 1, kicker: "too stiff — underfits" },
  { degree: 4, kicker: "about right" },
  { degree: 12, kicker: "too flexible — overfits" },
].map((p) => {
  const w = ridgeFit(TRAIN, p.degree, 0);
  return { ...p, w, testErr: polyMSE(TEST, w) };
});

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

function Panel({ panel, reveal }: { panel: (typeof PANELS)[number]; reveal: number }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          deg {panel.degree} · {panel.kicker}
        </span>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--viz-error-ink)" }}>
          test {panel.testErr.toFixed(2)}
        </span>
      </div>
      <Plot
        width={400}
        height={270}
        xDomain={[-0.02, 1.02]}
        yDomain={[-1.55, 1.55]}
        ariaLabel={`A degree-${panel.degree} polynomial fit (${panel.kicker}); test error ${panel.testErr.toFixed(2)} on held-out points.`}
      >
        <TestPoints />
        <g style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
          <PolyCurve predict={(xv) => predictPoly(panel.w, xv)} />
        </g>
        <DataPoints points={TRAIN} />
      </Plot>
    </div>
  );
}

export function BiasVarianceHero() {
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
          The bias–variance tradeoff
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          same data, three fits · test error U
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        {PANELS.map((panel) => (
          <Panel key={panel.degree} panel={panel} reveal={reveal} />
        ))}
      </div>
    </figure>
  );
}
