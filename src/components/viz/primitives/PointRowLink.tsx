"use client";

/**
 * CONNECT/CARRY — Point↔row tether (visual-standards audit).
 *
 * Legible dashed link from a scatter point to a provenance card so a datum
 * reads as traceable table row, not a stray highlight.
 */
export function PointRowLink({
  point,
  card,
  cardWidth = 118,
  cardHeight = 40,
  kicker,
  lines,
  tone = "accent",
  opacity = 1,
}: {
  point: [number, number];
  card: [number, number];
  cardWidth?: number;
  cardHeight?: number;
  kicker?: string;
  lines: string[];
  tone?: "accent" | "error" | "neutral";
  opacity?: number;
}) {
  const [px, py] = point;
  const [cx, cy] = card;
  const cardMidY = cy + cardHeight / 2;
  const cardEdgeX = cx - 6;
  const ink =
    tone === "error"
      ? "var(--viz-error-ink)"
      : tone === "neutral"
        ? "var(--viz-neutral-ink)"
        : "var(--accent)";
  const stroke =
    tone === "error"
      ? "var(--viz-error)"
      : tone === "neutral"
        ? "var(--viz-neutral)"
        : "var(--accent)";

  return (
    <g aria-hidden opacity={opacity}>
      <line
        x1={px}
        y1={py}
        x2={cardEdgeX}
        y2={cardMidY}
        stroke={stroke}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        opacity={0.85}
      />
      <rect
        x={cx}
        y={cy}
        width={cardWidth}
        height={cardHeight}
        rx={5}
        fill="var(--surface-bg)"
        stroke={stroke}
        strokeWidth={1.25}
      />
      {kicker && (
        <text x={cx + 8} y={cy + 14} fontSize={10} fontFamily="var(--font-mono)" fill={ink} fontWeight={600}>
          {kicker}
        </text>
      )}
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx + 8}
          y={cy + (kicker ? 28 : 16) + i * 12}
          fontSize={10}
          fontFamily="var(--font-mono)"
          fill={i === 0 && tone === "error" ? "var(--viz-error-ink)" : "var(--ink-muted)"}
        >
          {line}
        </text>
      ))}
    </g>
  );
}
