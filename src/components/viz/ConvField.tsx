"use client";

import { useMemo } from "react";
import { patchAt } from "@/lib/models/cnn";

export function ConvField({
  image,
  filter,
  featureMap,
  highlightRow,
  highlightCol,
  width = 560,
  height = 320,
  ariaLabel,
}: {
  image: number[][];
  filter: number[][];
  featureMap: number[][];
  highlightRow: number;
  highlightCol: number;
  width?: number;
  height?: number;
  ariaLabel: string;
}) {
  const patch = useMemo(
    () => patchAt(image, filter, highlightRow, highlightCol),
    [filter, highlightCol, highlightRow, image],
  );
  const outputValue = featureMap[highlightRow]?.[highlightCol] ?? 0;

  return (
    <figure role="img" aria-label={ariaLabel}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.7fr)_minmax(0,1fr)] lg:items-start">
        <GridPanel
          title="Input grid"
          grid={image}
          highlight={{ row: highlightRow, col: highlightCol, size: filter.length }}
          width={width}
          height={height}
        />
        <div className="flex flex-col items-center gap-3 self-center">
          <GridPanel title="Filter (shared)" grid={filter} width={140} height={140} compact />
          <span className="font-mono text-[11px] text-ink-faint">× patch → sum</span>
          <div className="rounded-lg border border-line bg-sunken px-4 py-3 text-center">
            <div className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
              Output
            </div>
            <div className="mt-1 font-mono text-2xl tabular-nums text-[var(--viz-prediction-ink)]">
              {outputValue.toFixed(2)}
            </div>
          </div>
        </div>
        <GridPanel
          title="Feature map"
          grid={featureMap}
          highlight={{ row: highlightRow, col: highlightCol, size: 1 }}
          width={width}
          height={height}
          diverging
        />
      </div>
      <figcaption className="sr-only">
        Input patch at row {highlightRow}, column {highlightCol} dotted with filter produces output{" "}
        {outputValue.toFixed(2)}.
      </figcaption>
      <div className="sr-only" aria-hidden={false}>
        Patch values: {patch.flat().map((v) => v.toFixed(2)).join(", ")}
      </div>
    </figure>
  );
}

function GridPanel({
  title,
  grid,
  highlight,
  width,
  height,
  compact,
  diverging,
}: {
  title: string;
  grid: number[][];
  highlight?: { row: number; col: number; size: number };
  width: number;
  height: number;
  compact?: boolean;
  diverging?: boolean;
}) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const pad = compact ? 8 : 16;
  const cellW = (width - pad * 2) / cols;
  const cellH = (height - pad * 2) / rows;
  const values = grid.flat();
  const min = diverging ? -Math.max(...values.map(Math.abs), 0.01) : Math.min(...values);
  const max = diverging ? Math.max(...values.map(Math.abs), 0.01) : Math.max(...values);

  return (
    <div className="rounded-xl border border-line bg-sunken p-3">
      <div className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {title}
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-hidden
      >
        {grid.map((row, r) =>
          row.map((value, c) => {
            const t = diverging
              ? 0.5 + value / (2 * max)
              : max === min
                ? 0.5
                : (value - min) / (max - min);
            const fill = cellFill(t, diverging);
            const x = pad + c * cellW;
            const y = pad + r * cellH;
            const inHighlight =
              highlight &&
              r >= highlight.row &&
              r < highlight.row + highlight.size &&
              c >= highlight.col &&
              c < highlight.col + highlight.size;
            return (
              <rect
                key={`${r}-${c}`}
                x={x + 0.5}
                y={y + 0.5}
                width={Math.max(0, cellW - 1)}
                height={Math.max(0, cellH - 1)}
                rx={1}
                fill={fill}
                stroke={inHighlight ? "var(--viz-param-ink)" : "var(--line)"}
                strokeWidth={inHighlight ? 2 : 0.75}
              />
            );
          }),
        )}
      </svg>
    </div>
  );
}

function cellFill(t: number, diverging?: boolean): string {
  const clamped = Math.max(0, Math.min(1, t));
  if (diverging) {
    if (clamped < 0.5) {
      const u = clamped * 2;
      return `color-mix(in srgb, var(--viz-truth) ${Math.round((1 - u) * 55)}%, var(--surface-bg))`;
    }
    const u = (clamped - 0.5) * 2;
    return `color-mix(in srgb, var(--viz-error) ${Math.round(u * 55)}%, var(--surface-bg))`;
  }
  return `color-mix(in srgb, var(--viz-truth) ${Math.round(clamped * 70 + 10)}%, var(--surface-bg))`;
}
