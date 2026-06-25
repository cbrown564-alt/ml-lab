"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExhibitGlyph } from "@/components/graph/ExhibitGlyph";
import { MasteryDot } from "@/components/learner/MasteryDot";

/**
 * The atlas as a museum of jewels (homepages/SYNTHESIS.md, after Seeing Theory's
 * chapter circles + neal.fun's variety): every exhibit is a deep gem-plate
 * holding its own luminous glyph. Two pieces of structure replace the messy
 * resting lines the diagram had:
 *   1. the collection is organised into labelled *wings* — a deliberate learning
 *      progression, so the grouping is explicit and the order is not a scatter;
 *   2. hovering a jewel lights the exhibits it connects to and tags each with
 *      its relationship (needed first / leads to / related), so the graph is
 *      legible without drawing a single line.
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
    <div className="space-y-14" onMouseLeave={() => setActive(null)}>
      {wings.map((wing) => (
        <section key={wing.title} className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <header className="lg:w-56 lg:shrink-0 lg:pt-5 lg:text-right">
            <h3 className="font-mono text-xs font-semibold tracking-[0.16em] text-ink uppercase">
              {wing.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-balance text-ink-faint">
              {wing.blurb}
            </p>
          </header>

          <ul className="flex flex-wrap justify-center gap-x-7 gap-y-8 lg:justify-start">
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
                  <span className="mt-3.5 block text-sm leading-snug font-medium tracking-tight text-balance">
                    {j.title}
                  </span>
                  {/* one reserved caption line so hover never shifts layout */}
                  <span className="mt-1 block h-4 text-xs font-medium">
                    {isActive ? (
                      <span className="jewel-enter-now text-accent">Enter →</span>
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
                  className="jewel w-36 text-center"
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
