"use client";

import { useId } from "react";
import { usePlot } from "@/components/viz/Plot";

/**
 * A fitted curve drawn as a smooth path across the plot — the prediction hue,
 * lab-wide. Takes a `predict(x)` so it serves a plain polynomial or a standardised
 * ridge model alike. The path is clipped to the plot frame so an overfit curve
 * that shoots past the axis reads as cleanly cut off, never as a reversed spike
 * scribbling across the SVG.
 */
export function PolyCurve({
  predict,
  samples = 120,
  faint = false,
}: {
  predict: (x: number) => number;
  samples?: number;
  faint?: boolean;
}) {
  const clipId = useId();
  const { x, y } = usePlot();
  const [d0, d1] = x.domain;
  const plotX0 = x.range[0];
  const plotY0 = y.range[1];
  const plotW = x.range[1] - plotX0;
  const plotH = y.range[0] - plotY0;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const xv = d0 + (d1 - d0) * (i / samples);
    pts.push(`${i === 0 ? "M" : "L"} ${x(xv).toFixed(1)} ${y(predict(xv)).toFixed(1)}`);
  }
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={plotX0} y={plotY0} width={plotW} height={plotH} />
        </clipPath>
      </defs>
      <path
        d={pts.join(" ")}
        fill="none"
        stroke="var(--viz-prediction)"
        strokeWidth={faint ? 1.5 : 2.5}
        strokeOpacity={faint ? 0.4 : 1}
        strokeLinejoin="round"
        strokeLinecap="round"
        clipPath={`url(#${clipId})`}
        aria-hidden
      />
    </>
  );
}
