import Link from "next/link";
import { notFound } from "next/navigation";
import { nodes } from "@content/graph/nodes";
import { REGISTER_DIMENSIONS, type RegisterDimensionKey } from "@content/quality/rubric";
import {
  DEFAULT_DIMENSION_EXEMPLAR,
  contentHash,
  detectAssessment,
  detectHeroPresent,
  isLive,
  latestCaptureDate,
  listExemplarFrames,
  listVariantFrames,
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

  // Seed the form: a stored verdict is authoritative; otherwise pre-fill what the
  // machine already knows (hero presence, the assessment booleans) and the default
  // benchmark frame per dimension, leaving the taste calls to the human.
  const initial: ReviewWorkbenchInitial = {
    register: REGISTER_DIMENSIONS.map((d) => {
      const existing = scorecard?.register.find((s) => s.dimension === d.key);
      const defaultScore = d.key === "hero-as-protagonist" && !heroPresent ? 0 : 3;
      return {
        dimension: d.key as RegisterDimensionKey,
        score: existing?.score ?? defaultScore,
        exemplarFrame: existing?.exemplarFrame ?? DEFAULT_DIMENSION_EXEMPLAR[d.key],
        note: existing?.note ?? "",
      };
    }),
    hero: scorecard?.hero ?? {
      present: heroPresent,
      fullWidth: false,
      labeledAnnotation: false,
      depictsMechanism: false,
      thumbnailLegible: false,
      atMostOneLoadMotion: false,
    },
    assessment: scorecard?.assessment ?? {
      playableExperimentTask: assessment?.playableExperimentTask ?? false,
      transferIsInteractiveOrOpen: false,
      processFeedbackEveryOption: assessment?.processFeedbackEveryOption ?? false,
      notPureMcqStack: assessment?.notPureMcqStack ?? false,
    },
    verdict: scorecard?.verdict ?? { decision: "hold", blocking: [] },
    notes: readTextDoc(exhibit, "notes.md"),
  };

  const frames: CaptureFrameView[] = (manifest?.frames ?? []).map((f) => ({
    file: f.file,
    surface: f.surface,
    label: f.label,
    exemplar: f.exemplar,
  }));

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
          the core scoring flow. Collapsed until a composition decision is being made. */}
      <details className="mt-12 border-t border-line pt-6">
        <summary className="cursor-pointer text-sm font-medium text-ink-muted transition-colors hover:text-ink">
          Decisions — this, not that
          {variants.length > 0 && (
            <span className="ml-2 font-mono text-xs text-ink-faint">{variants.length} candidate frame(s)</span>
          )}
        </summary>
        <DecisionsPanel
          exhibit={exhibit}
          variants={variants}
          initialDecisions={readTextDoc(exhibit, "decisions.md")}
        />
      </details>
    </main>
  );
}
