"use client";

import { useMemo, useState } from "react";
import { GradientField } from "@/components/viz/GradientField";
import { gradient, magnitude, surface, type Vec2 } from "@/lib/models/gradient";
import { defaultPoint } from "@content/exhibits/the-gradient/experiment";

/**
 * The Explain-it companion: the landscape with a draggable point, so the checks can be
 * answered against the live arrow — its direction (uphill, perpendicular to the bands)
 * and its length (the slope, vanishing at a peak).
 */
export function GradientCheckLab() {
  const [point, setPoint] = useState<Vec2>(defaultPoint);
  const grad = useMemo(() => gradient(point.x, point.y), [point]);
  const mag = magnitude(grad);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">Drag to read the arrow</figcaption>
      <GradientField point={point} onMove={setPoint} width={360} height={300} />
      <p className="mt-3 font-mono text-xs text-ink-faint tabular-nums">
        slope |∇f| {mag.toFixed(2)} · height {surface(point.x, point.y).toFixed(2)} · {mag < 0.05 ? "≈ a summit (∇f→0)" : "on a slope"}
      </p>
    </figure>
  );
}
