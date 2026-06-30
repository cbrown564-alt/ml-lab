"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { linearScale } from "@/lib/viz/scale";
import { boundaryX2, proba, type LabeledPoint, type LogisticParams } from "@/lib/models/logistic";

/**
 * The classifier made visible: a probability field over the 2-D feature plane, the
 * p=½ decision boundary drawn on top, and the data coloured by its true class. The
 * field tints toward amber where the model predicts class 0 and toward blue where it
 * predicts class 1, palest at the boundary where it's least sure — so a point sitting
 * in the wrong-coloured region is a visible misclassification. Heat is one canvas
 * paint per parameter set; the boundary + points are the SVG overlay.
 */

const MARGIN = { top: 14, right: 14, bottom: 36, left: 44 };
// Class hues as rgb anchors (amber = class 0, blue = class 1), kept pale so the
// points read on top; saturation grows with confidence |p − ½|.
const AMBER = [206, 158, 74];
const BLUE = [78, 120, 200];
// A soft warm neutral, distinctly below the raised-surface cream (#fffcf8) so the
// low-confidence zone reads as a faint "unsure" panel — not a hole in the card. The
// boosted classifier's wide near-½ band was vanishing into the background at this end.
const PALE = [239, 236, 228];

const mix = (a: number[], b: number[], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;

function fieldColor(p: number): string {
  // confidence 0 at the boundary → PALE; 1 at the corners → the class hue.
  const conf = Math.abs(p - 0.5) * 2;
  const hue = p >= 0.5 ? BLUE : AMBER;
  return mix(PALE, hue, conf * 0.8);
}

/** smooth = averaged / logistic fields (higher grid, browser interpolation);
 *  crisp = axis-aligned step functions (pixelated upscaling, no hairline bleed). */
const GRID = {
  smooth: { cols: 280, rows: 234 },
  crisp: { cols: 120, rows: 100 },
} as const;

export function DecisionField({
  points,
  params,
  predictProba,
  domain = [-3.6, 3.6],
  width = 560,
  height = 460,
  showProb = true,
  label,
  fieldMode = "smooth",
}: {
  points: LabeledPoint[];
  /** The linear classifier — used for the field and the straight boundary line. */
  params?: LogisticParams;
  /** An override probability function (e.g. a feature-expanded model with a curved
   * boundary); when given, the field uses it and the boundary is read off the field's
   * colour transition rather than drawn as a straight line. */
  predictProba?: (x1: number, x2: number) => number;
  domain?: [number, number];
  width?: number;
  height?: number;
  showProb?: boolean;
  /** Override the accessible description — the default names a logistic boundary, but
   * the same field serves any classifier (e.g. a decision tree's box regions). */
  label?: string;
  /** crisp for decision-tree staircases; smooth for logistic / forest averages. */
  fieldMode?: "smooth" | "crisp";
}) {
  const predict = useMemo(
    () => predictProba ?? ((x1: number, x2: number) => proba(params!, x1, x2)),
    [predictProba, params],
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clipId = useId();
  const { cols, rows } = GRID[fieldMode];
  const plotW = width - MARGIN.left - MARGIN.right;
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const sx = linearScale(domain, [MARGIN.left, width - MARGIN.right]);
  const sy = linearScale(domain, [height - MARGIN.bottom, MARGIN.top]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = cols;
    canvas.height = rows;
    if (!showProb) {
      ctx.clearRect(0, 0, cols, rows);
      return;
    }
    const [d0, d1] = domain;
    for (let r = 0; r < rows; r++) {
      const x2 = d0 + ((d1 - d0) * (r + 0.5)) / rows;
      for (let c = 0; c < cols; c++) {
        const x1 = d0 + ((d1 - d0) * (c + 0.5)) / cols;
        ctx.fillStyle = fieldColor(predictProba ? predictProba(x1, x2) : proba(params!, x1, x2));
        ctx.fillRect(c, rows - 1 - r, 1, 1);
      }
    }
  }, [params, predictProba, domain, showProb, cols, rows]);

  const acc = useMemo(
    () => points.reduce((n, p) => n + ((predict(p.x1, p.x2) >= 0.5 ? 1 : 0) === p.y ? 1 : 0), 0),
    [points, predict],
  );

  // Boundary endpoints across the visible x1 range — only for the straight (linear)
  // case; a feature-expanded model's curved boundary reads off the colour field.
  const [d0, d1] = domain;
  const linear = !predictProba && !!params;
  const by0 = linear ? boundaryX2(params!, d0) : NaN;
  const by1 = linear ? boundaryX2(params!, d1) : NaN;

  return (
    <div className="relative" style={{ aspectRatio: `${width} / ${height}` }}>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute"
        style={{
          left: `${(MARGIN.left / width) * 100}%`,
          top: `${(MARGIN.top / height) * 100}%`,
          width: `${((width - MARGIN.left - MARGIN.right) / width) * 100}%`,
          height: `${((height - MARGIN.top - MARGIN.bottom) / height) * 100}%`,
          imageRendering: fieldMode === "crisp" ? "pixelated" : "auto",
        }}
      />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          label ??
          `Two classes in a 2-D feature plane with a logistic decision boundary; the model classifies ${acc} of ${points.length} points correctly. The shaded field is the predicted probability — amber for class 0, blue for class 1, palest at the boundary.`
        }
        className="absolute inset-0 h-full w-full select-none"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={MARGIN.left} y={MARGIN.top} width={plotW} height={plotH} />
          </clipPath>
        </defs>
        <rect x={MARGIN.left} y={MARGIN.top} width={plotW} height={plotH} fill="none" stroke="var(--line)" />
        {/* Axis ticks orient on full-size fields; on small-multiple tiles (a forest's member
            strip) they're clutter that buries the boundary, so they drop out. */}
        {width > 240 && (
          <g aria-hidden>
            {sx.ticks(7).map((t) => (
              <text key={`x${t}`} x={sx(t)} y={height - MARGIN.bottom + 16} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">{t}</text>
            ))}
            <text x={width - MARGIN.right} y={height - 6} textAnchor="end" fontSize={11} fill="var(--ink-faint)">x₁</text>
            <text x={MARGIN.left} y={MARGIN.top - 3} fontSize={11} fill="var(--ink-faint)">x₂</text>
          </g>
        )}

        {/* the p = ½ decision boundary */}
        {Number.isFinite(by0) && Number.isFinite(by1) && (
          <line
            x1={sx(d0)}
            y1={sy(by0)}
            x2={sx(d1)}
            y2={sy(by1)}
            clipPath={`url(#${clipId})`}
            stroke="var(--ink)"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}

        {points.map((p, i) => {
          const correct = (predict(p.x1, p.x2) >= 0.5 ? 1 : 0) === p.y;
          return (
            <circle
              key={i}
              cx={sx(p.x1)}
              cy={sy(p.x2)}
              r={width <= 240 ? 2.6 : 5}
              fill={p.y === 1 ? "var(--viz-prediction)" : "var(--viz-truth)"}
              stroke={correct ? "var(--surface-bg)" : "var(--viz-error)"}
              strokeWidth={correct ? 1.5 : 2.25}
            />
          );
        })}
      </svg>
    </div>
  );
}
