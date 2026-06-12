"use client";

import type { Scenario } from "@/lib/experiment/spec";

/**
 * Scenario chips + reset — the standard header of every experiment island.
 * Failure-gallery scenarios are visibly flagged: "break it" is an invitation,
 * not an accident.
 */
export function ScenarioBar({
  scenarios,
  activeId,
  onSelect,
  onReset,
  resetLabel = "Reset",
}: {
  scenarios: Scenario[];
  activeId: string;
  onSelect: (id: string) => void;
  onReset: () => void;
  resetLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {scenarios.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            s.id === activeId
              ? "border-accent bg-accent text-accent-ink"
              : "border-line text-ink-muted hover:border-ink-faint"
          }`}
        >
          {s.failure ? "⚠ " : ""}
          {s.title}
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="ml-auto rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted hover:border-ink-faint"
      >
        {resetLabel}
      </button>
    </div>
  );
}
