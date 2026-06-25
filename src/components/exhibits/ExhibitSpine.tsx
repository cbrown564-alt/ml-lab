"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useActHandoffOptional } from "@/components/exhibits/ActHandoffContext";

/**
 * The exhibit's spine — the product promise made structural: See it · Run it ·
 * Break it · Explain it. Not a row of tabs but a guided four-act journey the
 * learner advances through (the report's 20-minute choreography): form the mental
 * model, inspect the implementation, learn what breaks, prove transfer.
 *
 * Each act mounts on first visit and stays mounted (hidden) thereafter, so a
 * detour never loses an act's state and only the opening act is in the server
 * HTML (the per-route budget stays honest, C5). Advance by the numbered rail, by
 * Back/Next, or by arrow keys while the rail holds focus.
 */

export type ExhibitAct = {
  id: string;
  /** The verb — "See it", "Run it", "Break it", "Explain it". */
  label: string;
  /** The one-line purpose of this act ("form the mental model"). */
  purpose: string;
  content: ReactNode;
};

export function ExhibitSpine({ acts }: { acts: ExhibitAct[] }) {
  const [active, setActive] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = acts.length;
  const handoff = useActHandoffOptional();

  const go = (i: number, focusTab = false) => {
    const next = Math.max(0, Math.min(count - 1, i));
    setVisited((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
    setActive(next);
    handoff?.setActiveAct(acts[next].id);
    if (focusTab) tabRefs.current[next]?.focus();
  };

  // Arrow keys step the spine, but only while focus is inside the rail, so they
  // never collide with a plot's own arrow-key point nudging (WAI-ARIA tabs).
  const onRailKey = (e: KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    go(active + delta, true);
  };

  return (
    <div>
      <nav
        role="tablist"
        aria-label="The four ways through this exhibit: see it, run it, break it, explain it"
        aria-orientation="horizontal"
        onKeyDown={onRailKey}
        className="chrome-spine-rail grid grid-cols-1 gap-x-3 gap-y-2 border-y border-line py-1 sm:grid-cols-2 lg:grid-cols-4"
      >
        {acts.map((act, i) => {
          const state = i === active ? "active" : visited.has(i) ? "visited" : "ahead";
          return (
            <button
              key={act.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${baseId}-tab-${act.id}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`${baseId}-panel-${act.id}`}
              aria-label={`${act.label} — ${act.purpose}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => go(i)}
              className={`group flex items-start gap-3 rounded-lg border-l-2 px-3 py-3.5 text-left transition-colors ${
                state === "active"
                  ? "border-accent bg-raised"
                  : "border-transparent hover:bg-raised"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs tabular-nums ${
                  state === "active"
                    ? "bg-accent text-accent-ink"
                    : state === "visited"
                      ? "bg-ink-faint text-surface"
                      : "border border-line text-ink-faint"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-sm font-semibold tracking-tight ${
                    state === "active" ? "text-ink" : "text-ink-muted group-hover:text-ink"
                  }`}
                >
                  {act.label}
                </span>
                <span className="chrome-spine-purpose mt-0.5 block text-[13px] leading-snug text-ink-faint">
                  {act.purpose}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* The journey affordance — position in the walk and how to advance. */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="font-mono text-xs tracking-widest text-ink-faint uppercase tabular-nums">
          Act {active + 1} / {count} · {acts[active].label}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            className="rounded-full border border-line px-3.5 py-1.5 text-sm whitespace-nowrap text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            disabled={active === count - 1}
            className="rounded-full border border-line px-3.5 py-1.5 text-sm whitespace-nowrap text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {active < count - 1 ? `Next: ${acts[active + 1].label} →` : "Next →"}
          </button>
        </div>
      </div>

      {acts.map((act, i) =>
        visited.has(i) ? (
          <div
            key={act.id}
            id={`${baseId}-panel-${act.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${act.id}`}
            hidden={i !== active}
            className="pt-10"
            data-act-panel={act.id}
          >
            {act.content}
          </div>
        ) : null,
      )}
    </div>
  );
}
