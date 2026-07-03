"use client";

import type { BlockStage } from "@/lib/models/transformer";

const STAGE_HUES: Record<string, string> = {
  embed: "var(--viz-truth)",
  attn: "var(--viz-param)",
  "attn-residual": "var(--viz-prediction)",
  ffn: "var(--viz-param)",
  "ffn-residual": "var(--viz-prediction)",
  head: "var(--viz-truth-ink)",
};

export function TransformerBlockFlow({
  stages,
  activeStageId,
  blockCount,
  residualEnabled = true,
  width = 560,
  ariaLabel,
}: {
  stages: BlockStage[];
  activeStageId: string;
  blockCount: number;
  residualEnabled?: boolean;
  width?: number;
  ariaLabel: string;
}) {
  return (
    <figure role="img" aria-label={ariaLabel} style={{ maxWidth: width }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
          Block {blockCount} · {residualEnabled ? "residuals on" : "residuals off"}
        </p>
      </div>
      <div className="flex flex-wrap items-stretch gap-2">
        {stages.map((stage, index) => {
          const active = stage.id === activeStageId;
          const hue = STAGE_HUES[stage.id] ?? "var(--viz-neutral)";
          const showResidual = stage.id.endsWith("residual");
          return (
            <div key={stage.id} className="flex grow items-center gap-2">
              <div
                className={`min-w-[5.5rem] grow rounded-lg border px-3 py-2 transition-colors ${
                  active ? "border-[color-mix(in_srgb,var(--accent)_40%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]" : "border-line bg-sunken"
                }`}
              >
                <p
                  className="font-mono text-[10px] tracking-widest uppercase"
                  style={{ color: active ? hue : "var(--ink-faint)" }}
                >
                  {stage.label}
                </p>
                <p className="mt-1 font-mono text-[11px] tabular-nums text-ink-muted">
                  {stage.deltaNorm != null ? `Δ ${stage.deltaNorm.toFixed(2)}` : `‖x‖ ${stage.norm?.toFixed(2)}`}
                </p>
              </div>
              {showResidual && residualEnabled ? (
                <span className="font-mono text-[10px] text-[var(--viz-prediction-ink)]">+ residual</span>
              ) : null}
              {index < stages.length - 1 ? (
                <span className="text-ink-faint" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </figure>
  );
}
