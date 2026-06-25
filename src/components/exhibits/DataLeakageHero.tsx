"use client";

import { useEffect, useState } from "react";
import { DataLeakageProvenancePipe } from "@/components/exhibits/DataLeakageProvenancePipe";
import { crossValR2, type Matrix } from "@/lib/models/leakage";
import fixtures from "@/lib/models/fixtures/leakage.json";

/**
 * The specimen hero — the provenance pipe with a breached train/test wall. On load
 * forbidden test-side information visibly crosses back into feature selection and
 * the CV score inflates; the honest seal (not shown here) would read ~0 on the same
 * noise. One unmistakable frame: the leak is the picture, not a twin scatterplot.
 */

const X = fixtures.X as Matrix;
const Y = fixtures.y as number[];
const { kSelect: K, folds: FOLDS } = fixtures.generator;
const LEAKED = crossValR2(X, Y, K, FOLDS, true);

export function DataLeakageHero() {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 320);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Data leakage
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          test rows peek · score inflates
        </span>
      </figcaption>
      <div className="px-4 py-4">
        <DataLeakageProvenancePipe leaky r2={LEAKED.meanR2} reveal={reveal} />
        <p className="mt-3 px-1 text-xs leading-snug text-ink-muted">
          Feature selection used every row — including held-out folds. The pipe looks
          successful; the R² measures the peek, not skill.
        </p>
      </div>
    </figure>
  );
}
