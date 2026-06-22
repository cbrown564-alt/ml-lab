import Link from "next/link";
import type { ReactNode } from "react";
import { ConceptCheckSection } from "@/components/assessment/ConceptCheckSection";
import { ExhibitShell, type ExhibitViewDef } from "@/components/exhibits/ExhibitShell";
import { MathView } from "@/components/exhibits/MathView";
import { SpecimenPlacard } from "@/components/exhibits/SpecimenPlacard";
import { StoryScroller } from "@/components/exhibits/StoryScroller";
import { RecordVisit } from "@/components/learner/RecordVisit";
import type { ConceptCheck } from "@/lib/assessment/schema";
import type { Beat, BeatView } from "@/lib/exhibit/spine";
import type { ExhibitNarrative } from "@/lib/narrative/schema";
import type { MathDrawerContent } from "@/lib/narrative/math";
import { audioManifests } from "@content/exhibits/audio";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import { journeys } from "@content/journeys/foundations";

/**
 * Exhibit page template (Stream 2, iteration 2). An exhibit is a set of distinct,
 * switchable views — never a hero that snaps into a narrow appendix:
 *
 *   Story       guided scrollytelling; the graphic is scroll-driven, the prose
 *               explains, interaction is minimal and direct.
 *   Math        the formal treatment, composed as its own act.
 *   Experiment  the open sandbox — every scenario, paint your own data, code.
 *   Check       the capstone.
 *
 * The masthead and the graph coda frame all of them. The page supplies its lede,
 * its narrative + spine, its guided `story` graphic, and its full `experiment`.
 */

export function ExhibitFrame({
  nodeId,
  lede,
  promise,
  hero,
  narrative,
  spine,
  math,
  check,
  story,
  experiment,
}: {
  nodeId: string;
  /** The exhibit's opening prose — the one part of the chrome that is content. */
  lede: ReactNode;
  /**
   * A one-line promise of the payoff — what the learner will walk away knowing,
   * stated as a hook (often the failure mode this exhibit teaches). It turns the
   * masthead's lower-left from dead space into invitation. Optional.
   */
  promise?: ReactNode;
  /**
   * The specimen hero: a wide, ambient portrait of the live object that leads
   * the masthead, so the learner meets the thing before its catalogue tag.
   * Optional — an exhibit without one keeps the title-led masthead.
   */
  hero?: ReactNode;
  narrative: ExhibitNarrative;
  /** The ordered beats that drive the guided graphic. */
  spine: Beat<unknown>[];
  math?: MathDrawerContent;
  check?: ConceptCheck;
  /** The guided graphic for the Story view (reads its per-beat frame). */
  story: ReactNode;
  /** The full interactive sandbox for the Experiment view. */
  experiment: ReactNode;
}) {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`ExhibitFrame: no graph node with id "${nodeId}"`);

  // Join the spine's framing with the prose + audio it narrates over.
  const sections = new Map<string, { heading?: string; paragraphs: string[] }>();
  sections.set("hook", { paragraphs: narrative.hook });
  for (const s of narrative.story) {
    sections.set(s.id, { heading: s.heading, paragraphs: s.paragraphs });
  }
  const audio = audioManifests[nodeId];
  const beats: BeatView<unknown>[] = spine.map((beat) => {
    const section = sections.get(beat.sectionId);
    if (!section) {
      throw new Error(
        `ExhibitFrame: spine beat "${beat.sectionId}" has no matching narrative section`,
      );
    }
    return {
      ...beat,
      heading: section.heading,
      paragraphs: section.paragraphs,
      audio: audio?.sections.find((a) => a.id === beat.sectionId),
    };
  });

  const lookup = new Map(nodes.map((n) => [n.id, n]));
  const buildsOn = edges
    .filter((e) => e.to === nodeId && e.type === "prerequisite")
    .map((e) => lookup.get(e.from)!);
  const unlocks = edges
    .filter((e) => e.from === nodeId && (e.type === "prerequisite" || e.type === "sequel"))
    .map((e) => lookup.get(e.to)!);

  const journey = journeys.find((j) => j.stops.some((s) => s.nodeId === nodeId));
  const stopIndex = journey
    ? journey.stops.findIndex((s) => s.nodeId === nodeId)
    : -1;
  const nextStop =
    journey && stopIndex >= 0 && stopIndex + 1 < journey.stops.length
      ? lookup.get(journey.stops[stopIndex + 1].nodeId)
      : undefined;

  const storyView = (
    <div>
      <StoryScroller beats={beats} graphic={story} />
      {narrative.fieldNotes.length > 0 && (
        <section className="mt-20 max-w-[68ch] border-t border-line pt-8">
          <h2 className="text-sm font-medium tracking-wide text-ink-faint uppercase">
            Field notes
          </h2>
          <ul className="mt-4">
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
    </div>
  );

  const experimentView = (
    <div>
      <div className="max-w-[68ch]">
        <h2 className="text-xl font-semibold tracking-tight">Experiment freely</h2>
        <p className="mt-2 leading-relaxed text-ink-muted">
          Guardrails off — switch scenarios, build your own data, turn the knobs,
          or run the verified model as code.
        </p>
      </div>
      <div className="mt-6">{experiment}</div>
    </div>
  );

  const views: ExhibitViewDef[] = [
    { id: "story", label: "Story", content: storyView },
    ...(math ? [{ id: "math", label: "Math", content: <MathView math={math} /> }] : []),
    { id: "experiment", label: "Experiment", content: experimentView },
    ...(check
      ? [
          {
            id: "check",
            label: "Check",
            content: (
              <div className="max-w-[68ch]">
                <ConceptCheckSection check={check} />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8">
      <nav className="mb-10 text-sm">
        <Link href="/" className="text-ink-faint transition-colors hover:text-ink-muted">
          ← ML Lab
        </Link>
      </nav>

      <RecordVisit nodeId={nodeId} />

      {/* The specimen leads. A wide, ambient portrait of the live object opens
          the exhibit before any chrome — you meet the thing, then read its tag. */}
      {hero && <div className="mb-10">{hero}</div>}

      {/* Masthead: under the specimen, the title and the placard sit as a pair —
          the exhibit's name and its catalogue record, orienting the learner in
          the knowledge graph before the interactive. */}
      <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:items-start lg:gap-12">
        <div className="max-w-[58ch]">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            {node.title}
          </h1>
          <div className="mt-5 text-lg leading-relaxed text-ink-muted">{lede}</div>
          {promise && (
            <p className="mt-6 border-l-2 border-accent pl-4 text-[15px] leading-relaxed text-ink">
              {promise}
            </p>
          )}
        </div>
        <SpecimenPlacard
          node={node}
          buildsOn={buildsOn}
          leadsTo={unlocks}
          journey={
            journey
              ? { title: journey.title, stopIndex, count: journey.stops.length }
              : undefined
          }
        />
      </header>

      <div className="mt-12">
        <ExhibitShell views={views} />
      </div>

      {/* The coda is the forward motion — where to go next. Where this sits in
          the graph is the placard's job, up in the masthead. */}
      <div className="mt-24 max-w-[68ch]">
        {journey && (
          <section className="rounded-xl border border-line bg-raised p-6">
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
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  The next stop, <span className="font-medium text-ink">{nextStop.title}</span>,
                  isn&apos;t open yet —{" "}
                  <Link href="/#map" className="text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2">
                    browse the map
                  </Link>{" "}
                  for an open door, or follow the connections in the record above.
                </p>
              )
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                This is the journey&apos;s final stop.{" "}
                <Link href="/#map" className="text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2">
                  Back to the map
                </Link>{" "}
                to pick your next territory.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
