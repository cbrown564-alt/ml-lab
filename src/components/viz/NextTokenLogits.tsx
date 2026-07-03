"use client";

import type { NextTokenCandidate } from "@/lib/models/transformer";

export function NextTokenLogits({
  distribution,
  targetId,
  width = 560,
  size = "md",
  ariaLabel,
}: {
  distribution: { candidate: NextTokenCandidate; prob: number }[];
  targetId: string;
  width?: number;
  size?: "md" | "lg";
  ariaLabel: string;
}) {
  const sorted = [...distribution].sort((left, right) => right.prob - left.prob);
  const lg = size === "lg";

  return (
    <figure role="img" aria-label={ariaLabel} style={{ maxWidth: width }}>
      <div className={`flex flex-col ${lg ? "gap-3" : "gap-2"}`}>
        {sorted.map(({ candidate, prob }) => {
          const target = candidate.id === targetId;
          return (
            <div key={candidate.id} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-2">
              <span
                className={`font-mono ${lg ? "text-sm" : "text-xs"} ${target ? "font-semibold text-[var(--viz-prediction-ink)]" : "text-ink-muted"}`}
              >
                {candidate.label}
              </span>
              <div className={`${lg ? "h-4" : "h-2.5"} overflow-hidden rounded-full bg-sunken`}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(4, prob * 100)}%`,
                    background: target ? "var(--viz-prediction)" : "var(--viz-param)",
                    opacity: target ? 1 : 0.65,
                  }}
                />
              </div>
              <span
                className={`font-mono ${lg ? "text-xs" : "text-[11px]"} tabular-nums text-ink-muted`}
              >
                {prob.toFixed(3)}
              </span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}

export function PrefixStrip({
  tokens,
  predictIndex,
  width = 560,
}: {
  tokens: { label: string }[];
  predictIndex: number;
  width?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2" style={{ maxWidth: width }}>
      {tokens.map((token, index) => (
        <span
          key={`${token.label}-${index}`}
          className={`rounded-full border px-3 py-1 font-mono text-sm ${
            index === predictIndex
              ? "border-[var(--viz-param)] bg-[color-mix(in_srgb,var(--viz-param)_12%,transparent)] text-[var(--viz-param-ink)]"
              : "border-line bg-sunken text-ink-muted"
          }`}
        >
          {token.label}
        </span>
      ))}
      <span className="rounded-full border border-dashed border-[var(--viz-prediction)] px-3 py-1 font-mono text-sm text-[var(--viz-prediction-ink)]">
        ?
      </span>
    </div>
  );
}
