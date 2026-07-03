"use client";

import { useMemo } from "react";
import { Axes, Plot, usePlot } from "@/components/viz/Plot";
import {
  type EmbeddingToken,
  groupColor,
  type Vec2,
  vectorAnalogy,
} from "@/lib/models/embeddings";

export type EmbeddingLayout = "learned" | "pca";

export function positionOf(token: EmbeddingToken, layout: EmbeddingLayout): Vec2 {
  return layout === "learned" ? token.vector : token.pca;
}

export function EmbeddingMap({
  tokens,
  layout = "learned",
  xDomain,
  yDomain,
  selectedId,
  neighborIds = [],
  analogy,
  width = 560,
  height = 420,
  ariaLabel,
}: {
  tokens: EmbeddingToken[];
  layout?: EmbeddingLayout;
  xDomain: [number, number];
  yDomain: [number, number];
  selectedId?: string;
  neighborIds?: string[];
  analogy?: { a: string; b: string; c: string; target?: string; showResult?: boolean };
  width?: number;
  height?: number;
  ariaLabel: string;
}) {
  const byId = useMemo(() => new Map(tokens.map((token) => [token.id, token])), [tokens]);
  const analogyResult = useMemo(() => {
    if (!analogy?.showResult) return null;
    const a = byId.get(analogy.a);
    const b = byId.get(analogy.b);
    const c = byId.get(analogy.c);
    if (!a || !b || !c) return null;
    return vectorAnalogy(
      positionOf(a, layout),
      positionOf(b, layout),
      positionOf(c, layout),
    );
  }, [analogy, byId, layout]);

  return (
    <Plot width={width} height={height} xDomain={xDomain} yDomain={yDomain} ariaLabel={ariaLabel}>
      <Axes />
      <TokenLayer
        tokens={tokens}
        layout={layout}
        selectedId={selectedId}
        neighborIds={neighborIds}
      />
      {analogy && analogyResult ? (
        <AnalogyLayer layout={layout} analogy={analogy} result={analogyResult} tokens={tokens} />
      ) : null}
    </Plot>
  );
}

function TokenLayer({
  tokens,
  layout,
  selectedId,
  neighborIds,
}: {
  tokens: EmbeddingToken[];
  layout: EmbeddingLayout;
  selectedId?: string;
  neighborIds: string[];
}) {
  const { x, y } = usePlot();

  return (
    <g aria-hidden>
      {tokens.map((token) => {
        const pos = positionOf(token, layout);
        const colors = groupColor(token.group);
        const selected = token.id === selectedId;
        const neighbor = neighborIds.includes(token.id);
        const r = selected ? 7 : neighbor ? 6 : 5;
        return (
          <g key={token.id}>
            <circle
              cx={x(pos.x)}
              cy={y(pos.y)}
              r={r}
              fill={colors.fill}
              fillOpacity={selected || neighbor ? 0.95 : 0.78}
              stroke="var(--surface-bg)"
              strokeWidth={selected ? 2 : 1.25}
            />
            <text
              x={x(pos.x)}
              y={y(pos.y) - 10}
              textAnchor="middle"
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill={selected ? colors.ink : "var(--ink-muted)"}
              paintOrder="stroke"
              stroke="var(--surface-bg)"
              strokeWidth={4}
            >
              {token.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function AnalogyLayer({
  tokens,
  layout,
  analogy,
  result,
}: {
  tokens: EmbeddingToken[];
  layout: EmbeddingLayout;
  analogy: { a: string; b: string; c: string; target?: string };
  result: Vec2;
}) {
  const { x, y } = usePlot();
  const byId = new Map(tokens.map((token) => [token.id, token]));
  const a = byId.get(analogy.a)!;
  const b = byId.get(analogy.b)!;
  const c = byId.get(analogy.c)!;
  const pa = positionOf(a, layout);
  const pb = positionOf(b, layout);
  const pc = positionOf(c, layout);
  const gender = { x: pc.x - pb.x, y: pc.y - pb.y };
  const target = analogy.target ? byId.get(analogy.target) : undefined;

  return (
    <g aria-hidden>
      <line
        x1={x(pa.x)}
        y1={y(pa.y)}
        x2={x(pa.x + gender.x)}
        y2={y(pa.y + gender.y)}
        stroke="var(--viz-param)"
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      <circle cx={x(result.x)} cy={y(result.y)} r={8} fill="none" stroke="var(--viz-prediction)" strokeWidth={2} />
      {target ? (
        <line
          x1={x(result.x)}
          y1={y(result.y)}
          x2={x(positionOf(target, layout).x)}
          y2={y(positionOf(target, layout).y)}
          stroke="var(--viz-truth)"
          strokeWidth={1.5}
          strokeDasharray="2 3"
        />
      ) : null}
    </g>
  );
}
