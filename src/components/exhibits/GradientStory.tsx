"use client";

import { useMemo } from "react";
import { GradientField } from "@/components/viz/GradientField";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { GradientFrame } from "@content/exhibits/the-gradient/spine";
import { gradient, magnitude, surface } from "@/lib/models/gradient";
import { defaultPoint } from "@content/exhibits/the-gradient/experiment";

/**
 * The See-it graphic: the landscape with the gradient arrow at the point the active
 * beat asserts — ascent on the climb beats, descent (−∇f) on the last. Non-interactive;
 * the bench is where the learner drags.
 */
export function GradientStory() {
  const frame = useActiveFrame<GradientFrame>();
  const point = frame?.point ?? defaultPoint;
  const descent = frame?.descent ?? false;
  const grad = useMemo(() => gradient(point.x, point.y), [point]);
  const mag = magnitude(grad);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {descent ? "Descent — the arrow flips to −∇f" : "Ascent — the gradient points uphill"}
      </figcaption>
      <GradientField point={point} descent={descent} interactive={false} width={560} height={470} />
      <div className="mt-4">
        <StatGrid
          caption={`At (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`}
          stats={[
            { label: "∇f", value: `(${grad.x.toFixed(2)}, ${grad.y.toFixed(2)})`, hue: "var(--viz-prediction-ink)", note: "the two partial slopes" },
            { label: "slope |∇f|", value: mag.toFixed(2), hue: "var(--viz-truth-ink)", note: "arrow length" },
            { label: "height f", value: surface(point.x, point.y).toFixed(2), hue: "var(--viz-neutral-ink)" },
          ]}
        />
      </div>
    </figure>
  );
}
