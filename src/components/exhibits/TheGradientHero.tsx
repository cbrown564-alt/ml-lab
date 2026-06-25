"use client";

import { useState } from "react";
import { GradientField } from "@/components/viz/GradientField";
import { gradient, magnitude } from "@/lib/models/gradient";

/**
 * The specimen hero — the gradient as the arrow of steepest ascent. A draggable
 * ProbeLens reveals the tangent-plane gradient decomposed into x and y components;
 * the RepresentationPortal links the 2-D landscape to its component readouts.
 */

const INIT = { x: 0.4, y: 1.0 };

export function TheGradientHero() {
  const [point, setPoint] = useState(INIT);
  const g = gradient(point.x, point.y);
  const slope = magnitude(g);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The gradient
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          drag probe · ∂f/∂x {g.x.toFixed(2)} · ∂f/∂y {g.y.toFixed(2)}
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <GradientField
          point={point}
          onMove={setPoint}
          descent={false}
          interactive
          xDomain={[-5.7, 5.7]}
          yDomain={[-2, 2]}
          width={1200}
          height={420}
        />
        <div className="mt-2 flex flex-wrap items-center gap-4 px-1 font-mono text-[11px] tabular-nums">
          <span className="text-ink-faint">
            <span style={{ color: "var(--viz-truth-ink)" }}>∂f/∂x</span> {g.x.toFixed(3)}
          </span>
          <span className="text-ink-faint">
            <span style={{ color: "var(--viz-prediction-ink)" }}>∂f/∂y</span> {g.y.toFixed(3)}
          </span>
          <span className="text-ink-faint">
            |∇f| ≈ <span style={{ color: "var(--accent)" }}>{slope.toFixed(2)}</span>
          </span>
        </div>
        <p className="max-w-[78ch] px-1 pt-1 text-sm leading-relaxed text-ink-muted">
          <span className="font-medium" style={{ color: "var(--viz-prediction-ink)" }}>
            Drag the probe — the gradient points straight uphill, fastest.
          </span>{" "}
          Its x and y components are the partial derivatives; flip the sign and you have the direction gradient descent walks.
        </p>
      </div>
    </figure>
  );
}
