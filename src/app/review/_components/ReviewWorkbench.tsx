"use client";
/* eslint-disable @next/next/no-img-element -- dev-only review tool streaming local
   capture/exemplar PNGs of arbitrary size; next/image optimization is wrong here. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ASSESSMENT_CHECKS,
  HERO_CHECKS,
  REGISTER_DIMENSIONS,
  RUBRIC_VERSION,
  SCORE_SCALE,
  flagshipBlockers,
  registerFloor,
  scorecardComplete,
  type AssessmentCheckKey,
  type AssessmentForm,
  type HeroCheckKey,
  type HeroSpec,
  type RegisterDimensionKey,
  type Scorecard,
  type Verdict,
} from "@content/quality/rubric";
import { exemplarUrl, frameUrl } from "../_lib/frame-url";

/**
 * The review workbench (docs/08 Part 3, /review v2). The first cut stacked a
 * 10k-px contact sheet on top of the scorecard, so every comparison meant
 * scrolling the evidence out of view to reach the control. This is the fix: a
 * **sticky evidence stage** beside a compact scorecard, where the evidence
 * follows attention — focusing a register dimension swaps the pinned exemplar (and
 * the relevant captured surface) into the stage right next to the score buttons.
 * Autosave persists the same payload the old form did, so the on-disk contract the
 * linter + brief read is unchanged.
 */

export type CaptureFrameView = {
  /** docs-relative capture path, e.g. "reviews/captures/<id>/<date>/see-viewport.png". */
  file: string;
  surface: string;
  label: string;
  /** the paired benchmark "<slug>/<file>.png" from the manifest. */
  exemplar: string;
};

export type ReviewWorkbenchInitial = {
  register: { dimension: RegisterDimensionKey; score: number; exemplarFrame: string; note: string }[];
  hero: HeroSpec;
  assessment: AssessmentForm;
  verdict: Verdict;
  notes: string;
};

type RegState = Record<RegisterDimensionKey, { score: number; exemplarFrame: string; note: string }>;
type FocusKey = RegisterDimensionKey | "hero" | "assessment" | null;

const SCORES = [0, 1, 2, 3, 4] as const;

/** Which captured surface best evidences each dimension, so focusing it shows the
 * most relevant frame without the reviewer hunting through the filmstrip. */
const DIMENSION_SURFACE: Record<RegisterDimensionKey, string> = {
  "annotation-integration": "see",
  "hero-as-protagonist": "hero",
  "mechanism-in-the-picture": "hero",
  "colour-discipline": "break",
  "atmosphere-finish": "see",
  motion: "run",
};

export function ReviewWorkbench({
  exhibit,
  frames,
  exemplars,
  initial,
}: {
  exhibit: string;
  frames: CaptureFrameView[];
  exemplars: string[];
  initial: ReviewWorkbenchInitial;
}) {
  const [register, setRegister] = useState<RegState>(() =>
    Object.fromEntries(
      initial.register.map((r) => [r.dimension, { score: r.score, exemplarFrame: r.exemplarFrame, note: r.note }]),
    ) as RegState,
  );
  const [hero, setHero] = useState<HeroSpec>(initial.hero);
  const [assessment, setAssessment] = useState<AssessmentForm>(initial.assessment);
  const [decision, setDecision] = useState<Verdict["decision"]>(initial.verdict.decision);
  const [blocking, setBlocking] = useState(initial.verdict.blocking.join("\n"));
  const [summary, setSummary] = useState(initial.verdict.summary ?? "");
  const [notes, setNotes] = useState(initial.notes);

  const [focus, setFocus] = useState<FocusKey>(REGISTER_DIMENSIONS[0].key);
  const [stageFile, setStageFile] = useState<string>(() => {
    // Land on the frame the initially-focused dimension evidences, so the stage
    // and the open row agree from the first paint (not just after the first click).
    const surface = DIMENSION_SURFACE[REGISTER_DIMENSIONS[0].key];
    return (pickSurface(frames, surface) ?? pickSurface(frames, "hero"))?.file ?? frames[0]?.file ?? "";
  });
  // The stage shows ONE large image at a time — the thing you're judging — and you
  // flip between your capture and the benchmark. Big enough to actually evaluate,
  // no second image stealing half the width.
  const [view, setView] = useState<"capture" | "benchmark">("capture");
  const [fullscreen, setFullscreen] = useState(false);

  /* ---- the evidence stage: captured frame ↔ benchmark, following attention ---- */
  const captured = frames.find((f) => f.file === stageFile) ?? frames[0] ?? null;
  const benchmark = useMemo(() => {
    if (focus && focus !== "hero" && focus !== "assessment") return register[focus].exemplarFrame;
    return captured?.exemplar ?? initial.register[0]?.exemplarFrame ?? "";
  }, [focus, register, captured, initial.register]);

  // Focusing a section pulls the most relevant captured surface into the stage and
  // snaps back to "your capture" — the thing being scored — so it's always the
  // default view; the benchmark is one click away.
  const focusOn = useCallback(
    (key: FocusKey) => {
      setFocus(key);
      setView("capture");
      const surface =
        key === "hero" ? "hero" : key === "assessment" ? "explain" : key ? DIMENSION_SURFACE[key] : null;
      if (surface) {
        const f = pickSurface(frames, surface);
        if (f) setStageFile(f.file);
      }
    },
    [frames],
  );

  /* ---- save: autosave the exact payload the route handler validated before ---- */
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedAt, setSavedAt] = useState<string>("");
  const [issues, setIssues] = useState<string[]>([]);
  const firstRun = useRef(true);

  const buildScorecard = useCallback(
    () => ({
      register: REGISTER_DIMENSIONS.map((d) => ({
        dimension: d.key,
        score: register[d.key].score,
        exemplarFrame: register[d.key].exemplarFrame,
        note: register[d.key].note || undefined,
      })),
      hero,
      assessment,
      verdict: { decision, blocking: splitLines(blocking), summary: summary || undefined },
    }),
    [register, hero, assessment, decision, blocking, summary],
  );

  const save = useCallback(async () => {
    setSaveState("saving");
    setIssues([]);
    try {
      const res = await fetch("/review/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ exhibit, scorecard: buildScorecard(), notes }),
      });
      if (res.ok) {
        setSaveState("saved");
        setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } else {
        const body = await res.json().catch(() => ({}));
        setIssues(
          (body.issues ?? []).map(
            (i: { path?: unknown[]; message: string }) => `${(i.path ?? []).join(".")}: ${i.message}`,
          ),
        );
        setSaveState("error");
      }
    } catch {
      setSaveState("error");
    }
  }, [exhibit, buildScorecard, notes]);

  // Debounced autosave on any change (skips the mount run so opening a page never
  // writes a file). The schema accepts a partial card, so drafts persist safely.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setSaveState("saving");
    const t = setTimeout(() => void save(), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, hero, assessment, decision, blocking, summary, notes]);

  /* ---- keyboard: 0–4 score the focused dimension, j/k move between them ---- */
  const orderedKeys = REGISTER_DIMENSIONS.map((d) => d.key);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFullscreen(false);
        return;
      }
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      // b/f flip and zoom the stage — judge at size with the hands on the keys.
      if (e.key === "b") {
        e.preventDefault();
        setView((v) => (v === "capture" ? "benchmark" : "capture"));
        return;
      }
      if (e.key === "f") {
        e.preventDefault();
        setFullscreen((z) => !z);
        return;
      }
      if (!focus || focus === "hero" || focus === "assessment") return;
      if (e.key >= "0" && e.key <= "4") {
        e.preventDefault();
        const s = Number(e.key);
        setRegister((r) => ({ ...r, [focus]: { ...r[focus], score: s } }));
      } else if (e.key === "j" || e.key === "k") {
        // j moves up the list, k moves down. Scroll the new row into view so the
        // direction is visible even when the focused row is below the fold.
        e.preventDefault();
        const i = orderedKeys.indexOf(focus);
        const next = e.key === "j" ? orderedKeys[i - 1] : orderedKeys[i + 1];
        if (next) {
          focusOn(next);
          requestAnimationFrame(() =>
            document.querySelector(`[data-dim="${next}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
          );
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, focusOn]);

  /* ---- live flagship preview off the same predicates the build uses ---- */
  const draft = useMemo<Scorecard>(
    () => ({
      schemaVersion: RUBRIC_VERSION,
      exhibit,
      reviewer: "human",
      date: "2026-01-01",
      contentHash: "draft",
      register: REGISTER_DIMENSIONS.map((d) => ({
        dimension: d.key,
        score: register[d.key].score as Scorecard["register"][number]["score"],
        exemplarFrame: register[d.key].exemplarFrame || "unpinned/0.png",
        note: register[d.key].note || undefined,
      })),
      hero,
      assessment,
      verdict: { decision, blocking: splitLines(blocking), summary: summary || undefined },
    }),
    [exhibit, register, hero, assessment, decision, blocking, summary],
  );
  const completeness = scorecardComplete(draft);
  const blockers = flagshipBlockers(draft);
  const clears = completeness.complete && blockers.length === 0;

  const showingBenchmark = view === "benchmark";
  const stageSrc = showingBenchmark ? exemplarUrl(benchmark) : captured ? frameUrl(captured.file) : "";
  const stageCaption = showingBenchmark ? `benchmark · ${benchmark}` : (captured?.label ?? "");

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
      {/* ───────────────────────── Evidence stage (sticky) ───────────────────── */}
      <div className="lg:sticky lg:top-6">
        {frames.length > 0 && captured ? (
          <>
            {/* capture ↔ benchmark — one big image, flipped with a toggle (or 'b') */}
            <div className="flex items-center justify-between gap-3 pb-2">
              <div className="inline-flex rounded-full border border-line p-0.5 text-sm">
                <button
                  type="button"
                  onClick={() => setView("capture")}
                  aria-pressed={!showingBenchmark}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    !showingBenchmark ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Your capture
                </button>
                <button
                  type="button"
                  onClick={() => setView("benchmark")}
                  aria-pressed={showingBenchmark}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    showingBenchmark ? "bg-ink text-surface" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Benchmark
                </button>
              </div>
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                title="Fullscreen (f)"
                className="rounded border border-line px-2 py-1 font-mono text-[10px] tracking-wide uppercase transition-colors hover:border-ink-faint hover:text-ink"
              >
                fullscreen ⤢
              </button>
            </div>

            {/* the big image — ~60% of the screen, fit to view, no second image
                stealing half the width. Click to go fullscreen. */}
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className={`block w-full overflow-hidden rounded-lg border bg-sunken ${
                showingBenchmark ? "border-dashed border-line" : "border-line"
              }`}
            >
              <img
                src={stageSrc}
                alt={stageCaption}
                className="max-h-[72vh] w-full cursor-zoom-in object-contain"
              />
              <span
                className={`block truncate border-t border-line px-3 py-1.5 text-left text-xs ${
                  showingBenchmark ? "font-mono text-ink-faint" : "text-ink-muted"
                }`}
              >
                {stageCaption}
              </span>
            </button>

            {/* surface filmstrip — which captured frame is on the stage */}
            <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
              {frames.map((f) => (
                <button
                  key={f.file}
                  type="button"
                  onClick={() => {
                    setStageFile(f.file);
                    setView("capture");
                  }}
                  title={f.label}
                  className={`group shrink-0 overflow-hidden rounded-md border transition-colors ${
                    f.file === stageFile && !showingBenchmark
                      ? "border-accent"
                      : "border-line hover:border-ink-faint"
                  }`}
                >
                  <img src={frameUrl(f.file)} alt={f.label} className="h-12 w-20 object-cover object-top" />
                  <span
                    className={`block px-1 py-0.5 text-center font-mono text-[9px] capitalize ${
                      f.file === stageFile && !showingBenchmark ? "text-ink" : "text-ink-faint"
                    }`}
                  >
                    {f.surface}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-ink-faint">
              {focus && focus !== "hero" && focus !== "assessment"
                ? "benchmark follows the focused dimension"
                : "benchmark is this surface's pairing"}{" "}
              · <span className="font-mono">b</span> flips, <span className="font-mono">f</span> fullscreen
            </p>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-sunken p-6 text-sm text-ink-faint">
            No capture yet — run{" "}
            <code className="font-mono text-ink-muted">npm run capture:review -- {exhibit}</code> with the
            dev server up, then refresh. You can still score against the pinned benchmarks below.
          </div>
        )}
      </div>

      {/* ───────────────────────────── Scorecard ────────────────────────────── */}
      <div>
        <SectionLabel>Visual register §1a — floors ≥3 (2 is not a passing grade)</SectionLabel>
        <div className="mt-3 space-y-1.5">
          {REGISTER_DIMENSIONS.map((d) => {
            const row = register[d.key];
            const below = row.score < registerFloor(d.key);
            const open = focus === d.key;
            return (
              <div
                key={d.key}
                data-dim={d.key}
                className={`rounded-lg border transition-colors ${
                  open ? "border-accent/60 bg-sunken" : "border-line"
                }`}
              >
                <button
                  type="button"
                  onClick={() => focusOn(open ? null : d.key)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      below ? "bg-error-viz" : row.score >= registerFloor(d.key) ? "bg-truth" : "bg-line"
                    }`}
                    aria-hidden
                  />
                  <span className="flex-1 text-sm font-medium text-ink">
                    {d.label}
                    {d.delight && (
                      <span className="ml-2 rounded bg-raised px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-ink-faint uppercase">
                        delight
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-mono text-xs tabular-nums ${below ? "text-error-viz" : "text-ink-muted"}`}
                  >
                    {row.score}
                    <span className="text-ink-faint">/4</span>
                  </span>
                </button>

                {open && (
                  <div className="border-t border-line px-3 py-3">
                    <p className="max-w-[60ch] text-xs text-ink-muted">{d.question}</p>
                    <div className="mt-2.5 flex gap-1.5" role="group" aria-label={`${d.label} score`}>
                      {SCORES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={row.score === s}
                          title={SCORE_SCALE[s]}
                          onClick={() => setRegister((r) => ({ ...r, [d.key]: { ...r[d.key], score: s } }))}
                          className={`h-9 flex-1 rounded-md border text-sm tabular-nums transition-colors ${
                            row.score === s
                              ? s < registerFloor(d.key)
                                ? "border-error-viz bg-error-viz text-surface"
                                : "border-accent bg-accent text-accent-ink"
                              : "border-line text-ink-muted hover:border-ink-faint"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 font-mono text-[10px] text-ink-faint">
                      keys 0–4 · {SCORE_SCALE[row.score as 0 | 1 | 2 | 3 | 4]}
                    </p>
                    <input
                      value={row.note}
                      placeholder="what holds the score here — one sentence"
                      onChange={(e) =>
                        setRegister((r) => ({ ...r, [d.key]: { ...r[d.key], note: e.target.value } }))
                      }
                      className="mt-2.5 w-full rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
                    />
                    <details className="mt-2">
                      <summary className="cursor-pointer font-mono text-[10px] tracking-wide text-ink-faint uppercase">
                        benchmark · {row.exemplarFrame}
                      </summary>
                      <select
                        aria-label={`${d.label} exemplar frame`}
                        value={row.exemplarFrame}
                        onChange={(e) =>
                          setRegister((r) => ({ ...r, [d.key]: { ...r[d.key], exemplarFrame: e.target.value } }))
                        }
                        className="mt-1.5 w-full rounded-md border border-line bg-raised px-2 py-1.5 font-mono text-xs text-ink-muted"
                      >
                        {[row.exemplarFrame, ...exemplars.filter((x) => x !== row.exemplarFrame)].map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hero + assessment — compact toggle cards that also drive the stage */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ChecklistCard
            title="Hero §1b"
            active={focus === "hero"}
            onFocus={() => focusOn("hero")}
            items={HERO_CHECKS}
            values={hero as unknown as Record<string, boolean>}
            onToggle={(k) => setHero((h) => ({ ...h, [k as HeroCheckKey]: !h[k as HeroCheckKey] }))}
          />
          <ChecklistCard
            title="Assessment §1c"
            active={focus === "assessment"}
            onFocus={() => focusOn("assessment")}
            items={ASSESSMENT_CHECKS}
            values={assessment as unknown as Record<string, boolean>}
            onToggle={(k) =>
              setAssessment((a) => ({ ...a, [k as AssessmentCheckKey]: !a[k as AssessmentCheckKey] }))
            }
          />
        </div>

        {/* Notes */}
        <SectionLabel className="mt-6">Notes — what&apos;s wrong (notes.md)</SectionLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Pin each note to a frame: 'see-spine.png — the bowl is too harsh; aliasing on the contour at this zoom.'"
          className="mt-2 w-full rounded-lg border border-line bg-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint"
        />

        {/* Verdict */}
        <SectionLabel className="mt-6">Verdict</SectionLabel>
        <div className="mt-2 flex gap-2">
          {(["advance", "hold"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDecision(d)}
              aria-pressed={decision === d}
              className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
                decision === d
                  ? d === "advance"
                    ? "border-truth bg-truth text-surface"
                    : "border-accent bg-accent text-accent-ink"
                  : "border-line text-ink-muted hover:border-ink-faint"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        {decision === "hold" && (
          <textarea
            value={blocking}
            onChange={(e) => setBlocking(e.target.value)}
            rows={3}
            placeholder="Blocking items, one per line."
            className="mt-2 w-full rounded-lg border border-line bg-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint"
          />
        )}
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One-line verdict summary (optional)"
          className="mt-2 w-full rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
        />

        {/* Live flagship preview */}
        <div className="mt-4 rounded-lg border border-line bg-sunken p-3 text-sm">
          <p className="font-medium text-ink">
            Flagship preview:{" "}
            {clears ? (
              <span className="text-truth">clears every floor and gate ✓</span>
            ) : (
              <span className="text-error-viz">blocked</span>
            )}
          </p>
          {!completeness.complete && (
            <p className="mt-1 text-xs text-ink-muted">Incomplete: {completeness.missing.join(", ")}</p>
          )}
          {blockers.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs text-ink-muted">
              {blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </div>
        {issues.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm text-error-viz">
            {issues.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Always-visible save status — autosave means the verdict is never lost */}
      <SaveStatus state={saveState} savedAt={savedAt} onRetry={save} />

      {/* Fullscreen viewer — the whole frame at maximum size, still flippable */}
      {fullscreen && captured && (
        <FullscreenViewer
          src={stageSrc}
          caption={stageCaption}
          showingBenchmark={showingBenchmark}
          onView={setView}
          onClose={() => setFullscreen(false)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function FullscreenViewer({
  src,
  caption,
  showingBenchmark,
  onView,
  onClose,
}: {
  src: string;
  caption: string;
  showingBenchmark: boolean;
  onView: (v: "capture" | "benchmark") => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90" onClick={onClose}>
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-flex rounded-full border border-white/20 p-0.5">
          <button
            type="button"
            onClick={() => onView("capture")}
            className={`rounded-full px-3 py-1 transition-colors ${
              !showingBenchmark ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Your capture
          </button>
          <button
            type="button"
            onClick={() => onView("benchmark")}
            className={`rounded-full px-3 py-1 transition-colors ${
              showingBenchmark ? "bg-white text-black" : "text-white/70 hover:text-white"
            }`}
          >
            Benchmark
          </button>
        </div>
        <span className="truncate font-mono text-xs text-white/60">{caption}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-white/20 px-3 py-1 font-mono text-[10px] tracking-wide text-white/80 uppercase transition-colors hover:border-white/50 hover:text-white"
        >
          close (esc)
        </button>
      </div>
      <div className="flex-1 overflow-auto px-4 pb-4" onClick={onClose}>
        <img
          src={src}
          alt={caption}
          onClick={(e) => e.stopPropagation()}
          className="mx-auto w-auto max-w-full"
        />
      </div>
    </div>
  );
}

function ChecklistCard({
  title,
  active,
  onFocus,
  items,
  values,
  onToggle,
}: {
  title: string;
  active: boolean;
  onFocus: () => void;
  items: readonly { key: string; label: string; mechanizable: boolean }[];
  values: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const passed = items.every((c) => values[c.key] === true);
  return (
    <div
      onClick={onFocus}
      className={`rounded-lg border p-3 transition-colors ${active ? "border-accent/60 bg-sunken" : "border-line"}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className={`font-mono text-[10px] tracking-wide uppercase ${passed ? "text-truth" : "text-error-viz"}`}>
          {passed ? "pass" : "fail"}
        </span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((c) => (
          <li key={c.key}>
            <label className="flex items-start gap-2 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={values[c.key] === true}
                onChange={() => onToggle(c.key)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5"
              />
              <span>
                {c.label}
                {c.mechanizable && (
                  <span className="ml-1 font-mono text-[9px] tracking-wide text-ink-faint uppercase">auto</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SaveStatus({
  state,
  savedAt,
  onRetry,
}: {
  state: "idle" | "saving" | "saved" | "error";
  savedAt: string;
  onRetry: () => void;
}) {
  return (
    <div className="fixed right-4 bottom-4 z-50">
      {state === "saving" && (
        <span className="rounded-full border border-line bg-raised px-3 py-1.5 text-xs text-ink-muted shadow-sm">
          Saving…
        </span>
      )}
      {state === "saved" && (
        <span className="rounded-full border border-truth/40 bg-raised px-3 py-1.5 text-xs text-truth shadow-sm">
          Saved {savedAt} · the loop reads this back
        </span>
      )}
      {state === "error" && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-error-viz bg-raised px-3 py-1.5 text-xs text-error-viz shadow-sm"
        >
          Save failed — retry
        </button>
      )}
    </div>
  );
}

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`font-mono text-xs tracking-[0.18em] text-ink-faint uppercase ${className}`}>{children}</h2>
  );
}

function pickSurface(frames: CaptureFrameView[], surface: string): CaptureFrameView | undefined {
  // Prefer a viewport/hero frame over the tall full-page capture for the stage.
  const inSurface = frames.filter((f) => f.surface === surface);
  return (
    inSurface.find((f) => /viewport|hero/.test(f.file)) ?? inSurface[0]
  );
}

function splitLines(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
