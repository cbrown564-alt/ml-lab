import Link from "next/link";
import type { ReactNode } from "react";
import { ConceptCheckSection, type CheckNext } from "@/components/assessment/ConceptCheckSection";
import { ExhibitSpine, type ExhibitAct } from "@/components/exhibits/ExhibitSpine";
import { FailureGallery } from "@/components/exhibits/FailureGallery";
import { MathView } from "@/components/exhibits/MathView";
import { SpecimenPlacard } from "@/components/exhibits/SpecimenPlacard";
import { StoryStepper } from "@/components/exhibits/StoryStepper";
import { RecordVisit } from "@/components/learner/RecordVisit";
import type { ConceptCheck } from "@/lib/assessment/schema";
import type { Beat, BeatView } from "@/lib/exhibit/spine";
import type { ExhibitNarrative } from "@/lib/narrative/schema";
import type { FailureGallery as FailureGalleryContent } from "@/lib/failure/schema";
import type { MathDrawerContent } from "@/lib/narrative/math";
import { audioManifests } from "@content/exhibits/audio";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import { journeys } from "@content/journeys/foundations";

/**
 * Exhibit page template. The page is organised around the product promise made
 * structural — a guided four-act spine the learner advances through (the report's
 * 20-minute choreography), not a pile of tabs:
 *
 *   ① See it      form the mental model — the guided visual story (StoryStepper).
 *   ② Run it      inspect the implementation — the open bench + the same model's
 *                 mechanism (the maths), coordinated representations of one state.
 *   ③ Break it    learn the operating envelope — the structured failure gallery.
 *   ④ Explain it  prove transfer — the concept check, closing on the whiteboard.
 *
 * The specimen masthead orients (where this sits in the graph) and the journey
 * coda advances; between them runs the spine. The page supplies its lede, its
 * narrative + spine beats, its guided `story` graphic, and its full `experiment`.
 */

/** The four modes' purpose lines — lab-wide, so the promise reads identically
 * on every page. */
const ACT_PURPOSE = {
  see: "Form the mental model",
  run: "Inspect the implementation",
  break: "Learn the operating envelope",
  explain: "Prove transfer",
} as const;

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
  experimentLede,
  failures,
  breakIt,
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
  /**
   * The Experiment view's framing line. Each exhibit names what's actually on
   * its bench (so the copy never promises a code mode the lab doesn't have).
   * Optional — defaults to the scenario/knobs framing every lab shares.
   */
  experimentLede?: ReactNode;
  /**
   * The failure gallery: structured failure cards (docs/07-failure-taxonomy) —
   * the field guide that backs the Break-it act.
   */
  failures?: FailureGalleryContent;
  /**
   * The interactive Break-it lab: a live, guided failure loop the learner drives
   * (trigger → symptom → diagnose → repair). It leads the Break-it act, with the
   * `failures` cards as the field guide beneath. Optional — without it the act
   * falls back to the cards alone. This is the report's differentiating surface.
   */
  breakIt?: ReactNode;
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
    .filter((e) => e.to === nodeId && e.type === "requires")
    .map((e) => lookup.get(e.from)!);
  const unlocks = edges
    .filter((e) => e.from === nodeId && e.type === "requires")
    .map((e) => lookup.get(e.to)!);
  // Lateral relationships carry the misconception/comparison the learner most
  // needs (the typed graph explaining *why*, not just *what*): surface them with
  // their note so the neighbourhood teaches rather than merely links.
  const RELATED_TYPES = new Set(["often_confused_with", "alternative_to"]);
  const related = edges
    .filter((e) => RELATED_TYPES.has(e.type) && (e.from === nodeId || e.to === nodeId))
    .map((e) => {
      const neighbor = e.from === nodeId ? e.to : e.from;
      return { node: lookup.get(neighbor)!, type: e.type, note: e.note };
    });

  const journey = journeys.find((j) => j.stops.some((s) => s.nodeId === nodeId));
  const stopIndex = journey
    ? journey.stops.findIndex((s) => s.nodeId === nodeId)
    : -1;
  const nextStop =
    journey && stopIndex >= 0 && stopIndex + 1 < journey.stops.length
      ? lookup.get(journey.stops[stopIndex + 1].nodeId)
      : undefined;

  // The stepper is the page's main event and its end; field notes close the walk
  // as its final "In the wild" step rather than scrolling below it.
  const storyView = (
    <StoryStepper beats={beats} graphic={story} fieldNotes={narrative.fieldNotes} />
  );

  // Run it — inspect the implementation. The open bench leads (drive it, and read
  // it back as code where the lab offers that), then the same model's mechanism in
  // maths: coordinated representations of one canonical state, not separate views.
  const runView = (
    <div>
      <div className="max-w-[68ch]">
        <p className="text-lg leading-relaxed text-ink-muted">
          {experimentLede ?? (
            <>
              Guardrails off. Switch scenarios, build your own data, and turn the
              knobs — the same instrument from the story, now yours to push past
              where the walk-through stopped. Then read the very same model as the
              maths underneath it.
            </>
          )}
        </p>
      </div>
      <div className="mt-6">{experiment}</div>
      {math && (
        <div className="mt-14 border-t border-line pt-12">
          <MathView math={math} />
        </div>
      )}
    </div>
  );

  // Where the exhibit leads, surfaced as the Check's closing payoff. A live
  // next stop links straight on; a locked one (or a finished journey) routes
  // back to the map.
  const checkNext: CheckNext | undefined = journey
    ? nextStop
      ? {
          title: nextStop.title,
          href: isLive(nextStop.id) ? liveExhibits[nextStop.id].href : "/#map",
          live: isLive(nextStop.id),
        }
      : { title: "the map", href: undefined, live: false }
    : undefined;

  // The four-act spine. See it and Run it are always present; Break it and Explain
  // it appear when the exhibit carries a failure gallery / a concept check.
  const acts: ExhibitAct[] = [
    { id: "see", label: "See it", purpose: ACT_PURPOSE.see, content: storyView },
    { id: "run", label: "Run it", purpose: ACT_PURPOSE.run, content: runView },
    ...(breakIt || failures
      ? [
          {
            id: "break",
            label: "Break it",
            purpose: ACT_PURPOSE.break,
            content: (
              <div>
                <div className="max-w-[68ch]">
                  <p className="text-lg leading-relaxed text-ink-muted">
                    A concept isn&apos;t yours until you know its operating envelope.
                    Drive it past the edge with your own hands, watch exactly how it
                    breaks, name the cause, then repair it — the loop that turns a
                    fact into intuition.
                  </p>
                </div>
                {breakIt && <div className="mt-6">{breakIt}</div>}
                {failures && (
                  <div className={breakIt ? "mt-16 border-t border-line pt-12" : "mt-6"}>
                    <FailureGallery gallery={failures} asFieldGuide={!!breakIt} />
                  </div>
                )}
              </div>
            ),
          },
        ]
      : []),
    ...(check
      ? [
          {
            id: "explain",
            label: "Explain it",
            purpose: ACT_PURPOSE.explain,
            content: (
              <div className="max-w-[68ch]">
                <ConceptCheckSection
                  check={check}
                  nodeTitle={node.title}
                  next={checkNext}
                />
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
          related={related}
          journey={
            journey
              ? { title: journey.title, stopIndex, count: journey.stops.length }
              : undefined
          }
        />
      </header>

      {/* The spine: the product promise made structural. The learner works the
          exhibit in four passes — see it, run it, break it, explain it. */}
      <div className="mt-14">
        <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
          Work it in four passes
        </p>
        <div className="mt-4">
          <ExhibitSpine acts={acts} />
        </div>
      </div>

      {/* The coda is the forward motion — where to go next, as one thin strip so
          the story (above) stays the page's main event. Where this sits in the
          graph is the placard's job, up in the masthead. */}
      {journey && (
        <section className="mt-16 flex flex-col gap-2 border-t border-line pt-5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
            Journey · {journey.title} · stop {stopIndex + 1} of {journey.stops.length}
          </p>
          <p className="text-ink-muted">
            {nextStop ? (
              isLive(nextStop.id) ? (
                <Link
                  href={liveExhibits[nextStop.id].href}
                  className="font-medium text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2"
                >
                  Continue: {nextStop.title} →
                </Link>
              ) : (
                <>
                  Next: <span className="text-ink">{nextStop.title}</span>
                  {" isn’t open yet — "}
                  <Link
                    href="/#map"
                    className="text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2"
                  >
                    browse the map →
                  </Link>
                </>
              )
            ) : (
              <>
                Journey complete —{" "}
                <Link
                  href="/#map"
                  className="text-accent underline decoration-1 underline-offset-4 transition-colors hover:decoration-2"
                >
                  back to the map →
                </Link>
              </>
            )}
          </p>
        </section>
      )}
    </main>
  );
}
