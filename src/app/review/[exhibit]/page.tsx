/* eslint-disable @next/next/no-img-element -- dev-only review tool streaming local
   capture/exemplar PNGs of arbitrary size; next/image optimization is wrong here. */
import { notFound } from "next/navigation";
import { nodes } from "@content/graph/nodes";
import { REGISTER_DIMENSIONS, type RegisterDimensionKey } from "@content/quality/rubric";
import { exemplarUrl, frameUrl } from "../_lib/frame-url";
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
  type CaptureFrame,
} from "../_lib/store";
import { ReviewForm, type ReviewFormInitial } from "../_components/ReviewForm";
import { DecisionsPanel } from "../_components/DecisionsPanel";

export const dynamic = "force-dynamic";

const SURFACE_ORDER = ["hero", "see", "run", "break", "explain"] as const;

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
  const hash = contentHash(exhibit);
  const stale = scorecard ? scorecard.contentHash !== hash : false;
  const exemplars = listExemplarFrames();
  const variants = date ? listVariantFrames(exhibit, date) : [];

  // Seed the form: a stored verdict is authoritative; otherwise pre-fill what the
  // machine already knows (hero presence, the assessment booleans) and the default
  // benchmark frame per dimension, leaving the taste calls to the human.
  const initial: ReviewFormInitial = {
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
    decisions: readTextDoc(exhibit, "decisions.md"),
  };

  const framesBySurface = new Map<string, CaptureFrame[]>();
  for (const f of manifest?.frames ?? []) {
    const arr = framesBySurface.get(f.surface) ?? [];
    arr.push(f);
    framesBySurface.set(f.surface, arr);
  }

  return (
    <main>
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{node?.title ?? exhibit}</h1>
          <p className="mt-2 text-sm text-ink-muted">
            <span className="font-mono text-ink-faint">{exhibit}</span> · status{" "}
            <span className="text-ink">{node?.status}</span> · hero{" "}
            <span className={heroPresent ? "text-truth" : "text-error-viz"}>
              {heroPresent ? "present" : "absent (§1b blocker)"}
            </span>
          </p>
        </div>
        <div className="text-right text-sm">
          {date ? (
            <p className="text-ink-muted">
              Captured <span className="font-mono tabular-nums text-ink">{date}</span>
            </p>
          ) : (
            <p className="text-error-viz">
              No capture — run{" "}
              <code className="font-mono">npm run capture:review -- {exhibit}</code>
            </p>
          )}
          {scorecard && (
            <p className={stale ? "text-error-viz" : "text-truth"}>
              Verdict {scorecard.date} · {stale ? "STALE (content changed)" : "in-date"}
            </p>
          )}
          <a
            href={`/exhibits/${exhibit}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            open live page ↗
          </a>
        </div>
      </header>

      {/* The contact sheet — each captured surface beside its pinned exemplar
          frame, so every comparison is on stored pixels, never memory (§1e). */}
      <section className="mt-10">
        <h2 className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
          Contact sheet · captured ↔ pinned exemplar
        </h2>
        {manifest ? (
          <div className="mt-5 space-y-10">
            {SURFACE_ORDER.filter((s) => framesBySurface.has(s)).map((surface) => (
              <div key={surface}>
                <h3 className="mb-3 text-sm font-semibold text-ink capitalize">{surface}</h3>
                <div className="space-y-6">
                  {framesBySurface.get(surface)!.map((f) => (
                    <div key={f.file} className="grid gap-4 lg:grid-cols-2">
                      <figure className="overflow-hidden rounded-lg border border-line bg-sunken">
                        <img src={frameUrl(f.file)} alt={f.label} className="w-full" />
                        <figcaption className="border-t border-line px-3 py-2 text-xs text-ink-muted">
                          {f.label}
                        </figcaption>
                      </figure>
                      <figure className="overflow-hidden rounded-lg border border-dashed border-line bg-sunken">
                        <img
                          src={exemplarUrl(f.exemplar)}
                          alt={f.exemplar}
                          className="w-full"
                        />
                        <figcaption className="border-t border-line px-3 py-2 font-mono text-xs text-ink-faint">
                          benchmark · {f.exemplar}
                        </figcaption>
                      </figure>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-faint">
            Capture this exhibit to populate the side-by-side.
          </p>
        )}
      </section>

      <ReviewForm exhibit={exhibit} initial={initial} exemplars={exemplars} />

      <DecisionsPanel exhibit={exhibit} variants={variants} initialDecisions={initial.decisions} />
    </main>
  );
}
