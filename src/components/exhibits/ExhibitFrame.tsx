import Link from "next/link";
import type { ReactNode } from "react";
import { domainLabel, kindLabel } from "@/lib/graph/labels";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import type { ConceptNode } from "@/lib/graph/schema";

/**
 * Exhibit page template — the standard chrome of every exhibit (docs/06, C1):
 * graph-driven kicker and title, the lede, the experiment island, and the
 * exhibit's place in the graph (what it builds on, what it unlocks). Pages
 * supply only what is theirs: the lede and the island.
 */

function NodeChip({ node }: { node: ConceptNode }) {
  return isLive(node.id) ? (
    <Link
      href={liveExhibits[node.id].href}
      title={node.oneLiner}
      className="rounded-full border border-accent px-3 py-1 text-sm text-accent transition-colors hover:bg-accent hover:text-accent-ink"
    >
      {node.title} →
    </Link>
  ) : (
    <span
      title={node.oneLiner}
      className="rounded-full border border-line bg-sunken px-3 py-1 text-sm text-ink-muted"
    >
      {node.title}
    </span>
  );
}

export function ExhibitFrame({
  nodeId,
  lede,
  children,
}: {
  nodeId: string;
  /** The exhibit's opening prose — the one part of the chrome that is content. */
  lede: ReactNode;
  children: ReactNode;
}) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`ExhibitFrame: no graph node with id "${nodeId}"`);

  const lookup = new Map(nodes.map((n) => [n.id, n]));
  const buildsOn = edges
    .filter((e) => e.to === nodeId && e.type === "prerequisite")
    .map((e) => lookup.get(e.from)!);
  const unlocks = edges
    .filter((e) => e.from === nodeId && (e.type === "prerequisite" || e.type === "sequel"))
    .map((e) => lookup.get(e.to)!);

  return (
    <main className="mx-auto w-full max-w-5xl px-8 py-16">
      <nav className="mb-10 text-sm">
        <Link href="/" className="text-ink-faint transition-colors hover:text-ink-muted">
          ← ML Lab
        </Link>
      </nav>

      <p className="font-mono text-sm tracking-widest text-ink-faint uppercase">
        {domainLabel(node.domain)} · {kindLabel(node.kind)}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{node.title}</h1>
      <div className="mt-4 max-w-[65ch] text-lg leading-relaxed text-ink-muted">{lede}</div>

      <div className="mt-10">{children}</div>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="sr-only">This exhibit in the knowledge graph</h2>
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-16">
          {buildsOn.length > 0 && (
            <div>
              <h3 className="text-sm font-medium tracking-wide text-ink-faint uppercase">
                Builds on
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {buildsOn.map((n) => (
                  <li key={n.id}>
                    <NodeChip node={n} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {unlocks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium tracking-wide text-ink-faint uppercase">
                Leads to
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {unlocks.map((n) => (
                  <li key={n.id}>
                    <NodeChip node={n} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <p className="mt-10 max-w-[65ch] text-sm leading-relaxed text-ink-faint">
        Exhibit under construction: narrative, audio, the math drawer, and
        concept checks are on their way. The experiment above is the real thing
        — the same implementation our tests verify against scikit-learn.
      </p>
    </main>
  );
}
