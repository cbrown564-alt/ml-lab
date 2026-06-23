"use client";

import { useEffect, useState } from "react";
import { DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { chebMSE, predictCheb, ridgeFitCheb } from "@/lib/models/polynomial";
import { REG_DEGREE } from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";
import type { Point } from "@/lib/models/linear-regression";

/**
 * The specimen hero — regularisation as one dial on one model. The SAME
 * degree-12 model, fit two ways: with no penalty (λ≈0) it contorts through every
 * training point and flings between them (test error 0.43); with a penalty
 * (λ=0.3) the same model is pulled smooth and tracks the real shape (test 0.11).
 * Not a smaller model — the same one, reined in. Curves fade in on load.
 */

const TRAIN = fixtures.train as Point[];
const TEST = fixtures.test as Point[];
const PANELS = [
  { lambda: 1e-4, kicker: "no penalty (λ≈0) — overfits" },
  { lambda: 0.3, kicker: "penalised (λ=0.3) — smooth" },
].map((p) => {
  const model = ridgeFitCheb(TRAIN, REG_DEGREE, p.lambda);
  return { ...p, model, testErr: chebMSE(TEST, model) };
});

function TestPoints() {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {TEST.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r={3.5} fill="none" stroke="var(--viz-truth)" strokeWidth={1.25} strokeOpacity={0.55} />
      ))}
    </g>
  );
}

function Panel({ panel, reveal }: { panel: (typeof PANELS)[number]; reveal: number }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{panel.kicker}</span>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--viz-error-ink)" }}>
          test {panel.testErr.toFixed(2)}
        </span>
      </div>
      <Plot
        width={400}
        height={270}
        xDomain={[-0.02, 1.02]}
        yDomain={[-1.55, 1.55]}
        ariaLabel={`A degree-${REG_DEGREE} fit with ${panel.kicker}; test error ${panel.testErr.toFixed(2)} on held-out points.`}
      >
        <TestPoints />
        <g style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
          <PolyCurve predict={(xv) => predictCheb(panel.model, xv)} />
        </g>
        <DataPoints points={TRAIN} />
      </Plot>
    </div>
  );
}

export function RegularizationHero() {
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
          Overfitting &amp; regularisation
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          same model, penalty off vs on
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        {PANELS.map((panel) => (
          <Panel key={panel.lambda} panel={panel} reveal={reveal} />
        ))}
      </div>
    </figure>
  );
}
