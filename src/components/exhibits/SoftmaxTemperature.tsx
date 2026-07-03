"use client";

import { useState } from "react";
import { attentionHeads, attentionTokens, softmaxRow } from "@/lib/models/attention";

const SYNTAX_HEAD = attentionHeads[0]!;
const QUERY_INDEX = 2; // sat — the exhibit's committed query row

/**
 * Live consequence for the scaled-dot-product section: rescale the committed
 * sat-row scores and watch softmax redistribute the routing. At τ=1 this is
 * exactly the exhibit's committed route (cat 0.63); large τ flattens toward the
 * uniform 0.17 row the Break-it stage diagnoses.
 */
export function SoftmaxTemperature() {
  const [tempTimesTen, setTempTimesTen] = useState(10);
  const tau = tempTimesTen / 10;
  const logits = SYNTAX_HEAD.logits[QUERY_INDEX]!;
  const weights = softmaxRow(logits.map((v) => v / (Math.sqrt(SYNTAX_HEAD.dK) * tau)));
  const peak = Math.max(...weights);

  return (
    <div className="rounded-lg border border-line bg-sunken p-4">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor="softmax-temperature" className="text-sm font-medium text-ink">
          Score scale τ · query sat
        </label>
        <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">
          {tau.toFixed(1)}
        </span>
      </div>
      <input
        id="softmax-temperature"
        type="range"
        min={5}
        max={40}
        step={1}
        value={tempTimesTen}
        onChange={(e) => setTempTimesTen(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--accent)]"
        aria-label="Softmax score scale for the sat query row"
      />
      <div className="mt-4 flex flex-col gap-1.5">
        {attentionTokens.map((token, index) => {
          const weight = weights[index] ?? 0;
          const top = weight === peak;
          return (
            <div
              key={token.id}
              className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-2"
            >
              <span
                className={`font-mono text-xs ${top ? "font-semibold text-[var(--viz-prediction-ink)]" : "text-ink-muted"}`}
              >
                {token.label}
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full bg-[var(--viz-prediction)]"
                  style={{ width: `${Math.max(3, weight * 100)}%`, opacity: top ? 1 : 0.6 }}
                />
              </div>
              <span className="font-mono text-[11px] tabular-nums text-ink-muted">
                {weight.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        {tau <= 1.1 && tau >= 0.9
          ? "τ = 1.0 is the committed route — cat carries 0.63."
          : tau > 2.5
            ? "Scores flattened — every key drifts toward uniform 0.17, the Break-it failure."
            : tau < 0.9
              ? "Sharper scores — the softmax concentrates almost everything on cat."
              : "Softmax renormalises the whole row every time one score moves."}
      </p>
    </div>
  );
}
