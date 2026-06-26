"use client";

import { useMemo, useState } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import {
  accuracy,
  boundaryX2,
  fitLogistic,
  proba,
  type LogisticParams,
} from "@/lib/models/logistic";
import { biasedTrainingSet, whatIsMlData } from "@content/exhibits/what-is-ml/experiment";

/**
 * The Explain-it companion. Act continuity: this renders the SAME protagonist the
 * learner met in See/Run/Break — the two-class scatter and the learned boundary —
 * carried into the closing act rather than swapped for an abstract metric strip.
 *
 * Raise the label bias and the boundary (fit on the biased labels) tilts off the true
 * split: it still scores high on its own data, but red rings bloom over the true
 * population it now mislabels. Bias in, bias out, shown on the live scene — the two
 * tiles below just put a number on the gap the checks ask you to read.
 */
const DOMAIN: [number, number] = [-2.9, 2.9];
const clampDom = (v: number) => Math.max(DOMAIN[0], Math.min(DOMAIN[1], v));

function PopulationScene({ learned }: { learned: LogisticParams }) {
  const { x, y } = usePlot();
  const by0 = boundaryX2(learned, DOMAIN[0]);
  const by1 = boundaryX2(learned, DOMAIN[1]);
  return (
    <g>
      {Number.isFinite(by0) && Number.isFinite(by1) && (
        <line
          x1={x(DOMAIN[0])}
          y1={y(clampDom(by0))}
          x2={x(DOMAIN[1])}
          y2={y(clampDom(by1))}
          stroke="var(--accent)"
          strokeWidth={3}
          style={{ transition: "all var(--motion-move)" }}
        />
      )}
      {whatIsMlData.map((p, i) => {
        const wrong = (proba(learned, p.x1, p.x2) > 0.5 ? 1 : 0) !== p.y;
        return (
          <circle
            key={i}
            cx={x(p.x1)}
            cy={y(p.x2)}
            r={5}
            fill={p.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"}
            stroke={wrong ? "var(--viz-error)" : "var(--surface-bg)"}
            strokeWidth={wrong ? 2.5 : 1}
          />
        );
      })}
    </g>
  );
}

export function WhatIsMlCheckLab() {
  const [bias, setBias] = useState(0.5);
  const learned = useMemo(() => fitLogistic(biasedTrainingSet(bias)), [bias]);
  const tr = Math.round(accuracy(biasedTrainingSet(bias), learned) * 100);
  const pop = Math.round(accuracy(whatIsMlData, learned) * 100);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Bias in, bias out
        </span>
        <span className="hidden font-mono text-[11px] tracking-wide text-ink-faint uppercase sm:inline">
          true population · boundary from biased labels
        </span>
      </figcaption>
      <Plot
        width={520}
        height={400}
        xDomain={DOMAIN}
        yDomain={DOMAIN}
        ariaLabel={`The two-class population with the boundary learned from ${Math.round(
          bias * 100,
        )}% mislabelled examples. It scores ${tr}% on that biased data but ${pop}% on the true population; red-ringed points are the ones it now mislabels.`}
      >
        <Axes />
        <PopulationScene learned={learned} />
      </Plot>
      <div className="mt-4 rounded-lg border border-line bg-sunken p-3">
        <label className="flex items-center justify-between text-sm text-ink-muted">
          <span>label bias</span>
          <span className="font-mono tabular-nums text-ink">{Math.round(bias * 100)}%</span>
        </label>
        <input
          type="range"
          aria-label="Fraction of examples mislabelled"
          min={0}
          max={1}
          step={0.05}
          value={bias}
          onChange={(e) => setBias(Number(e.target.value))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
            on its data
          </dt>
          <dd className="mt-0.5 font-mono text-lg text-ink">{tr}%</dd>
          <dd className="text-[11px] text-ink-faint">looks fine</dd>
        </div>
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
            true population
          </dt>
          <dd
            className="mt-0.5 font-mono text-lg"
            style={{ color: pop < 80 ? "var(--viz-error-ink)" : "var(--accent)" }}
          >
            {pop}%
          </dd>
          <dd className="text-[11px] text-ink-faint">the real test</dd>
        </div>
      </dl>
    </figure>
  );
}
