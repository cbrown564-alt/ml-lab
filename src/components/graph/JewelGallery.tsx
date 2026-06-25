"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExhibitGlyph } from "@/components/graph/ExhibitGlyph";
import { MasteryDot } from "@/components/learner/MasteryDot";

/**
 * The atlas as a museum floor-plan (homepages/SYNTHESIS.md, after Seeing
 * Theory's chapter circles + neal.fun's variety): every exhibit is a deep
 * gem-plate holding its own luminous glyph. The wings run as side-by-side
 * *columns* so the whole collection reads in a single view — a deliberate
 * left→right progression (Groundwork → … → Going deeper), the grouping named at
 * the head of each column. No resting lines: hovering a jewel lights the
 * exhibits it connects to and tags each (needed first / leads to / related), so
 * the graph is legible without drawing one.
 */

export type Jewel = {
  id: string;
  title: string;
  domain: string;
  domainLabel: string;
  live: boolean;
  href: string | null;
};

export type Wing = { title: string; blurb: string; jewels: Jewel[] };
export type JewelEdge = { from: string; to: string; type: string };

export function JewelGallery({
  wings,
  edges,
}: {
  wings: Wing[];
  edges: JewelEdge[];
}) {
  const [active, setActive] = useState<string | null>(null);

  // For the hovered jewel: every connected exhibit and how it relates, read
  // from the hovered node's point of view (requires edges run prerequisite →
  // dependent). Memoised so a hover doesn't re-walk the edge list per jewel.
  const roles = useMemo(() => {
    const map = new Map<string, string>();
    if (!active) return map;
    for (const e of edges) {
      if (e.from === active) {
        map.set(e.to, e.type === "requires" ? "leads to" : "related");
      } else if (e.to === active) {
        map.set(e.from, e.type === "requires" ? "needed first" : "related");
      }
    }
    return map;
  }, [active, edges]);

  return (
    <div
      className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-4"
      onMouseLeave={() => setActive(null)}
    >
      {wings.map((wing) => (
        <section key={wing.title} className="flex flex-col">
          <header className="mb-5 border-t border-line pt-4 text-center">
            <h3 className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ink uppercase">
              {wing.title}
            </h3>
            {/* Two reserved lines (same rule as the titles) so a one-line blurb
                keeps an empty line beneath and the first jewel of every column
                lines up. */}
            <p className="mx-auto mt-2 block h-10 max-w-[22ch] overflow-hidden text-xs leading-relaxed text-balance text-ink-faint">
              {wing.blurb}
            </p>
          </header>

          <ul className="flex flex-col items-center gap-y-6">
            {wing.jewels.map((j) => {
              const isActive = active === j.id;
              const role = roles.get(j.id);
              const isLinked = active !== null && role !== undefined;
              const recede = active !== null && !isActive && !isLinked;

              const inner = (
                <>
                  <span
                    className="jewel-plate relative grid aspect-square w-full place-items-center"
                    data-active={isActive || undefined}
                    data-linked={isLinked || undefined}
                  >
                    <ExhibitGlyph id={j.id} className="h-[72%] w-[72%]" />
                    <MasteryDot nodeId={j.id} />
                  </span>
                  {/* Two lines of reserved height so every title block is the
                      same size and the jewels line up across rows and columns,
                      whether the title wraps to one line or two. */}
                  <span className="mt-3 block h-9 overflow-hidden text-center text-[13px] leading-snug font-medium tracking-tight text-balance">
                    {j.title}
                  </span>
                  {/* one reserved caption line so hover never shifts layout */}
                  <span className="mt-1 block h-4 text-[11px] font-medium">
                    {isActive ? (
                      <span className="text-accent">Enter →</span>
                    ) : isLinked ? (
                      <span className="font-mono tracking-wide text-ink-faint uppercase">
                        {role}
                      </span>
                    ) : (
                      <span className="jewel-enter text-accent">Enter →</span>
                    )}
                  </span>
                </>
              );

              return (
                <li
                  key={j.id}
                  className="jewel w-28 text-center"
                  style={{ opacity: recede ? 0.32 : 1 }}
                >
                  {j.live && j.href ? (
                    <Link
                      href={j.href}
                      aria-label={`${j.title} — ${j.domainLabel} exhibit`}
                      className="block rounded-2xl outline-none"
                      onMouseEnter={() => setActive(j.id)}
                      onFocus={() => setActive(j.id)}
                      onBlur={() => setActive(null)}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <span className="block" onMouseEnter={() => setActive(j.id)}>
                      {inner}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
