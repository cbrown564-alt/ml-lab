"use client";

import { useEffect, useMemo, useRef } from "react";
import { lossSurfaceGrid } from "@/lib/viz/loss-surface";
import { linearScale } from "@/lib/viz/scale";
import type { DescentStep, Point } from "@/lib/models/linear-regression";

/**
 * The loss surface — the territory gradient descent walks (docs/06, B3/B6).
 * Every point of the map is a candidate line (slope across, intercept up);
 * shading is how wrong that line is, in quantized log bands so the bowl
 * reads like a topographic map. The descent trace is drawn on top in the
 * parameter hue: the abstract "rolling downhill" becomes a literal path.
 *
 * Heat is one canvas paint per dataset; the SVG overlay (path, markers,
 * axes) is what re-renders as the learner steps and scrubs.
 */

const MARGIN = { top: 16, right: 16, bottom: 40, left: 56 };
// Loss stays in the red family (grammar: error = red), but rendered as a
// TOPOGRAPHIC MAP, not a flood. The old ramp hit full error-red at the midpoint,
// so the whole bowl read as a saturated crimson wash that drained red's "error"
// meaning. This ramp keeps a wide, calm cream→dusty-rose low/mid ground (so the
// basin reads as soft terrain) and reserves saturated maroon for the true
// high-loss peaks; a gamma ease pushes most of the field toward the calm end, and
// contour LINES at each band boundary (the ramp darkened) draw the bowl as a map
// rather than a posterized wash — the move that cleared GradientField. sRGB lerp
// between three anchors — universal, no oklch canvas dependency.
const BANDS = 12;
const RAMP: [number, number, number][] = [
  [250, 247, 240], // t=0   low loss — cream valley (blends into the surface)
  [224, 168, 162], // t=0.5 dusty rose — the calm mid ground
  [122, 26, 38], //   t=1   deep maroon — the high-loss peaks (error punches here)
];
// Most of a bowl's window is mid-to-high loss, so without easing the field
// saturates everywhere. Gamma>1 widens the calm cream/rose basin and keeps the
// deep maroon for genuine peaks only.
const ease = (v: number) => Math.pow(Math.max(0, Math.min(1, v)), 1.35);

const lerp = (a: number, b: number, u: number) => Math.round(a + (b - a) * u);
const rampRGB = (t: number): [number, number, number] => {
  const u = t <= 0.5 ? t * 2 : (t - 0.5) * 2;
  const [c0, c1] = t <= 0.5 ? [RAMP[0], RAMP[1]] : [RAMP[1], RAMP[2]];
  return [lerp(c0[0], c1[0], u), lerp(c0[1], c1[1], u), lerp(c0[2], c1[2], u)];
};
// Contour lines reuse rampRGB darkened ×0.7, computed per output pixel in the
// canvas paint below (so the boundary feathers into a clean anti-aliased curve).

const clampPx = (v: number) => Math.max(-2000, Math.min(2000, v));

// Bare-mode loss legend geometry. The label is the widest element, so the panel
// is sized to it — at 12px mono "loss: low → high" runs ~120px, wider than the
// 98px swatch row, and the old fixed 114px box let "→ high" bleed past the edge.
const LEGEND_PAD = 12;
const LEGEND_SWATCHES = 14;
const LEGEND_SWATCH_W = 7;
const LEGEND_LABEL = "loss: low → high";
const LEGEND_SWATCH_ROW = LEGEND_SWATCHES * LEGEND_SWATCH_W; // 98
// Mono advance ≈ 0.62em at 12px; round up so font substitution can't re-bleed.
const LEGEND_LABEL_W = Math.ceil(LEGEND_LABEL.length * 7.5);
const LEGEND_W = Math.max(LEGEND_SWATCH_ROW, LEGEND_LABEL_W) + LEGEND_PAD * 2;
const LEGEND_H = 40;

export function LossSurface({
  points,
  trace,
  cursor,
  width = 880,
  height = 460,
  bare = false,
  legend = true,
}: {
  points: Point[];
  trace: ReadonlyArray<DescentStep>;
  /** Index into the trace currently shown by the exhibit (scrub position). */
  cursor: number;
  width?: number;
  height?: number;
  /** Portrait mode (the specimen hero): drop the axes and text labels, keep the
   *  heat, the start/valley marks, and the descent path. */
  bare?: boolean;
  /** Show the bare-mode loss legend. Off for the right of a paired before/after,
   *  where one shared legend reads cleaner. */
  legend?: boolean;
}) {
  // A much finer grid than the default keeps the upscaled field and its contour
  // lines crisp instead of blocky (the old 110×80 read as stair-stepped at full
  // width). Memoized per dataset, so the extra samples are paid once.
  const grid = useMemo(() => lossSurfaceGrid(points, 300, 200), [points]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sx = linearScale(grid.slopeRange, [MARGIN.left, width - MARGIN.right]);
  const sy = linearScale(grid.interceptRange, [
    height - MARGIN.bottom,
    MARGIN.top,
  ]);
  const yBase = height - MARGIN.bottom;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { cols, rows, values } = grid;

    // Paint at the canvas's DEVICE-pixel resolution, not the grid's: each output
    // pixel bilinearly samples the (slope,intercept) field and computes its own
    // band, so the band boundaries are smooth curves instead of the diagonal
    // staircase a hard-upscaled fillRect grid produced. Capped so a full-width
    // hero stays a one-time paint.
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const cssW = canvas.clientWidth || 800;
    const cssH = canvas.clientHeight || 420;
    const W = Math.min(1600, Math.round(cssW * dpr));
    const H = Math.min(1000, Math.round(cssH * dpr));
    canvas.width = W;
    canvas.height = H;

    // Bilinear sample of the normalized loss at fractional grid coords.
    const sample = (gx: number, gy: number) => {
      const x0 = Math.floor(gx);
      const x1 = Math.min(cols - 1, x0 + 1);
      const y0 = Math.floor(gy);
      const y1 = Math.min(rows - 1, y0 + 1);
      const fx = gx - x0;
      const fy = gy - y0;
      const v00 = values[y0 * cols + x0];
      const v10 = values[y0 * cols + x1];
      const v01 = values[y1 * cols + x0];
      const v11 = values[y1 * cols + x1];
      return (
        (v00 * (1 - fx) + v10 * fx) * (1 - fy) + (v01 * (1 - fx) + v11 * fx) * fy
      );
    };

    // Pass 1: the continuous band coordinate at every output pixel.
    const bBuf = new Float32Array(W * H);
    for (let py = 0; py < H; py++) {
      const gy = (1 - py / (H - 1)) * (rows - 1); // canvas y is top-down
      for (let px = 0; px < W; px++) {
        const gx = (px / (W - 1)) * (cols - 1);
        bBuf[py * W + px] = ease(sample(gx, gy)) * BANDS;
      }
    }

    // Pass 2: band fill + contour lines. The line width is measured in SCREEN
    // pixels (distance-to-boundary ÷ local gradient, the fwidth trick) so a
    // contour is a constant ~1.5px curve everywhere and correctly thins out on the
    // flat valley floor instead of smearing into a smudge.
    const img = ctx.createImageData(W, H);
    const data = img.data;
    const HALF = 0.9; // half line width in px
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const i = py * W + px;
        const b = bBuf[i];
        const [r, g, bl] = rampRGB(Math.round(b) / BANDS);
        const bx = bBuf[py * W + Math.min(W - 1, px + 1)] - b;
        const by = bBuf[Math.min(H - 1, py + 1) * W + px] - b;
        const grad = Math.hypot(bx, by) || 1e-6; // band-units per pixel
        const distPx = Math.abs(b - Math.round(b)) / grad;
        const k = distPx < HALF ? 1 - distPx / HALF : 0;
        const o = i * 4;
        data[o] = r + (r * 0.7 - r) * k;
        data[o + 1] = g + (g * 0.7 - g) * k;
        data[o + 2] = bl + (bl * 0.7 - bl) * k;
        data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [grid]);

  const current = trace[Math.min(cursor, Math.max(0, trace.length - 1))];
  const path = trace
    .map(
      (s) =>
        `${clampPx(sx(s.params.slope))},${clampPx(sy(s.params.intercept))}`,
    )
    .join(" ");

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
        }}
      />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          current
            ? `Map of the loss surface over slope and intercept. Darker shading is higher loss; the minimum sits at slope ${grid.minimum.slope.toFixed(2)}, intercept ${grid.minimum.intercept.toFixed(2)}. The descent path so far has ${trace.length - 1} steps; the current position is slope ${current.params.slope.toFixed(2)}, intercept ${current.params.intercept.toFixed(2)}.`
            : "Map of the loss surface over slope and intercept."
        }
        className="absolute inset-0 h-full w-full select-none"
      >
        <g aria-hidden>
          {!bare && (
            <>
              {sx.ticks(6).map((t) => (
                <g key={`x${t}`} transform={`translate(${sx(t)},${yBase})`}>
                  <line y2={5} stroke="var(--line)" />
                  <text
                    y={20}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--ink-faint)"
                    fontFamily="var(--font-mono)"
                  >
                    {t}
                  </text>
                </g>
              ))}
              {sy.ticks(5).map((t) => (
                <g key={`y${t}`} transform={`translate(${MARGIN.left},${sy(t)})`}>
                  <line x1={-5} stroke="var(--line)" />
                  <text
                    x={-9}
                    dy="0.32em"
                    textAnchor="end"
                    fontSize={11}
                    fill="var(--ink-faint)"
                    fontFamily="var(--font-mono)"
                  >
                    {t}
                  </text>
                </g>
              ))}
              <rect
                x={MARGIN.left}
                y={MARGIN.top}
                width={width - MARGIN.left - MARGIN.right}
                height={height - MARGIN.top - MARGIN.bottom}
                fill="none"
                stroke="var(--line)"
              />
              <text
                x={width - MARGIN.right}
                y={yBase + 32}
                textAnchor="end"
                fontSize={11}
                fill="var(--ink-faint)"
              >
                slope
              </text>
              <text x={MARGIN.left} y={MARGIN.top - 4} fontSize={11} fill="var(--ink-faint)">
                intercept
              </text>
            </>
          )}

          {/* The loss legend — what the shading means. Bare mode drops the axes,
              so this is what keeps "darker = higher loss" in the picture. Sits on
              its own surface panel so the label stays crisp (a heavy per-glyph halo
              over a contour field blobs small mono text). */}
          {bare && legend && (
            <g transform={`translate(${MARGIN.left + 10},${MARGIN.top + 10})`}>
              <rect
                x={-LEGEND_PAD}
                y={-8}
                width={LEGEND_W}
                height={LEGEND_H}
                rx={6}
                fill="var(--surface-bg)"
                fillOpacity={0.9}
                stroke="var(--line)"
                strokeWidth={1}
              />
              {Array.from({ length: LEGEND_SWATCHES }).map((_, k) => {
                const [r, g, b] = rampRGB(k / (LEGEND_SWATCHES - 1));
                return (
                  <rect
                    key={k}
                    x={k * LEGEND_SWATCH_W}
                    y={0}
                    width={LEGEND_SWATCH_W}
                    height={8}
                    fill={`rgb(${r},${g},${b})`}
                  />
                );
              })}
              <rect x={0} y={0} width={LEGEND_SWATCH_ROW} height={8} fill="none" stroke="var(--ink-faint)" strokeWidth={0.75} />
              <text x={0} y={24} fontSize={12} fontFamily="var(--font-mono)" fill="var(--ink-muted)">
                {LEGEND_LABEL}
              </text>
            </g>
          )}

          {/* Where the walk begins — labelled in the graphic, Distill-style (in
              bare/hero mode too, so the mechanism reads without adjacent prose). */}
          {trace[0] && (
            <g transform={`translate(${clampPx(sx(trace[0].params.slope))},${clampPx(sy(trace[0].params.intercept))})`}>
              <circle r={4} fill="none" stroke="var(--surface-bg)" strokeWidth={3} />
              <circle r={4} fill="none" stroke="var(--viz-param)" strokeWidth={1.75} />
              {/* Above-right of the ring, clear of the descent path's first stride. */}
              <text
                x={9}
                y={-8}
                fontSize={12}
                paintOrder="stroke"
                stroke="var(--surface-bg)"
                strokeWidth={2.5}
                fill="var(--viz-param-ink)"
              >
                start
              </text>
            </g>
          )}

          {/* The valley floor — where every honest walk ends up. */}
          <g
            transform={`translate(${sx(grid.minimum.slope)},${sy(grid.minimum.intercept)})`}
          >
            <line x1={-5} x2={5} y1={-5} y2={5} stroke="var(--ink)" strokeWidth={1.5} />
            <line x1={-5} x2={5} y1={5} y2={-5} stroke="var(--ink)" strokeWidth={1.5} />
            {/* Label sits below the mark, out of the descent path's way. Shown in
                bare/hero mode too — shortened so the poster stays legible. */}
            <text
              x={0}
              y={22}
              textAnchor="middle"
              fontSize={12}
              fontStyle="italic"
              paintOrder="stroke"
              stroke="var(--surface-bg)"
              strokeWidth={3}
              fill="var(--ink)"
            >
              {bare ? "the minimum" : "the valley floor (OLS)"}
            </text>
          </g>

          {trace.length > 1 && (
            <>
              {/* A surface-coloured halo lifts the purple trail off the red
                  bowl so the path reads at any band depth (FINDINGS F11). */}
              <polyline
                points={path}
                fill="none"
                stroke="var(--surface-bg)"
                strokeWidth={4.5}
                strokeLinejoin="round"
                strokeOpacity={0.7}
              />
              <polyline
                points={path}
                fill="none"
                stroke="var(--viz-param)"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              {/* Each iterate as a dot: the trajectory reads as a sequence of
                  discrete steps (Distill/3B1B foreground the walk, not just the
                  bowl), and the dots bunching toward the valley *are* the
                  self-throttling the narrative names. Subsampled for long walks. */}
              {(() => {
                const stride = Math.max(1, Math.ceil(trace.length / 64));
                return trace
                  .filter((_, i) => i % stride === 0 || i === trace.length - 1)
                  .map((s, i) => (
                    <circle
                      key={i}
                      cx={clampPx(sx(s.params.slope))}
                      cy={clampPx(sy(s.params.intercept))}
                      r={1.9}
                      fill="var(--viz-param)"
                      stroke="var(--surface-bg)"
                      strokeWidth={0.75}
                      opacity={0.85}
                    />
                  ));
              })()}
            </>
          )}
          {current && (
            <circle
              cx={clampPx(sx(current.params.slope))}
              cy={clampPx(sy(current.params.intercept))}
              r={5.5}
              fill="var(--viz-param)"
              stroke="var(--surface-bg)"
              strokeWidth={2}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
