"use client";

import { useMemo } from "react";
import type { AttentionToken } from "@/lib/models/attention";

export function AttentionHeatmap({
  tokens,
  weights,
  queryIndex,
  highlightKeyIndex,
  width = 560,
  height = 360,
  ariaLabel,
}: {
  tokens: AttentionToken[];
  weights: number[][];
  queryIndex: number;
  highlightKeyIndex?: number;
  width?: number;
  height?: number;
  ariaLabel: string;
}) {
  const layout = useMemo(() => {
    const labelPad = 56;
    // Two stacked text rows live above the grid ("Keys →" then token labels) —
    // anything under ~40 collides them at 11px mono.
    const topPad = 44;
    const size = tokens.length;
    const innerW = width - labelPad - 16;
    const innerH = height - topPad - labelPad;
    const cellW = innerW / size;
    const cellH = innerH / size;
    return { labelPad, topPad, cellW, cellH, size };
  }, [height, tokens.length, width]);

  return (
    <figure role="img" aria-label={ariaLabel}>
      {/* Fluid: viewBox carries the aspect; the matrix scales with its column. */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full"
        style={{ maxWidth: width }}
      >
        <text
          x={layout.labelPad + (layout.cellW * layout.size) / 2}
          y={14}
          textAnchor="middle"
          className="fill-[var(--ink-faint)] font-mono text-[10px] tracking-widest uppercase"
        >
          Keys →
        </text>
        {tokens.map((token, keyIndex) => (
          <text
            key={`key-${token.id}`}
            x={layout.labelPad + keyIndex * layout.cellW + layout.cellW / 2}
            y={layout.topPad - 8}
            textAnchor="middle"
            className={`font-mono text-[11px] ${
              keyIndex === highlightKeyIndex ? "fill-[var(--viz-prediction-ink)] font-semibold" : "fill-[var(--ink-muted)]"
            }`}
          >
            {token.label}
          </text>
        ))}
        {tokens.map((token, rowIndex) => {
          const isQuery = rowIndex === queryIndex;
          return (
            <g key={`row-${token.id}`}>
              <text
                x={layout.labelPad - 8}
                y={layout.topPad + rowIndex * layout.cellH + layout.cellH / 2 + 4}
                textAnchor="end"
                className={`font-mono text-[11px] ${
                  isQuery ? "fill-[var(--viz-param-ink)] font-semibold" : "fill-[var(--ink-muted)]"
                }`}
              >
                {token.label}
              </text>
              {tokens.map((keyToken, keyIndex) => {
                const weight = weights[rowIndex]?.[keyIndex] ?? 0;
                const emphasized = isQuery;
                const peak = keyIndex === highlightKeyIndex && isQuery;
                return (
                  <g key={`${token.id}-${keyToken.id}`}>
                    <rect
                      x={layout.labelPad + keyIndex * layout.cellW + 1}
                      y={layout.topPad + rowIndex * layout.cellH + 1}
                      width={layout.cellW - 2}
                      height={layout.cellH - 2}
                      rx={4}
                      fill={cellFill(weight, emphasized)}
                      stroke={
                        peak
                          ? "var(--viz-prediction)"
                          : isQuery
                            ? "color-mix(in srgb, var(--viz-param) 35%, transparent)"
                            : "transparent"
                      }
                      strokeWidth={peak ? 2 : 1}
                      opacity={isQuery ? 1 : 0.9}
                    />
                    {isQuery ? (
                      <text
                        x={layout.labelPad + keyIndex * layout.cellW + layout.cellW / 2}
                        y={layout.topPad + rowIndex * layout.cellH + layout.cellH / 2 + 4}
                        textAnchor="middle"
                        className="fill-[var(--ink)] font-mono text-[10px] tabular-nums"
                      >
                        {weight.toFixed(2)}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

// Continuous single-hue ramp over the WHOLE matrix — every query row is a shaded
// field (the token-aligned-heatmap register), with the active row run slightly hotter.
function cellFill(weight: number, emphasized: boolean): string {
  const pct = Math.round(Math.min(0.75, weight) * (emphasized ? 92 : 76));
  return `color-mix(in srgb, var(--viz-prediction) ${pct}%, var(--surface-bg))`;
}

export function ValueMixBar({
  tokens,
  weights,
  queryIndex,
  width = 560,
}: {
  tokens: AttentionToken[];
  weights: number[][];
  queryIndex: number;
  width?: number;
}) {
  const row = weights[queryIndex] ?? [];
  const sorted = tokens
    .map((token, index) => ({ token, weight: row[index] ?? 0, index }))
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-2" style={{ maxWidth: width }}>
      <p className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
        Weighted value mix · query {tokens[queryIndex]?.label}
      </p>
      <div className="flex flex-col gap-1.5">
        {sorted.map(({ token, weight }) => (
          <div key={token.id} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-2">
            <span className="font-mono text-xs text-ink-muted">{token.label}</span>
            <div className="h-2 overflow-hidden rounded-full bg-sunken">
              <div
                className="h-full rounded-full bg-[var(--viz-prediction)]"
                style={{ width: `${Math.max(4, weight * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-[var(--viz-prediction-ink)]">
              {weight.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
