"use client";

import { useEffect, useState } from "react";
import { ConvField } from "@/components/viz/ConvField";
import { convState } from "@content/exhibits/cnns/experiment";

/** Thesis frame: horizontal stripes, vertical-edge filter, slide 14 — a firing cell (2.10). */
export function CnnsHero() {
  const [reveal, setReveal] = useState(0);
  const state = convState(0, 1, 14);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 260);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          convolution
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          one 3×3 filter sliding across an 8×8 grid
        </span>
      </figcaption>
      <div className="px-3 py-3" style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
        <ConvField
          image={state.image}
          filter={state.filter}
          featureMap={state.featureMap}
          highlightRow={state.row}
          highlightCol={state.col}
          width={360}
          height={220}
          ariaLabel="An 8 by 8 grid with a 3 by 3 vertical-edge filter at the centre producing a 6 by 6 feature map."
        />
      </div>
    </figure>
  );
}
