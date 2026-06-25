"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MicroSpecimen } from "@/components/graph/MicroSpecimen";
import { MasteryDot } from "@/components/learner/MasteryDot";

/**
 * The atlas as a gallery of live micro-specimens (homepages/SYNTHESIS.md): every
 * exhibit is a warm diagrammatic preview in the lab's viz grammar. Hovering lights
 * graph connections; navigation intent morphs the specimen toward its hero motion.
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
                    className="jewel-plate jewel-specimen relative grid aspect-square w-full place-items-center overflow-hidden p-3"
                    data-active={isActive || undefined}
                    data-linked={isLinked || undefined}
                    data-intent={isActive || undefined}
                  >
                    <MicroSpecimen
                      id={j.id}
                      intent={isActive}
                      className={`h-[78%] w-[78%] transition-transform duration-300 ease-out ${isActive ? "scale-110" : ""}`}
                    />
                    <MasteryDot nodeId={j.id} />
                  </span>
                  <span className="mt-3 block h-9 overflow-hidden text-center text-[13px] leading-snug font-medium tracking-tight text-balance">
                    {j.title}
                  </span>
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
