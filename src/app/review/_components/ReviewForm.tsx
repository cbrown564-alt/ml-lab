"use client";

import { useMemo, useState } from "react";
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

/**
 * The rubric v2 scoring form (docs/08 Part 3) — rendered straight off the schema
 * so the form and the build can never drift. The human scores each register
 * sub-dimension against a named exemplar frame, walks the hero/assessment
 * checklists, writes what's wrong, and renders a verdict; the live blocker
 * preview shows what's keeping the exhibit below flagship as they go.
 */

export type ReviewFormInitial = {
  register: { dimension: RegisterDimensionKey; score: number; exemplarFrame: string; note: string }[];
  hero: HeroSpec;
  assessment: AssessmentForm;
  verdict: Verdict;
  notes: string;
  decisions: string;
};

type RegState = Record<RegisterDimensionKey, { score: number; exemplarFrame: string; note: string }>;

const SCORES = [0, 1, 2, 3, 4] as const;

export function ReviewForm({
  exhibit,
  initial,
  exemplars,
}: {
  exhibit: string;
  initial: ReviewFormInitial;
  exemplars: string[];
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
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [issues, setIssues] = useState<string[]>([]);

  // A live, schema-true preview of what's blocking flagship as the human scores.
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

  async function save() {
    setState("saving");
    setIssues([]);
    const scorecard = {
      register: REGISTER_DIMENSIONS.map((d) => ({
        dimension: d.key,
        score: register[d.key].score,
        exemplarFrame: register[d.key].exemplarFrame,
        note: register[d.key].note || undefined,
      })),
      hero,
      assessment,
      verdict: { decision, blocking: splitLines(blocking), summary: summary || undefined },
    };
    const res = await fetch("/review/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ exhibit, scorecard, notes }),
    });
    if (res.ok) {
      setState("saved");
    } else {
      const body = await res.json().catch(() => ({}));
      setIssues((body.issues ?? []).map((i: { path?: unknown[]; message: string }) =>
        `${(i.path ?? []).join(".")}: ${i.message}`,
      ));
      setState("error");
    }
  }

  return (
    <section className="mt-14 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight">Scorecard · rubric v2</h2>
      <p className="mt-2 max-w-[68ch] text-sm text-ink-muted">
        Each register score is judged against a <strong>named exemplar frame</strong> — a score
        with no frame is rejected by the schema (§1e). Floors are ≥3; the requirement is delight,
        so 2 is not a passing grade.
      </p>

      {/* §1a — Visual register, decomposed */}
      <h3 className="mt-8 font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
        Visual register §1a
      </h3>
      <div className="mt-4 space-y-5">
        {REGISTER_DIMENSIONS.map((d) => {
          const row = register[d.key];
          const below = row.score < registerFloor(d.key);
          return (
            <div key={d.key} className="rounded-lg border border-line p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-ink">
                  {d.label}
                  {d.delight && (
                    <span className="ml-2 rounded bg-sunken px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-ink-faint uppercase">
                      delight
                    </span>
                  )}
                </span>
                <span className="font-mono text-xs text-ink-faint">floor {d.floor}</span>
              </div>
              <p className="mt-1 max-w-[72ch] text-sm text-ink-muted">{d.question}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex gap-1" role="group" aria-label={`${d.label} score`}>
                  {SCORES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={row.score === s}
                      title={SCORE_SCALE[s]}
                      onClick={() => setRegister((r) => ({ ...r, [d.key]: { ...r[d.key], score: s } }))}
                      className={`h-8 w-8 rounded-md border text-sm tabular-nums transition-colors ${
                        row.score === s
                          ? below
                            ? "border-error-viz bg-error-viz text-surface"
                            : "border-accent bg-accent text-accent-ink"
                          : "border-line text-ink-muted hover:border-ink-faint"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <select
                  aria-label={`${d.label} exemplar frame`}
                  value={row.exemplarFrame}
                  onChange={(e) =>
                    setRegister((r) => ({ ...r, [d.key]: { ...r[d.key], exemplarFrame: e.target.value } }))
                  }
                  className="min-w-0 flex-1 rounded-md border border-line bg-raised px-2 py-1.5 font-mono text-xs text-ink-muted"
                >
                  {[row.exemplarFrame, ...exemplars.filter((x) => x !== row.exemplarFrame)].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <input
                value={row.note}
                placeholder="verdict sentence — what holds the score here"
                onChange={(e) => setRegister((r) => ({ ...r, [d.key]: { ...r[d.key], note: e.target.value } }))}
                className="mt-3 w-full rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
              />
            </div>
          );
        })}
      </div>

      {/* §1b hero + §1c assessment */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChecklistCard
          title="Hero spec §1b"
          subtitle="An exhibit without a passing hero cannot be flagship."
          items={HERO_CHECKS}
          values={hero as unknown as Record<string, boolean>}
          onToggle={(k) => setHero((h) => ({ ...h, [k as HeroCheckKey]: !h[k as HeroCheckKey] }))}
        />
        <ChecklistCard
          title="Assessment form §1c"
          subtitle="A pure MCQ stack is an automatic B5 fail."
          items={ASSESSMENT_CHECKS}
          values={assessment as unknown as Record<string, boolean>}
          onToggle={(k) =>
            setAssessment((a) => ({ ...a, [k as AssessmentCheckKey]: !a[k as AssessmentCheckKey] }))
          }
        />
      </div>

      {/* Freeform notes.md, pinned to the work */}
      <h3 className="mt-8 font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
        Notes — what&apos;s wrong (notes.md)
      </h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Pin each note to a frame/dimension: 'see-spine.png — the bowl is too harsh; aliasing on the contour at this zoom.'"
        className="mt-3 w-full rounded-lg border border-line bg-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint"
      />

      {/* Verdict */}
      <h3 className="mt-8 font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">Verdict</h3>
      <div className="mt-3 flex gap-2">
        {(["advance", "hold"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDecision(d)}
            aria-pressed={decision === d}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
              decision === d ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-muted hover:border-ink-faint"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <textarea
        value={blocking}
        onChange={(e) => setBlocking(e.target.value)}
        rows={3}
        placeholder="Blocking items, one per line (if holding)."
        className="mt-3 w-full rounded-lg border border-line bg-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint"
      />
      <input
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="One-line verdict summary (optional)"
        className="mt-3 w-full rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint"
      />

      {/* Live flagship preview off the same predicates the build uses */}
      <div className="mt-6 rounded-lg border border-line bg-sunken p-4 text-sm">
        <p className="font-medium text-ink">
          Flagship preview:{" "}
          {completeness.complete && blockers.length === 0 ? (
            <span className="text-truth">clears every floor and gate ✓</span>
          ) : (
            <span className="text-error-viz">blocked</span>
          )}
        </p>
        {!completeness.complete && (
          <p className="mt-1 text-ink-muted">Incomplete: {completeness.missing.join(", ")}</p>
        )}
        {blockers.length > 0 && (
          <ul className="mt-1 list-disc pl-5 text-ink-muted">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={state === "saving"}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "Saving…" : "Save verdict"}
        </button>
        {state === "saved" && <span className="text-sm text-truth">Saved to docs/reviews/feedback/{exhibit}/</span>}
        {state === "error" && <span className="text-sm text-error-viz">Rejected — see issues below</span>}
      </div>
      {issues.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-error-viz">
          {issues.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ChecklistCard({
  title,
  subtitle,
  items,
  values,
  onToggle,
}: {
  title: string;
  subtitle: string;
  items: readonly { key: string; label: string; mechanizable: boolean }[];
  values: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="rounded-lg border border-line p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-xs text-ink-faint">{subtitle}</p>
      <ul className="mt-3 space-y-2">
        {items.map((c) => (
          <li key={c.key}>
            <label className="flex items-start gap-2 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={values[c.key] === true}
                onChange={() => onToggle(c.key)}
                className="mt-0.5"
              />
              <span>
                {c.label}
                {c.mechanizable && (
                  <span className="ml-1.5 font-mono text-[10px] tracking-wide text-ink-faint uppercase">
                    auto
                  </span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function splitLines(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
