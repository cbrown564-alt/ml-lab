"use client";

import { useState } from "react";
import { NextTokenLogits } from "@/components/viz/NextTokenLogits";
import { transformerLabState } from "@content/exhibits/the-transformer/experiment";

const MODES = [
  { id: "one", label: "1 block", blockIndex: 1, temperatureTimesTen: 10 },
  { id: "two", label: "2 blocks", blockIndex: 2, temperatureTimesTen: 10 },
] as const;

export function TransformerCheckLab() {
  const [modeId, setModeId] = useState<(typeof MODES)[number]["id"]>("one");
  const mode = MODES.find((entry) => entry.id === modeId)!;
  const state = transformerLabState(mode.blockIndex, mode.temperatureTimesTen, 5);
  const oneBlockProb = transformerLabState(1, 10, 5).targetProb;
  const twoBlockProb = transformerLabState(2, 10, 5).targetProb;

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        stack depth vs P(mat)
      </figcaption>
      <div
        role="group"
        aria-label="Block count"
        className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs"
      >
        {MODES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={modeId === entry.id}
            onClick={() => setModeId(entry.id)}
            className={`rounded-full px-3 py-1 transition-colors ${
              modeId === entry.id ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {MODES.map((entry) => {
          const prob = entry.id === "one" ? oneBlockProb : twoBlockProb;
          const active = entry.id === modeId;
          return (
            <div
              key={entry.id}
              className={`rounded-lg border px-3 py-2 ${active ? "border-[color-mix(in_srgb,var(--accent)_40%,var(--line))] bg-sunken" : "border-line"}`}
            >
              <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
                {entry.label}
              </div>
              <div
                className={`mt-0.5 font-mono text-lg tabular-nums ${active ? "text-[var(--viz-prediction-ink)]" : "text-ink-muted"}`}
              >
                {prob.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>
      <NextTokenLogits
        distribution={state.distribution}
        targetId={state.target.id}
        width={640}
        size="lg"
        ariaLabel={`Check companion: ${mode.label}, mat probability ${state.targetProb.toFixed(3)}.`}
      />
    </figure>
  );
}
