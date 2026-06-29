"use client";

/**
 * The test-error spread, drawn as a binned density over a FIXED error axis — so the
 * "lottery" has a legible shape (a wide, low histogram at a tiny holdout; a tall, narrow
 * spike once the estimate settles), and the change reads at a glance the way R2D3's
 * distribution strips do. Reference marks (training error, cross-validation estimate)
 * are vertical rules with labels inset so they never overflow the frame. Shared by the
 * See-it story, the Run-it bench, the Break-it lab, and the Explain-it companion.
 */
export type SpreadMark = { value: number; label: string; color: string };

export function ErrorSpreadStrip({
  errs,
  marks,
  axisMax,
  bins = 20,
  width = 600,
  height = 170,
  accentLatest = false,
  ghostErrs,
}: {
  errs: number[];
  marks: SpreadMark[];
  /** Fixed upper bound of the error axis — held constant across states so the shape is
   * comparable; values above it pile into the last bin. */
  axisMax: number;
  bins?: number;
  width?: number;
  height?: number;
  /** Highlight the newest bin so accumulation reads beat-by-beat. */
  accentLatest?: boolean;
  /** The full lottery, drawn faint behind `errs` as prominent markers — so a single
   * split reads as one draw from the distribution, not a lone bar in an empty plot. */
  ghostErrs?: number[];
}) {
  const m = { l: 16, r: 16, t: 46, b: 22 };
  const plotW = width - m.l - m.r;
  const plotH = height - m.t - m.b;
  const x = (e: number) => m.l + (Math.min(e, axisMax) / axisMax) * plotW;

  const ghosting = !!ghostErrs && ghostErrs.length > 0;
  // When ghosting, the histogram IS the full lottery (faint); the split(s) overlay as marks.
  const histErrs = ghosting ? ghostErrs! : errs;
  const counts = new Array<number>(bins).fill(0);
  for (const e of histErrs) {
    const b = Math.min(bins - 1, Math.floor((Math.min(e, axisMax) / axisMax) * bins));
    counts[b]++;
  }
  const maxCount = Math.max(1, ...counts);
  const bw = plotW / bins;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={
        ghosting
          ? `One split's validation error (${errs.map((e) => e.toFixed(3)).join(", ")}) marked against the distribution of ${ghostErrs!.length} possible random splits; ${marks.map((mk) => `${mk.label} at ${mk.value.toFixed(3)}`).join(", ")}.`
          : `Distribution of validation error across ${errs.length} random splits; ${marks.map((mk) => `${mk.label} at ${mk.value.toFixed(3)}`).join(", ")}.`
      }
      className="h-auto w-full"
    >
      <line x1={m.l} x2={width - m.r} y1={height - m.b} y2={height - m.b} stroke="var(--line)" />
      {counts.map((c, i) => {
        if (c === 0) return null;
        const latestBin =
          accentLatest &&
          errs.length > 0 &&
          i ===
            Math.min(
              bins - 1,
              Math.floor((Math.min(errs[errs.length - 1]!, axisMax) / axisMax) * bins),
            );
        return (
          <rect
            key={i}
            x={m.l + i * bw + bw * 0.12}
            y={height - m.b - (c / maxCount) * plotH}
            width={bw * 0.76}
            height={(c / maxCount) * plotH}
            fill={latestBin ? "var(--accent)" : "var(--viz-prediction)"}
            fillOpacity={ghosting ? 0.16 : latestBin ? 0.85 : 0.55}
            style={{ transition: accentLatest ? "fill 200ms ease, fill-opacity 200ms ease" : undefined }}
          />
        );
      })}
      {/* The actual split(s), marked prominently against the faint lottery. */}
      {ghosting &&
        errs.map((e, i) => (
          <g key={`split-${i}`}>
            <rect x={x(e) - 3} y={m.t} width={6} height={plotH} rx={2} fill="var(--viz-prediction)" />
            {i === 0 && (
              <text
                x={x(e)}
                y={m.t - 18}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="var(--viz-prediction-ink)"
                paintOrder="stroke"
                stroke="var(--surface-raised)"
                strokeWidth={3}
              >
                this split
              </text>
            )}
          </g>
        ))}
      {(() => {
        // Place labels so they never collide: edge marks anchor inward, and a mark
        // whose label would overprint a nearer one is bumped up a row.
        const placed: { lx: number; row: number }[] = [];
        return marks.map((mk, i) => {
          const mx = x(mk.value);
          const near = mx < m.l + 34 ? "start" : mx > width - m.r - 34 ? "end" : "middle";
          const lx = near === "start" ? mx + 3 : near === "end" ? mx - 3 : mx;
          // Bump to a new row when labels would overlap. The threshold is the
          // label width, not a token gap — short labels still touch at ~50px.
          let row = 0;
          while (placed.some((p) => p.row === row && Math.abs(p.lx - lx) < 92)) row++;
          placed.push({ lx, row });
          // Stacked rows climb toward the top margin; never let a label leave the frame.
          const ly = Math.max(12, m.t - 8 - row * 12);
          return (
            <g key={i}>
              <line x1={mx} x2={mx} y1={ly + 3} y2={height - m.b} stroke={mk.color} strokeWidth={2} />
              <text x={lx} y={ly} textAnchor={near} fontSize={11} fontWeight={600} fill={mk.color}>{mk.label}</text>
            </g>
          );
        });
      })()}
      <text x={m.l} y={height - 6} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">0</text>
      <text x={width - m.r} y={height - 6} textAnchor="end" fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-faint)">higher error →</text>
    </svg>
  );
}
