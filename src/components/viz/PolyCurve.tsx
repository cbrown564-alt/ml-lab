"use client";

import { usePlot } from "@/components/viz/Plot";

/**
 * A fitted curve drawn as a smooth path across the plot — the prediction hue,
 * lab-wide. Takes a `predict(x)` so it serves a plain polynomial or a standardised
 * ridge model alike. Pixel y is clamped just outside the frame so an overfit curve
 * that shoots to ±∞ between two close points reads as "off the chart" rather than
 * scribbling across the whole SVG.
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
  const { x, y, height } = usePlot();
  const [d0, d1] = x.domain;
  const clampY = (v: number) => Math.max(-40, Math.min(height + 40, v));
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const xv = d0 + (d1 - d0) * (i / samples);
    pts.push(`${i === 0 ? "M" : "L"} ${x(xv).toFixed(1)} ${clampY(y(predict(xv))).toFixed(1)}`);
  }
  return (
    <path
      d={pts.join(" ")}
      fill="none"
      stroke="var(--viz-prediction)"
      strokeWidth={faint ? 1.5 : 2.5}
      strokeOpacity={faint ? 0.4 : 1}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
    />
  );
}
