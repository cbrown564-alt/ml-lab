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
      <NextTokenLogits
        distribution={state.distribution}
        targetId={state.target.id}
        width={480}
        ariaLabel={`Check companion: ${mode.label}, mat probability ${state.targetProb.toFixed(3)}.`}
      />
    </figure>
  );
}
