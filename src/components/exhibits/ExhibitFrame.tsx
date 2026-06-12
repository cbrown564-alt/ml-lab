import Link from "next/link";
import type { ReactNode } from "react";
import { ConceptCheckSection } from "@/components/assessment/ConceptCheckSection";
import { MasteryBadge } from "@/components/learner/MasteryBadge";
import { NarratedSection } from "@/components/narrative/NarratedSection";
import { RecordVisit } from "@/components/learner/RecordVisit";
import type { ConceptCheck } from "@/lib/assessment/schema";
import type { ExhibitNarrative } from "@/lib/narrative/schema";
import { domainLabel, kindLabel } from "@/lib/graph/labels";
import { audioManifests } from "@content/exhibits/audio";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import { journeys } from "@content/journeys/foundations";
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
  narrative,
  check,
  children,
}: {
  nodeId: string;
  /** The exhibit's opening prose — the one part of the chrome that is content. */
  lede: ReactNode;
  narrative?: ExhibitNarrative;
  check?: ConceptCheck;
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

  // Journey continuation (docs/06, A4): an exhibit that is a journey stop
  // offers the next stop at the bottom — the linear path stays one click
  // away without ever being imposed.
  const journey = journeys.find((j) => j.stops.some((s) => s.nodeId === nodeId));
  const stopIndex = journey
    ? journey.stops.findIndex((s) => s.nodeId === nodeId)
    : -1;
  const nextStop =
    journey && stopIndex >= 0 && stopIndex + 1 < journey.stops.length
      ? lookup.get(journey.stops[stopIndex + 1].nodeId)
      : undefined;

  return (
    <main className="mx-auto w-full max-w-5xl px-8 py-16">
      <nav className="mb-10 text-sm">
        <Link href="/" className="text-ink-faint transition-colors hover:text-ink-muted">
          ← ML Lab
        </Link>
      </nav>

      <RecordVisit nodeId={nodeId} />

      <p className="font-mono text-sm tracking-widest text-ink-faint uppercase">
        {domainLabel(node.domain)} · {kindLabel(node.kind)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">{node.title}</h1>
        <MasteryBadge nodeId={nodeId} />
      </div>
      <div className="mt-4 max-w-[65ch] text-lg leading-relaxed text-ink-muted">{lede}</div>

      {narrative && (
        <div className="mt-10 max-w-[65ch] border-l-2 border-line pl-6">
          <NarratedSection
            tone="hook"
            paragraphs={narrative.hook}
            audio={audioManifests[nodeId]?.sections.find((s) => s.id === "hook")}
          />
        </div>
      )}

      <div className="mt-10">{children}</div>

      {narrative && (
        <section className="mt-14">
          {narrative.story.map((s) => (
            <div key={s.id} className="mt-10 first:mt-0">
              <h2 className="text-2xl font-semibold tracking-tight">{s.heading}</h2>
              <NarratedSection
                tone="story"
                paragraphs={s.paragraphs}
                audio={audioManifests[nodeId]?.sections.find((a) => a.id === s.id)}
              />
            </div>
          ))}
        </section>
      )}

      {check && <ConceptCheckSection check={check} />}

      {narrative && narrative.fieldNotes.length > 0 && (
        <section className="mt-12 border-t border-line pt-8">
          <h2 className="text-sm font-medium tracking-wide text-ink-faint uppercase">
            Field notes
          </h2>
          <ul className="mt-4 max-w-[65ch]">
            {narrative.fieldNotes.map((note, i) => (
              <li
                key={i}
                className="mt-3 border-l-2 border-line pl-4 text-sm leading-relaxed text-ink-muted first:mt-0"
              >
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

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

      {journey && (
        <section className="mt-12 rounded-xl border border-line bg-raised p-6">
          <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
            Journey · {journey.title} · stop {stopIndex + 1} of {journey.stops.length}
          </p>
          {nextStop ? (
            isLive(nextStop.id) ? (
              <p className="mt-3">
                <Link
                  href={liveExhibits[nextStop.id].href}
                  className="font-medium text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2"
                >
                  Continue the journey: {nextStop.title} →
                </Link>
                <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                  {nextStop.oneLiner}
                </span>
              </p>
            ) : (
              <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
                The next stop, <span className="font-medium text-ink">{nextStop.title}</span>,
                isn&apos;t open yet —{" "}
                <Link href="/#map" className="text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2">
                  browse the map
                </Link>{" "}
                for an open door, or wander the connections below.
              </p>
            )
          ) : (
            <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-ink-muted">
              This is the journey&apos;s final stop.{" "}
              <Link href="/#map" className="text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2">
                Back to the map
              </Link>{" "}
              to pick your next territory.
            </p>
          )}
        </section>
      )}

      <p className="mt-10 max-w-[65ch] text-sm leading-relaxed text-ink-faint">
        Still to come for this exhibit: the math drawer. The experiment above
        is the real thing — the same implementation our tests verify against
        scikit-learn.
      </p>
    </main>
  );
}
