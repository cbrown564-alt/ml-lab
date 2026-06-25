"use client";

import { useEffect, useMemo, useState } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { PointRowLink } from "@/components/viz/primitives/PointRowLink";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { olsFit, predict } from "@/lib/models/linear-regression";
import { corruptedRows, houses, toPoints } from "@content/exhibits/the-dataset/experiment";

/**
 * The interactive "Break it": one bad row dominates. A single mistyped house — a 112 m²
 * flat recorded as 12 m² — sits at the left edge with high leverage, and including it
 * flattens the entire least-squares trend. Provenance tether links the scatter point to
 * its table row so the bad datum is traceable, not just highlighted.
 */
const CLEAN = olsFit(toPoints(houses));
const BAD_ROW = corruptedRows[0];
const X0 = 0;
const X1 = 130;
const QUERY = 120;

function Lines({ fit }: { fit: { slope: number; intercept: number } }) {
  const { x, y } = usePlot();
  return (
    <g>
      <line
        x1={x(X0)}
        y1={y(CLEAN.slope * X0 + CLEAN.intercept)}
        x2={x(X1)}
        y2={y(CLEAN.slope * X1 + CLEAN.intercept)}
        stroke="var(--viz-neutral-ink)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        opacity={0.5}
      />
      <line
        x1={x(X0)}
        y1={y(fit.slope * X0 + fit.intercept)}
        x2={x(X1)}
        y2={y(fit.slope * X1 + fit.intercept)}
        stroke="var(--viz-prediction)"
        strokeWidth={3}
      />
    </g>
  );
}

function Points({ included, fit }: { included: boolean; fit: { slope: number; intercept: number } }) {
  const { x, y } = usePlot();
  const px = x(BAD_ROW.size);
  const py = y(BAD_ROW.price);
  const fittedY = fit.slope * BAD_ROW.size + fit.intercept;

  return (
    <g>
      {houses.map((h) => (
        <circle key={h.id} cx={x(h.size)} cy={y(h.price)} r={5} fill="var(--viz-truth)" stroke="var(--surface-bg)" strokeWidth={1.5} />
      ))}
      {included && (
        <>
          <line
            x1={px}
            y1={py}
            x2={px}
            y2={y(fittedY)}
            stroke="var(--viz-error)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <circle cx={px} cy={py} r={7} fill="var(--viz-error)" stroke="var(--surface-bg)" strokeWidth={1.5} />
          <PointRowLink
            point={[px, py]}
            card={[px + 52, py - 48]}
            cardWidth={156}
            cardHeight={48}
            kicker="row · bad datum"
            lines={[`size ${BAD_ROW.size} m² (typo)`, `price €${BAD_ROW.price}k`]}
            tone="error"
          />
        </>
      )}
    </g>
  );
}

export function TheDatasetBreakIt() {
  const [included, setIncluded] = useState(true);
  const [hasSeen, setHasSeen] = useState(false);

  const fit = useMemo(() => olsFit(toPoints(included ? [...houses, ...corruptedRows] : houses)), [included]);
  const pred = predict(fit, QUERY);
  const cleanPred = predict(CLEAN, QUERY);

  const broken = included;
  if (broken && !hasSeen) setHasSeen(true);
  useEffect(() => {
    if (hasSeen) reportTaskEvent("the-dataset:outlier");
  }, [hasSeen]);
  const repaired = hasSeen && !included;

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          {repaired ? (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
              <p className="mt-2 leading-relaxed text-ink">
                Drop the one bad row and the trend <span className="font-medium text-accent">snaps back</span> — the line returns to the
                real price-per-m², and the 120 m² estimate is sensible again.
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Boundary:</span> not every outlier is
                an error — a genuinely unusual house is real data to keep. The skill is
                telling a typo from a true extreme, which means knowing your data.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
              <p className="mt-2 leading-relaxed text-ink">
                One mistyped row — a 112 m² flat recorded as 12 m² — sits at the edge and{" "}
                <span className="font-medium text-[var(--viz-error-ink)]">flattens the whole trend</span>. The line tips toward that one
                point, and now a 120 m² house is valued at{" "}
                <span className="font-mono text-[var(--viz-error-ink)]">£{Math.round(pred)}k</span> instead of{" "}
                <span className="font-mono text-accent">£{Math.round(cleanPred)}k</span>.
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Diagnose:</span> the model can&apos;t
                tell a typo from a fact — it honours every row equally.{" "}
                <span className="font-medium text-ink">Repair:</span> find and drop the bad
                row. Fix the data, not the model.
              </p>
            </div>
          )}

          <label className="flex items-center gap-3 rounded-lg border border-line bg-sunken p-4 text-sm">
            <input
              type="checkbox"
              checked={included}
              onChange={(e) => {
                whenHydrated(() => useLearner.getState().recordPractice("the-dataset"));
                setIncluded(e.target.checked);
              }}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span className="text-ink">Include the flawed row in the dataset</span>
          </label>

          {included && (
            <div className="overflow-hidden rounded-lg border border-[var(--viz-error)]/40">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="bg-[var(--viz-error)]/10 text-left font-mono text-[10px] tracking-wide text-[var(--viz-error-ink)] uppercase">
                    <th className="px-3 py-2 font-normal">#</th>
                    <th className="px-3 py-2 font-normal">size</th>
                    <th className="px-3 py-2 font-normal">beds</th>
                    <th className="px-3 py-2 font-normal">price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--viz-error)]/30 bg-[var(--viz-error)]/8">
                    <td className="px-3 py-1.5 font-mono text-ink-faint">{BAD_ROW.id}</td>
                    <td className="px-3 py-1.5 font-medium text-[var(--viz-error-ink)]">{BAD_ROW.size} m² ← typo</td>
                    <td className="px-3 py-1.5">{BAD_ROW.bedrooms}</td>
                    <td className="px-3 py-1.5">{BAD_ROW.price}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg border border-line p-3">
              <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">price/m² slope</dt>
              <dd className="mt-0.5 font-mono text-lg" style={{ color: broken ? "var(--viz-error-ink)" : "var(--accent)" }}>
                {fit.slope.toFixed(1)}
              </dd>
              <dd className="text-[11px] text-ink-faint">clean ≈ {CLEAN.slope.toFixed(1)}</dd>
            </div>
            <div className="rounded-lg border border-line p-3">
              <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">120 m² estimate</dt>
              <dd className="mt-0.5 font-mono text-lg" style={{ color: broken ? "var(--viz-error-ink)" : "var(--accent)" }}>
                £{Math.round(pred)}k
              </dd>
              <dd className="text-[11px] text-ink-faint">clean ≈ £{Math.round(cleanPred)}k</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 lg:mt-0">
          <Plot
            width={520}
            height={420}
            xDomain={[X0, X1]}
            yDomain={[60, 400]}
            ariaLabel={`House size vs price with the least-squares trend. ${included ? "Including the mistyped 12 m² / £360k row flattens the line: a 120 m² house is valued at" : "With the bad row removed, a 120 m² house is valued at"} £${Math.round(pred)}k (clean trend £${Math.round(cleanPred)}k). The dashed line is the clean trend for reference.`}
          >
            <Axes />
            <Lines fit={fit} />
            <Points included={included} fit={fit} />
          </Plot>
        </div>
      </div>
    </div>
  );
}
