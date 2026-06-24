"use client";

import { useEffect, useState } from "react";
import { DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import {
  chebMSE,
  predictCheb,
  ridgeFitCheb,
  type ChebModel,
} from "@/lib/models/polynomial";
import { REG_DEGREE } from "@content/exhibits/overfitting-regularization/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";
import type { Point } from "@/lib/models/linear-regression";

/**
 * The specimen hero — regularisation as one dial on one model. The SAME
 * degree-12 model, fit two ways: with no penalty (λ≈0) it contorts through every
 * training point — train error ≈ 0 — yet flings between them and misses the
 * held-out points (test 0.43); with a penalty (λ=0.3) the same model is pulled
 * smooth, pays a little train error (0.01) and tracks the real shape (test 0.11).
 * Not a smaller model — the same one, reined in. Two bounded split-screen panels
 * (matching the neural-net hero) so the off-frame fling reads against a clean
 * frame; curves fade in on load.
 */

const TRAIN = fixtures.train as Point[];
const TEST = fixtures.test as Point[];
const PANELS = [
  { lambda: 1e-4, kicker: "no penalty (λ≈0) — overfits" },
  { lambda: 0.3, kicker: "penalised (λ=0.3) — smooth" },
].map((p) => {
  const model = ridgeFitCheb(TRAIN, REG_DEGREE, p.lambda);
  return {
    ...p,
    model,
    trainErr: chebMSE(TRAIN, model),
    testErr: chebMSE(TEST, model),
  };
});

/**
 * The framed plot interior + its contents, drawn from the live scales (so the
 * frame and the curve's clip always match Plot's margins). The bounding rect is
 * the same chrome the neural-net DecisionField uses; the curve is clipped to it
 * so an overfit fling stops cleanly at the frame instead of trailing into the
 * page. Test points sit under the curve; train points (the ones it fits) on top.
 */
function PanelBody({
  model,
  clipId,
  reveal,
}: {
  model: ChebModel;
  clipId: string;
  reveal: number;
}) {
  const { x, y } = usePlot();
  const [rxA, rxB] = x.range;
  const [ryBottom, ryTop] = y.range; // y range is inverted (pixel space)
  const fx = Math.min(rxA, rxB);
  const fy = Math.min(ryTop, ryBottom);
  const fw = Math.abs(rxB - rxA);
  const fh = Math.abs(ryBottom - ryTop);
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={fx} y={fy} width={fw} height={fh} />
        </clipPath>
      </defs>
      <rect
        x={fx}
        y={fy}
        width={fw}
        height={fh}
        fill="var(--surface-bg)"
        stroke="var(--line)"
      />
      {/* held-out checkpoints — under the curve, so the curve missing them reads */}
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
            strokeOpacity={0.5}
          />
        ))}
      </g>
      <g
        clipPath={`url(#${clipId})`}
        style={{ opacity: reveal, transition: "opacity 500ms ease" }}
      >
        <PolyCurve predict={(xv) => predictCheb(model, xv)} />
      </g>
      <DataPoints points={TRAIN} />
    </>
  );
}

function Panel({
  panel,
  clipId,
  reveal,
}: {
  panel: (typeof PANELS)[number];
  clipId: string;
  reveal: number;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="px-1 pb-1.5">
        <div className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          {panel.kicker}
        </div>
        <div className="mt-1 flex items-baseline gap-4 font-mono text-[11px] tabular-nums">
          <span style={{ color: "var(--viz-truth-ink)" }}>
            train error {panel.trainErr.toFixed(2)}
          </span>
          <span style={{ color: "var(--viz-error-ink)" }}>
            test error {panel.testErr.toFixed(2)}
          </span>
        </div>
      </div>
      <Plot
        width={400}
        height={270}
        xDomain={[-0.02, 1.02]}
        yDomain={[-1.55, 1.55]}
        ariaLabel={`A degree-${REG_DEGREE} fit, ${panel.kicker}: train error ${panel.trainErr.toFixed(2)} on the fitted points, test error ${panel.testErr.toFixed(2)} on held-out points.`}
      >
        <PanelBody model={panel.model} clipId={clipId} reveal={reveal} />
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
        {PANELS.map((panel, i) => (
          <Panel
            key={panel.lambda}
            panel={panel}
            clipId={`reg-clip-${i}`}
            reveal={reveal}
          />
        ))}
      </div>
      {/* Decode the two dot styles once for both panels — the train/test split is
          the whole mechanic, so it earns a line. */}
      <div className="flex items-center justify-center gap-6 border-t border-line px-3 py-2 font-mono text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden style={{ color: "var(--viz-truth)" }}>
            ●
          </span>
          train — the points it fits
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden style={{ color: "var(--viz-truth)" }}>
            ○
          </span>
          test — held-out, where error is judged
        </span>
      </div>
    </figure>
  );
}
