import Link from "next/link";
import { notFound } from "next/navigation";
import { nodes } from "@content/graph/nodes";
import {
  REGISTER_DIMENSIONS,
  isHeroJudged,
  registerBreaches,
  type RegisterDimensionKey,
} from "@content/quality/rubric";
import { slotForDimension, type DecisionSlot } from "@content/quality/decisions";
import {
  DEFAULT_DIMENSION_EXEMPLAR,
  contentHash,
  detectAssessment,
  detectHeroPresent,
  isLive,
  latestCaptureDate,
  listExemplarFrames,
  listVariantFrames,
  readAgentScorecard,
  readDecisions,
  readManifest,
  readScorecard,
  readTextDoc,
  reviewExhibits,
} from "../_lib/store";
import {
  ReviewWorkbench,
  type CaptureFrameView,
  type ReviewWorkbenchInitial,
} from "../_components/ReviewWorkbench";
import { DecisionsPanel } from "../_components/DecisionsPanel";

export const dynamic = "force-dynamic";

export default async function ReviewExhibitPage({
  params,
}: {
  params: Promise<{ exhibit: string }>;
}) {
  const { exhibit } = await params;
  if (!isLive(exhibit)) notFound();

  const node = nodes.find((n) => n.id === exhibit);
  const date = latestCaptureDate(exhibit);
  const manifest = date ? readManifest(exhibit, date) : null;
  const scorecard = readScorecard(exhibit);
  const agentCard = readAgentScorecard(exhibit);
  // The defensible baseline the form opens on: a human verdict if one exists,
  // otherwise the adversarial panel's prediction (docs/08 Part 4). Either way the
  // hero invariant has already bound it, so the scores are logical on arrival.
  const seed = scorecard ?? agentCard;
  const seededFrom: "human" | "agent-panel" | "defaults" = scorecard
    ? "human"
    : agentCard
      ? "agent-panel"
      : "defaults";
  const heroPresent = detectHeroPresent(exhibit);
  const assessment = detectAssessment(exhibit);
  const stale = scorecard ? scorecard.contentHash !== contentHash(exhibit) : false;
  const exemplars = listExemplarFrames();
  const variants = date ? listVariantFrames(exhibit, date) : [];

  // Roster nav + progress — so a 15-exhibit batch is one keyboard-light flow, not
  // a return trip to the index between every node.
  const roster = reviewExhibits();
  const idx = roster.findIndex((r) => r.id === exhibit);
  const prev = idx > 0 ? roster[idx - 1] : null;
  const next = idx >= 0 && idx < roster.length - 1 ? roster[idx + 1] : null;
  const reviewed = roster.filter((r) => r.hasScorecard && !r.scorecardStale).length;

  // Seed the form so the scores are LOGICAL on arrival (the user adjusts taste; the
  // baseline is never self-contradictory). Order of authority: a human verdict, then
  // the agent panel's prediction, then honest defaults. The defaults claim nothing
  // they can't: a hero-judged dim with no hero is forced to 0 (the invariant would
  // reject anything else), and an un-judged dim seeds to 2 — "competent", never the
  // flagship-clearing 3 that an unreviewed page hasn't earned.
  const initial: ReviewWorkbenchInitial = {
    register: REGISTER_DIMENSIONS.map((d) => {
      const existing = seed?.register.find((s) => s.dimension === d.key);
      const defaultScore = isHeroJudged(d.key) && !heroPresent ? 0 : 2;
      return {
        dimension: d.key as RegisterDimensionKey,
        score: existing?.score ?? defaultScore,
        exemplarFrame: existing?.exemplarFrame ?? DEFAULT_DIMENSION_EXEMPLAR[d.key],
        note: existing?.note ?? "",
      };
    }),
    hero: seed?.hero ?? {
      present: heroPresent,
      fullWidth: false,
      labeledAnnotation: false,
      depictsMechanism: false,
      thumbnailLegible: false,
      atMostOneLoadMotion: false,
    },
    assessment: seed?.assessment ?? {
      playableExperimentTask: assessment?.playableExperimentTask ?? false,
      transferIsInteractiveOrOpen: assessment?.transferIsInteractiveOrOpen ?? false,
      processFeedbackEveryOption: assessment?.processFeedbackEveryOption ?? false,
      notPureMcqStack: assessment?.notPureMcqStack ?? false,
    },
    verdict: seed?.verdict ?? { decision: "hold", blocking: [] },
    notes: readTextDoc(exhibit, "notes.md"),
    seededFrom,
    // The agent panel's per-dimension prediction, shown beside the human's score so
    // divergence is visible inline (only meaningful once a human card also exists).
    agentRegister:
      scorecard && agentCard
        ? Object.fromEntries(agentCard.register.map((s) => [s.dimension, s.score]))
        : null,
  };

  const frames: CaptureFrameView[] = (manifest?.frames ?? []).map((f) => ({
    file: f.file,
    surface: f.surface,
    label: f.label,
    exemplar: f.exemplar,
  }));

  // Decision slots are auto-derived where they're warranted: one per register
  // dimension that scored BELOW floor (that's where an alternative rendering earns
  // its keep), merged with any the loop or reviewer already populated. No decision
  // is forced on a dimension that already clears the bar.
  const persisted = readDecisions(exhibit);
  const breachDims = seed ? registerBreaches(seed).map((b) => b.dimension) : [];
  const byId = new Map<string, DecisionSlot>((persisted?.slots ?? []).map((s) => [s.id, s]));
  for (const dim of breachDims) {
    if (!byId.has(dim)) byId.set(dim, slotForDimension(dim));
  }
  // Order: below-floor slots first (in register order), then any free/legacy slots.
  const dimOrder = new Map(REGISTER_DIMENSIONS.map((d, i) => [d.key, i] as const));
  const slots = [...byId.values()].sort((a, b) => {
    const ai = a.dimension ? (dimOrder.get(a.dimension) ?? 99) : 100;
    const bi = b.dimension ? (dimOrder.get(b.dimension) ?? 99) : 100;
    return ai - bi;
  });
  const openDecisions = slots.filter((s) => s.chosen == null).length;

  return (
    <main>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{node?.title ?? exhibit}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            <span className="font-mono text-ink-faint">{exhibit}</span> · status{" "}
            <span className="text-ink">{node?.status}</span> · hero{" "}
            <span className={heroPresent ? "text-truth" : "text-error-viz"}>
              {heroPresent ? "present" : "absent (§1b blocker)"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {date ? (
            <span className="text-ink-faint">
              captured <span className="font-mono tabular-nums text-ink-muted">{date}</span>
              {scorecard && (
                <span className={stale ? "text-error-viz" : "text-truth"}>
                  {" · "}
                  {stale ? "verdict STALE" : "verdict in-date"}
                </span>
              )}
            </span>
          ) : (
            <span className="text-error-viz">no capture</span>
          )}
          <a
            href={`/exhibits/${exhibit}`}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            live page ↗
          </a>
        </div>
      </header>

      {/* Roster nav: where you are, where the finish line is, one click either way */}
      <nav className="mt-4 flex items-center justify-between border-y border-line py-2 text-sm">
        {prev ? (
          <Link href={`/review/${prev.id}`} className="text-ink-muted transition-colors hover:text-ink">
            ‹ {prev.title}
          </Link>
        ) : (
          <span className="text-line">‹ start of roster</span>
        )}
        <span className="font-mono text-xs text-ink-faint tabular-nums">
          {idx + 1} / {roster.length} · {reviewed} in-date
        </span>
        {next ? (
          <Link href={`/review/${next.id}`} className="text-ink-muted transition-colors hover:text-ink">
            {next.title} ›
          </Link>
        ) : (
          <span className="text-line">end of roster ›</span>
        )}
      </nav>

      <ReviewWorkbench exhibit={exhibit} frames={frames} exemplars={exemplars} initial={initial} />

      {/* "This, not that" is a secondary surface — present, but not in the way of
          the core scoring flow. Collapsed until a composition decision is being made;
          opens with one A/B slot per below-floor dimension to resolve. */}
      <details className="mt-12 border-t border-line pt-6" open={openDecisions > 0 && slots.some((s) => s.candidates.length > 0)}>
        <summary className="cursor-pointer text-sm font-medium text-ink-muted transition-colors hover:text-ink">
          Decisions — this, not that
          {slots.length > 0 && (
            <span className="ml-2 font-mono text-xs text-ink-faint">
              {openDecisions} open · {slots.length} slot(s)
            </span>
          )}
        </summary>
        <DecisionsPanel exhibit={exhibit} slots={slots} variants={variants} />
      </details>
    </main>
  );
}
