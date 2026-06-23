"use client";

import { useEffect, useMemo, useState } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { accuracy, boundaryX2, fitLogistic, type LogisticParams } from "@/lib/models/logistic";
import { biasedTrainingSet, whatIsMlData } from "@content/exhibits/what-is-ml/experiment";

/**
 * The interactive "Break it": the machine learns whatever is in the examples — bias and
 * all. The training data carries a systematic labelling error in the upper region; raise
 * the bias and the model faithfully learns the skewed rule, its boundary drifting up and
 * away from the truth. It looks fine on its own biased data, but on the real population it
 * misjudges more and more. Garbage in, garbage out — the fix is the data, not the model.
 */
const DOMAIN: [number, number] = [-3, 3];
const clampD = (v: number) => Math.max(DOMAIN[0], Math.min(DOMAIN[1], v));
const OVERFIT_OK = 0.9;
const BROKEN_BELOW = 0.8;

function Graphic({ learned }: { learned: LogisticParams }) {
  const { x, y } = usePlot();
  return (
    <g>
      {whatIsMlData.map((p, i) => {
        const wrong = (learned.b + learned.w1 * p.x1 + learned.w2 * p.x2 > 0 ? 1 : 0) !== p.y;
        return <circle key={i} cx={x(p.x1)} cy={y(p.x2)} r={5} fill={p.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"} stroke={wrong ? "var(--viz-error)" : "var(--surface-bg)"} strokeWidth={wrong ? 2 : 1} />;
      })}
      <line x1={x(DOMAIN[0])} y1={y(clampD(boundaryX2(learned, DOMAIN[0])))} x2={x(DOMAIN[1])} y2={y(clampD(boundaryX2(learned, DOMAIN[1])))} stroke="var(--accent)" strokeWidth={3} />
    </g>
  );
}

export function WhatIsMlBreakIt() {
  const [bias, setBias] = useState(0.55);
  const [hasSeen, setHasSeen] = useState(false);

  const learned = useMemo(() => fitLogistic(biasedTrainingSet(bias)), [bias]);
  const trueAcc = accuracy(whatIsMlData, learned);
  const trainAcc = accuracy(biasedTrainingSet(bias), learned);

  const broken = trueAcc < BROKEN_BELOW;
  if (broken && !hasSeen) setHasSeen(true);
  useEffect(() => {
    if (hasSeen) reportTaskEvent("what-is-ml:biased-data");
  }, [hasSeen]);
  const repaired = hasSeen && trueAcc > OVERFIT_OK;

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          {repaired ? (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
              <p className="mt-2 leading-relaxed text-ink">
                Clean, representative labels and the machine learns the <span className="font-medium text-accent">real rule</span> — the
                boundary sits where the truth is, and it judges the whole population well.
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Boundary:</span> the algorithm never
                changed — only the data did. No clever model fixes biased examples; the work
                is in collecting representative, correctly-labelled data.
              </p>
            </div>
          ) : broken ? (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
              <p className="mt-2 leading-relaxed text-ink">
                The upper examples were mislabelled, and the machine <span className="font-medium text-[var(--viz-error-ink)]">learned the bias</span>:
                its boundary drifts up, away from the truth. It still scores{" "}
                <span className="font-mono">{Math.round(trainAcc * 100)}%</span> on its own biased data — but on the real population
                it&apos;s down to <span className="font-mono text-[var(--viz-error-ink)]">{Math.round(trueAcc * 100)}%</span>.
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Diagnose:</span> the model has no way
                to know the labels were wrong — it faithfully reproduces whatever pattern is
                in the data. <span className="font-medium text-ink">Repair:</span> turn the
                bias down — fix the data, not the model.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Settling</p>
              <p className="mt-2 leading-relaxed text-ink">Between honest and biased data. Push the bias up to mislead it, down to fix it.</p>
            </div>
          )}

          <div className="rounded-lg border border-line bg-sunken p-4">
            <label className="flex items-center justify-between text-sm text-ink-muted">
              <span>Label bias in the collected data</span>
              <span className="font-mono tabular-nums text-ink">{Math.round(bias * 100)}%</span>
            </label>
            <input
              type="range"
              aria-label="Fraction of upper-region examples mislabelled"
              min={0}
              max={1}
              step={0.05}
              value={bias}
              onChange={(e) => {
                whenHydrated(() => useLearner.getState().recordPractice("what-is-ml"));
                setBias(Number(e.target.value));
              }}
              className="mt-2 w-full accent-[var(--accent)]"
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-line p-3">
              <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">on its biased data</dt>
              <dd className="mt-0.5 font-mono text-lg text-ink">{Math.round(trainAcc * 100)}%</dd>
            </div>
            <div className="rounded-lg border border-line p-3">
              <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">on the true population</dt>
              <dd className="mt-0.5 font-mono text-lg" style={{ color: broken ? "var(--viz-error-ink)" : "var(--accent)" }}>{Math.round(trueAcc * 100)}%</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot width={520} height={440} xDomain={[-3.2, 3.2]} yDomain={[-3.2, 3.2]} ariaLabel={`The true population coloured by real class, with the rule the machine learned from biased data. It scores ${Math.round(trueAcc * 100)}% on the true population; red-ringed points are the ones it now gets wrong.`}>
            <Axes />
            <Graphic learned={learned} />
          </Plot>
          <p className="mt-2 text-sm leading-relaxed text-ink-faint">
            Points are coloured by their true class; the teal line is the rule learned from
            the biased examples. As the bias rises it drifts up and the red rings — the
            people it now misjudges — multiply.
          </p>
        </div>
      </div>
    </div>
  );
}
