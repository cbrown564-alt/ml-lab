"use client";

import { useState } from "react";
import { GradientField } from "@/components/viz/GradientField";
import { ProbeLens } from "@/components/viz/primitives/ProbeLens";
import { gradient, magnitude } from "@/lib/models/gradient";

/**
 * The specimen hero — the gradient as the arrow of steepest ascent. A draggable
 * probe on the landscape; ProbeLens holds the tangent-plane decomposition (∂f/∂x,
 * ∂f/∂y) so the base field stays uncluttered.
 */

const INIT = { x: 0.4, y: 1.0 };

function TangentReadout({ gx, gy, mag }: { gx: number; gy: number; mag: number }) {
  const max = Math.max(0.01, Math.abs(gx), Math.abs(gy));
  const scale = 52 / max;
  const midY = 36;
  const barH = 10;

  return (
    <div className="flex w-full flex-col gap-2 text-left">
      <span className="font-mono text-[9px] tracking-wider text-ink-faint uppercase">
        tangent plane
      </span>
      <svg viewBox="0 0 120 72" className="w-full" aria-hidden>
        <text x={0} y={10} fontSize={8} fontFamily="var(--font-mono)" fill="var(--viz-truth-ink)">
          ∂f/∂x
        </text>
        <rect x={0} y={midY - barH / 2} width={Math.abs(gx) * scale} height={barH} rx={2} fill="var(--viz-truth)" opacity={0.85} />
        <text x={Math.abs(gx) * scale + 4} y={midY + 4} fontSize={9} fontFamily="var(--font-mono)" fill="var(--viz-truth-ink)">
          {gx.toFixed(3)}
        </text>
        <text x={0} y={58} fontSize={8} fontFamily="var(--font-mono)" fill="var(--viz-prediction-ink)">
          ∂f/∂y
        </text>
        <rect x={0} y={62} width={Math.abs(gy) * scale} height={barH} rx={2} fill="var(--viz-prediction)" opacity={0.85} />
        <text x={Math.abs(gy) * scale + 4} y={66} fontSize={9} fontFamily="var(--font-mono)" fill="var(--viz-prediction-ink)">
          {gy.toFixed(3)}
        </text>
      </svg>
      <span className="font-mono text-[10px] tabular-nums text-ink-muted">
        |∇f| ≈ <span style={{ color: "var(--accent)" }}>{mag.toFixed(2)}</span>
      </span>
    </div>
  );
}

export function TheGradientHero() {
  const [point, setPoint] = useState(INIT);
  const [lensOpen, setLensOpen] = useState(true);
  const g = gradient(point.x, point.y);
  const slope = magnitude(g);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          The gradient
        </span>
        <span className="hidden font-mono text-[11px] tabular-nums tracking-widest text-ink-faint uppercase sm:inline">
          drag probe · |∇f| {slope.toFixed(2)}
        </span>
      </figcaption>
      <div className="px-3 py-2">
        <ProbeLens
          open={lensOpen}
          onOpenChange={setLensOpen}
          lensSize={148}
          ariaLabel="Gradient landscape with draggable probe; tangent-plane detail in the lens."
          probe={<TangentReadout gx={g.x} gy={g.y} mag={slope} />}
        >
          <GradientField
            point={point}
            onMove={setPoint}
            descent={false}
            interactive
            showComponents
            xDomain={[-5.7, 5.7]}
            yDomain={[-2, 2]}
            width={1200}
            height={420}
          />
        </ProbeLens>
        <p className="max-w-[78ch] px-1 pt-2 text-sm leading-relaxed text-ink-muted">
          <span className="font-medium" style={{ color: "var(--viz-prediction-ink)" }}>
            Drag the probe — the gradient points straight uphill, fastest.
          </span>{" "}
          The x and y legs are the partial derivatives on the tangent plane; flip the sign and you have the direction gradient descent walks.
        </p>
      </div>
    </figure>
  );
}
