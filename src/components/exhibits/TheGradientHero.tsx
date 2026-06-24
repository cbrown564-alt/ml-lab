"use client";

import { GradientField } from "@/components/viz/GradientField";
import { gradient, magnitude } from "@/lib/models/gradient";

/**
 * The specimen hero — the gradient as the arrow of steepest ascent. On a contour
 * landscape (dark valley → bright peak), the arrow at the marked point shows the
 * gradient: straight uphill, crossing the contour lines at right angles, longer
 * where the slope is steeper. That perpendicular-to-the-contours arrow IS the
 * mechanism the whole exhibit turns on. A composed, static portrait (the working
 * drag lives in the acts below); the callout names what the arrow is doing.
 */

// On a steep flank (not a peak or the gentle saddle), so the arrow is long and
// its right-angle-to-the-contours reads clearly.
const POINT = { x: 0.4, y: 1.0 };
const SLOPE = magnitude(gradient(POINT.x, POINT.y));

export function TheGradientHero() {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The gradient
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          the arrow of steepest ascent
        </span>
      </figcaption>
      <div className="px-3 py-2">
        {/* Full-bleed wide landscape: a per-axis window keeps pixels square so the
            contours stay round and the arrow reads truly perpendicular. */}
        <GradientField
          point={POINT}
          descent={false}
          interactive={false}
          xDomain={[-5.7, 5.7]}
          yDomain={[-2, 2]}
          width={1200}
          height={420}
        />
        <p className="max-w-[78ch] px-1 pt-1 text-sm leading-relaxed text-ink-muted">
          <span className="font-medium" style={{ color: "var(--viz-prediction-ink)" }}>
            The gradient points straight uphill, fastest.
          </span>{" "}
          It crosses the contour lines at right angles and stretches where the hill is steeper
          (slope ≈ {SLOPE.toFixed(2)} here) — flip its sign and you have the direction gradient
          descent walks.
        </p>
      </div>
    </figure>
  );
}
