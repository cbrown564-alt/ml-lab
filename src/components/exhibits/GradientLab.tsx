"use client";

import { useMemo, useState } from "react";
import { GradientField } from "@/components/viz/GradientField";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { gradient, magnitude, surface, type Vec2 } from "@/lib/models/gradient";
import { defaultPoint, gradientScenario } from "@content/exhibits/the-gradient/experiment";

/**
 * The-gradient bench: drag a point across a 2-D landscape and read the gradient off
 * the arrow — its direction is steepest ascent (perpendicular to the contour bands),
 * its length is the slope. The ascent/descent toggle flips the arrow to −∇f, the step
 * gradient descent walks.
 */
export function GradientLab() {
  const [point, setPoint] = useState<Vec2>(defaultPoint);
  const [descent, setDescent] = useState(false);
  const grad = useMemo(() => gradient(point.x, point.y), [point]);
  const mag = magnitude(grad);
  const height = surface(point.x, point.y);

  const move = (p: Vec2) => {
    whenHydrated(() => useLearner.getState().recordPractice("the-gradient"));
    setPoint(p);
  };

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{gradientScenario.prompt}</p>

          <div role="group" aria-label="Gradient direction" className="inline-flex self-start rounded-full border border-line p-0.5 text-sm">
            {(
              [
                ["ascent", false],
                ["descent (−∇f)", true],
              ] as const
            ).map(([label, value]) => (
              <button
                key={label}
                type="button"
                aria-pressed={descent === value}
                onClick={() => {
                  whenHydrated(() => useLearner.getState().recordPractice("the-gradient"));
                  setDescent(value);
                }}
                className={`rounded-full px-4 py-1 transition-colors ${descent === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <StatGrid
            direction="col"
            caption={`At (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`}
            stats={[
              { label: "∇f = (∂f/∂x, ∂f/∂y)", value: `(${grad.x.toFixed(2)}, ${grad.y.toFixed(2)})`, hue: "var(--viz-prediction-ink)", note: "the gradient vector" },
              { label: "slope |∇f|", value: mag.toFixed(2), hue: "var(--viz-truth-ink)", note: "steepness in the uphill direction" },
              { label: "height f", value: height.toFixed(2), hue: "var(--viz-neutral-ink)" },
            ]}
          />

          <p className="text-sm leading-relaxed text-ink-faint">
            Drag toward a peak and the arrow shortens to nothing — at the very top the slope
            is zero, the gradient vanishes, and there&apos;s no uphill left to point to. That
            zero is what descent is hunting for.
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <GradientField point={point} onMove={move} descent={descent} width={520} height={520} />
        </div>
      </div>
    </div>
  );
}
