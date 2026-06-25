"use client";

import type { ReactNode } from "react";
import { hueMark } from "./shared";

export type ProvenanceStage = {
  id: string;
  label: string;
  children: ReactNode;
  /** When true, marks this stage as crossing the train/test boundary. */
  violatesBoundary?: boolean;
};

/**
 * CONNECT/CARRY — Provenance pipe (visual-standards audit).
 *
 * Data flows left-to-right through named stages; a visible train/test wall makes
 * boundary violations (e.g. leakage) immediately legible.
 */
export function ProvenancePipe({
  stages,
  boundaryAfterIndex,
  boundaryLabel = "train / test wall",
  ariaLabel,
}: {
  stages: ProvenanceStage[];
  /** Index after which the immutable evaluation wall appears (default: len-2). */
  boundaryAfterIndex?: number;
  boundaryLabel?: string;
  ariaLabel: string;
}) {
  const wallAt =
    boundaryAfterIndex ?? Math.max(0, stages.length - 2);

  return (
    <div
      className="flex items-stretch gap-0 overflow-x-auto"
      aria-label={ariaLabel}
      role="list"
    >
      {stages.map((stage, i) => {
        const showWall = i === wallAt;
        const violated = stage.violatesBoundary === true;

        return (
          <div key={stage.id} className="flex items-stretch" role="listitem">
            <div
              className={`flex min-w-[120px] flex-col rounded-lg border px-3 py-2 ${
                violated ? "border-[var(--viz-error)]" : "border-line"
              } bg-raised`}
              style={
                violated
                  ? {
                      background:
                        "color-mix(in oklab, var(--viz-error) 8%, var(--surface-raised))",
                    }
                  : undefined
              }
            >
              <span
                className="mb-2 font-mono text-[10px] tracking-widest uppercase"
                style={{
                  color: violated
                    ? "var(--viz-error-ink)"
                    : "var(--ink-faint)",
                }}
              >
                {stage.label}
              </span>
              <div className="min-h-[48px] flex-1">{stage.children}</div>
              {violated && (
                <span className="mt-2 font-mono text-[9px] text-[var(--viz-error-ink)]">
                  boundary violation
                </span>
              )}
            </div>
            {showWall ? (
              <BoundaryWall label={boundaryLabel} />
            ) : i < stages.length - 1 ? (
              <PipeConnector violated={violated} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function PipeConnector({ violated }: { violated: boolean }) {
  return (
    <div className="flex w-8 shrink-0 items-center justify-center" aria-hidden>
      <span
        className="block h-px w-full"
        style={{
          background: violated ? hueMark("error") : "var(--line)",
          borderTop: violated ? `2px dashed ${hueMark("error")}` : undefined,
        }}
      />
    </div>
  );
}

function BoundaryWall({ label }: { label: string }) {
  return (
    <div
      className="mx-1 flex w-10 shrink-0 flex-col items-center justify-center gap-1"
      aria-label={label}
    >
      <span
        className="block h-full min-h-[64px] w-1 rounded-full"
        style={{ background: "var(--viz-neutral)" }}
      />
      <span
        className="max-w-[4.5rem] text-center font-mono text-[8px] leading-tight tracking-wide text-ink-faint uppercase"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {label}
      </span>
    </div>
  );
}
