"use client";

import { useState } from "react";
import { ConvField } from "@/components/viz/ConvField";
import { convState, slideParam } from "@content/exhibits/cnns/experiment";

const STAGES = [
  { id: "horizontal", label: "Horiz. stripes", imageIndex: 0, filterIndex: 1 },
  { id: "vertical", label: "Vert. stripes", imageIndex: 1, filterIndex: 0 },
  { id: "corner", label: "Corner", imageIndex: 2, filterIndex: 0 },
] as const;

export function CnnsCheckLab() {
  const [stageId, setStageId] = useState<(typeof STAGES)[number]["id"]>("horizontal");
  const stage = STAGES.find((entry) => entry.id === stageId)!;
  // Match hero/lab default (slide 14 → cell (2,2) fires 2.10). Slide 17 was a
  // zero cell and contradicted the shaded feature map under Explain it.
  const state = convState(stage.imageIndex, stage.filterIndex, slideParam.default);

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        Same filter idea, three grids
      </figcaption>
      <div
        role="group"
        aria-label="CNN regime"
        className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs"
      >
        {STAGES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={stageId === entry.id}
            onClick={() => setStageId(entry.id)}
            className={`rounded-full px-3 py-1 transition-colors ${
              stageId === entry.id ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <p className="mb-3 text-sm text-ink-muted">
        Mass {state.mass.toFixed(2)} · shared params {state.convParams}
      </p>
      <ConvField
        image={state.image}
        filter={state.filter}
        featureMap={state.featureMap}
        highlightRow={state.row}
        highlightCol={state.col}
        width={480}
        height={220}
        ariaLabel={`Check lab companion showing ${stage.label}.`}
      />
    </figure>
  );
}
