"use client";

import Link from "next/link";
import { recommendNext } from "@/lib/learner/recommend";
import { useLearner, type MasteryLevel } from "@/lib/learner/store";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import { foundations, journeys } from "@content/journeys/foundations";

/**
 * The Foundations trail (docs/06, A1/A2) — the homepage's closer, and the
 * deliberate opposite of the cabinet above it. The cabinet is spatial ("what's
 * here, how it connects"); the trail is temporal ("where I start, where I am,
 * what's next"). It absorbs the old standalone "Your next step": the lit
 * station IS the recommendation, with its one-sentence why right below.
 *
 * Self-contained like the rest of the front door's learner UI: it reads the
 * graph/journey content and the local mastery model directly. Before the
 * learner model rehydrates, mastery is empty — so it renders the honest
 * cold-start trail (nothing done, start at the beginning) and upgrades in
 * place once IndexedDB answers.
 */

const nodeById = new Map(nodes.map((n) => [n.id, n]));
const liveIds = new Set(nodes.filter((n) => isLive(n.id)).map((n) => n.id));

const DONE: ReadonlySet<MasteryLevel> = new Set(["assessed", "mastered"]);
const STARTED: ReadonlySet<MasteryLevel> = new Set(["seen", "practiced"]);

// Station labels for the rail: the full titles are too long to sit under a
// dot, so each stop gets a glance-able short form. The link's accessible name
// stays the full title (aria-label), so screen readers and tests read the real
// name — the short label is purely visual.
const SHORT: Record<string, string> = {
  "what-is-ml": "What is ML?",
  "the-dataset": "The Dataset",
  "regression-task": "Regression",
  "linear-regression": "Linear Reg.",
  "loss-functions": "Loss",
  "gradient-descent": "Gradient",
  "feature-scaling": "Scaling",
  "train-test-generalization": "Train / Test",
  "bias-variance": "Bias / Var.",
  "data-leakage": "Leakage",
  "overfitting-regularization": "Overfitting",
  "classification-task": "Classification",
  "logistic-regression": "Logistic Reg.",
  "neural-network-fundamentals": "Neural Nets",
};

export function FoundationsTrail() {
  const mastery = useLearner((s) => s.mastery);
  const levelOf = (id: string): MasteryLevel => mastery[id]?.level ?? "untouched";

  const stops = foundations.stops;
  const total = stops.length;
  const doneCount = stops.filter((s) => DONE.has(levelOf(s.nodeId))).length;

  // The lit station is the recommendation. Reuse the explainable recommender
  // (the reason IS the recommendation) and take its first pick that lives on
  // this trail — so "finish what you started" still wins even if it sits
  // before untouched stops (free roam: you can start in the middle).
  const recs = recommendNext({ nodes, edges, journeys, mastery, liveIds });
  const recOnTrail = recs.find((r) => stops.some((s) => s.nodeId === r.nodeId));

  // Fallback when no recommendation lands on the trail: the earliest open stop
  // that isn't finished yet. Null means the whole trail is behind you.
  const fallbackStop =
    recOnTrail == null
      ? stops.find((s) => liveIds.has(s.nodeId) && !DONE.has(levelOf(s.nodeId)))
      : undefined;

  const nextId = recOnTrail?.nodeId ?? fallbackStop?.nodeId ?? null;
  const nextNode = nextId ? nodeById.get(nextId)! : null;
  const nextStop = nextId ? stops.find((s) => s.nodeId === nextId) : undefined;
  const reason =
    recOnTrail?.reason ?? (nextNode ? nextStop?.framing ?? nextNode.oneLiner : null);
  const verb = nextId
    ? STARTED.has(levelOf(nextId))
      ? "Resume"
      : doneCount > 0
        ? "Continue"
        : "Start"
    : null;

  return (
    <section id="foundations" className="scroll-mt-8 border-t border-line py-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-sm tracking-widest text-ink-faint uppercase">
          Journey · {foundations.title}
        </h2>
        <span className="font-mono text-xs tracking-widest text-ink-faint tabular-nums">
          {doneCount} / {total} done
        </span>
      </div>
      <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-muted">
        {foundations.description}
      </p>

      {/* The progress rail: a left-to-right line of stations. Done stops carry
          the accent, the lit one is your next move, the rest wait. The line is
          uniformly faint — progress is honest per-station, not a single fill,
          because the trail can be walked out of order. Scrolls on narrow
          screens; settles across the column on wide ones. */}
      <ol className="mt-10 flex items-start overflow-x-auto pb-2">
        {stops.map((stop, i) => {
          const node = nodeById.get(stop.nodeId)!;
          const level = levelOf(node.id);
          const done = DONE.has(level);
          const current = node.id === nextId;
          const href = liveExhibits[node.id].href;
          return (
            <li
              key={stop.nodeId}
              data-node-id={node.id}
              data-mastery={level}
              className="flex min-w-[4.75rem] flex-1 flex-col items-center"
            >
              <Link
                href={href}
                aria-label={node.title}
                className="group flex w-full flex-col items-center focus:outline-none"
              >
                <span className="relative flex w-full items-center justify-center py-1">
                  {/* connector segments — hidden at the two ends of the line */}
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="absolute top-1/2 left-0 h-px w-1/2 -translate-y-1/2 bg-line"
                    />
                  )}
                  {i < total - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-1/2 right-0 h-px w-1/2 -translate-y-1/2 bg-line"
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums transition-colors ${
                      current
                        ? "border-accent bg-surface text-accent ring-4 ring-accent/20"
                        : done
                          ? "border-accent bg-accent text-accent-ink"
                          : "border-line bg-surface text-ink-faint group-hover:border-ink-faint"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                </span>
                <span
                  className={`mt-2 min-h-[2.25rem] max-w-[5.5rem] text-center text-[11px] leading-tight transition-colors ${
                    current
                      ? "font-medium text-ink"
                      : done
                        ? "text-ink-muted"
                        : "text-ink-faint group-hover:text-ink-muted"
                  }`}
                >
                  {SHORT[node.id] ?? node.title}
                  {stop.optional ? (
                    <span className="mt-0.5 block text-[10px] text-ink-faint">
                      optional
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* The lit station, restated as the one thing to do next — the old "Your
          next step" section, now the trail's conclusion. */}
      {nextNode ? (
        <div
          role="region"
          aria-label="Your next step"
          className="mt-12 max-w-xl border-l-2 border-accent pl-6"
        >
          <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
            Your next step
          </p>
          <Link
            href={liveExhibits[nextNode.id].href}
            className="mt-2 inline-block text-2xl font-semibold tracking-tight text-ink transition-colors hover:text-accent"
          >
            {nextNode.title}
          </Link>
          <p className="mt-2 leading-relaxed text-ink-muted">{reason}</p>
          <Link
            href={liveExhibits[nextNode.id].href}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
          >
            {verb} →
          </Link>
        </div>
      ) : (
        <div
          role="region"
          aria-label="Your next step"
          className="mt-12 max-w-xl border-l-2 border-accent pl-6"
        >
          <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
            Trail complete
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            You&rsquo;ve walked every stop.
          </p>
          <p className="mt-2 leading-relaxed text-ink-muted">
            That&rsquo;s the whole Foundations trail behind you. Wander back through
            the cabinet, or follow a connection somewhere new.
          </p>
          <a
            href="#exhibits"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
          >
            Back to the cabinet →
          </a>
        </div>
      )}
    </section>
  );
}
