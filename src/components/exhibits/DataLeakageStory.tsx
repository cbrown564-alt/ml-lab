"use client";

import { useMemo } from "react";
import { DataLeakageProvenancePipe } from "@/components/exhibits/DataLeakageProvenancePipe";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { DataLeakageFrame } from "@content/exhibits/data-leakage/spine";
import { crossValR2, type Matrix } from "@/lib/models/leakage";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * The See-it graphic: the provenance pipe at the pipeline the active beat asserts —
 * leaky (breached wall, false R²) until the reveal, then honest (sealed wall, ~0).
 */

const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;

export function DataLeakageStory() {
  const frame = useActiveFrame<DataLeakageFrame>();
  const leaky = frame?.mode !== "honest";
  const cur = useMemo(() => crossValR2(X, Y, K, FOLDS, leaky), [leaky]);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 self-start font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {leaky ? "Wall breached — selection peeked at test folds" : "Wall sealed — selection inside each fold"}
      </figcaption>
      <DataLeakageProvenancePipe leaky={leaky} r2={cur.meanR2} />
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        {leaky
          ? "The forbidden back-flow is the mechanism: test rows informed which features were chosen, so cross-validation never truly held them out."
          : "Seal the boundary and the score collapses — same noise, honest pipeline, R² ≈ 0."}
      </p>
    </figure>
  );
}
