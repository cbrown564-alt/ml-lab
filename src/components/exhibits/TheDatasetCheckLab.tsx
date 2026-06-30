"use client";

import { useMemo, useState } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import { olsFit, predict, type LinearParams } from "@/lib/models/linear-regression";
import { corruptedRows, houses, toPoints } from "@content/exhibits/the-dataset/experiment";

/**
 * The Explain-it companion. Act continuity: this carries the SAME protagonist from
 * See/Run/Break — the houses scatter and the line fit through it — into the closing
 * act instead of swapping it for two number tiles.
 *
 * Toggle the mistyped row and it appears as a red, high-leverage point at the top-left;
 * the live fit (prediction blue) tilts off the true trend (dashed) toward it. Untick it
 * and the fit snaps back onto the trend. One bad row drags the whole line — shown, with
 * the slope and the 120 m² estimate beneath putting numbers on the damage.
 */
const CLEAN = olsFit(toPoints(houses));
const X_DOMAIN: [number, number] = [0, 132];
const Y_DOMAIN: [number, number] = [0, 400];
const at = (p: LinearParams, x: number) => p.slope * x + p.intercept;

function DatasetScene({ fit, included }: { fit: LinearParams; included: boolean }) {
  const { x, y } = usePlot();
  const [x0, x1] = X_DOMAIN;
  return (
    <g>
      {/* the true trend, a faint dashed reference the fit should sit on */}
      <line
        x1={x(x0)}
        y1={y(at(CLEAN, x0))}
        x2={x(x1)}
        y2={y(at(CLEAN, x1))}
        stroke="var(--viz-neutral-ink)"
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.5}
      />
      {/* the live fit — same prediction hue as Break it */}
      <line
        x1={x(x0)}
        y1={y(at(fit, x0))}
        x2={x(x1)}
        y2={y(at(fit, x1))}
        stroke="var(--viz-prediction)"
        strokeWidth={2.5}
        style={{ transition: "all var(--motion-move)" }}
      />
      {houses.map((h) => (
        <circle
          key={h.id}
          cx={x(h.size)}
          cy={y(h.price)}
          r={4.5}
          fill="var(--viz-truth)"
          stroke="var(--surface-bg)"
          strokeWidth={1}
        />
      ))}
      {included &&
        corruptedRows.map((h) => (
          <circle
            key={`bad-${h.id}`}
            cx={x(h.size)}
            cy={y(h.price)}
            r={6}
            fill="var(--viz-error)"
            stroke="var(--surface-bg)"
            strokeWidth={1.5}
          />
        ))}
    </g>
  );
}

export function TheDatasetCheckLab() {
  const [included, setIncluded] = useState(true);
  const fit = useMemo(
    () => olsFit(toPoints(included ? [...houses, ...corruptedRows] : houses)),
    [included],
  );
  const pred = Math.round(predict(fit, 120));

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          One bad row
        </span>
        <span className="hidden font-mono text-[11px] tracking-wide text-ink-faint uppercase sm:inline">
          dashed = true trend
        </span>
      </figcaption>
      <Plot
        width={520}
        height={360}
        xDomain={X_DOMAIN}
        yDomain={Y_DOMAIN}
        ariaLabel={`Twelve houses scatter size against price along the true trend (dashed). ${
          included
            ? `With the mistyped row included, the fit flattens to slope ${fit.slope.toFixed(
                1,
              )} and the 120 m² estimate craters to £${pred}k.`
            : `Without it, the fit recovers to slope ${fit.slope.toFixed(1)}.`
        }`}
      >
        <Axes />
        <DatasetScene fit={fit} included={included} />
      </Plot>
      <label className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-sunken p-3 text-sm">
        <input
          type="checkbox"
          checked={included}
          onChange={(e) => setIncluded(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        <span className="text-ink">Include the mistyped row</span>
      </label>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
            price/m² slope
          </dt>
          <dd
            className="mt-0.5 font-mono text-lg"
            style={{ color: included ? "var(--viz-error-ink)" : "var(--accent)" }}
          >
            {fit.slope.toFixed(1)}
          </dd>
          <dd className="text-[11px] text-ink-faint">true ≈ {CLEAN.slope.toFixed(1)}</dd>
        </div>
        <div className="rounded-lg border border-line p-3">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
            120 m² estimate
          </dt>
          <dd
            className="mt-0.5 font-mono text-lg"
            style={{ color: included ? "var(--viz-error-ink)" : "var(--accent)" }}
          >
            £{pred}k
          </dd>
          <dd className="text-[11px] text-ink-faint">true ≈ £{Math.round(predict(CLEAN, 120))}k</dd>
        </div>
      </dl>
    </figure>
  );
}
