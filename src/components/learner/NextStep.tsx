"use client";

import Link from "next/link";
import { recommendNext } from "@/lib/learner/recommend";
import { useLearner } from "@/lib/learner/store";
import { useHydrated } from "@/lib/use-hydrated";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import { journeys } from "@content/journeys/foundations";

const liveIds = new Set(nodes.filter((n) => isLive(n.id)).map((n) => n.id));
const nodeById = new Map(nodes.map((n) => [n.id, n]));

/**
 * "Your next step" (docs/06, A2) — guidance that coexists with free roam.
 * Renders nothing for a cold visitor (the hero is the front door) and
 * nothing before hydration; every suggestion carries its one-sentence why.
 */
export function NextStep() {
  const hydrated = useHydrated();
  const mastery = useLearner((s) => s.mastery);

  if (!hydrated || Object.keys(mastery).length === 0) return null;

  const recs = recommendNext({ nodes, edges, journeys, mastery, liveIds });
  if (recs.length === 0) return null;

  return (
    <section aria-label="Your next step" className="border-t border-line py-10">
      <h2 className="font-mono text-sm tracking-widest text-ink-faint uppercase">
        Your next step
      </h2>
      <ul className="mt-5 flex flex-col gap-4 sm:flex-row sm:gap-10">
        {recs.map((rec) => {
          const node = nodeById.get(rec.nodeId)!;
          return (
            <li key={rec.nodeId} className="max-w-sm">
              <Link
                href={liveExhibits[rec.nodeId].href}
                className="font-medium text-accent transition-colors hover:underline"
              >
                {node.title} →
              </Link>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{rec.reason}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
