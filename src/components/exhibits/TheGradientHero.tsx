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
      <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center">
        <div className="min-w-0 sm:flex-[1.4]">
          <GradientField point={POINT} descent={false} interactive={false} width={620} height={460} />
        </div>
        <div className="flex min-w-0 flex-col gap-2 px-3 pb-3 sm:flex-1 sm:pb-0">
          <span
            className="font-mono text-[11px] tracking-widest uppercase"
            style={{ color: "var(--viz-prediction-ink)" }}
          >
            straight uphill, fastest
          </span>
          <p className="max-w-[34ch] text-sm leading-relaxed text-ink-muted">
            The gradient points up the steepest slope — perpendicular to the contour lines,
            and longer where the hill is steeper. Flip its sign and you have the direction
            gradient descent walks.
          </p>
          <span className="font-mono text-[11px] text-ink-faint tabular-nums">
            slope here ≈ {SLOPE.toFixed(2)} · ⟂ to the contours
          </span>
        </div>
      </div>
    </figure>
  );
}
