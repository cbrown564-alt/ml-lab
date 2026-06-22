"use client";

import { useId, useRef, useState, type ReactNode } from "react";

/**
 * The exhibit as distinct, switchable views (Stream 2, iteration 2). The guided
 * Story, the formal Math, the open Experiment, and the Check are each designed
 * full-width for their own purpose, so the page never snaps mid-scroll from a
 * widescreen hero into a narrow column — you move between coherent views, not
 * through mismatched sections.
 *
 * Views mount on first visit and stay mounted (hidden) thereafter: switching is
 * instant and a view's state survives a detour to another. Only the default
 * view is in the server HTML, so the per-route budget stays honest (C5).
 */

export type ExhibitViewDef = { id: string; label: string; content: ReactNode };

export function ExhibitShell({ views }: { views: ExhibitViewDef[] }) {
  const [active, setActive] = useState(views[0]?.id);
  // Which views have been opened (so they stay mounted, hidden, after a detour).
  // State, not a ref: it decides what renders, so it must be read during render.
  const [visited, setVisited] = useState<Set<string | undefined>>(
    () => new Set([views[0]?.id]),
  );
  const tabsId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    setActive(id);
  };

  // Roving arrow-key navigation across the tablist (WAI-ARIA tabs pattern).
  const onKeyDown = (i: number) => (e: React.KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + views.length) % views.length;
    tabRefs.current[next]?.focus();
    select(views[next].id);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Ways into this exhibit"
        className="flex flex-wrap gap-1 border-b border-line"
      >
        {views.map((v, i) => {
          const selected = v.id === active;
          return (
            <button
              key={v.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${tabsId}-tab-${v.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${tabsId}-panel-${v.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(v.id)}
              onKeyDown={onKeyDown(i)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                selected
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-faint hover:text-ink-muted"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {views.map((v) =>
        visited.has(v.id) ? (
          <div
            key={v.id}
            id={`${tabsId}-panel-${v.id}`}
            role="tabpanel"
            aria-labelledby={`${tabsId}-tab-${v.id}`}
            hidden={v.id !== active}
            className="pt-10"
          >
            {v.content}
          </div>
        ) : null,
      )}
    </div>
  );
}
