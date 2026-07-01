"use client";

import Link from "next/link";
import { recommendNext } from "@/lib/learner/recommend";
import { useLearner, type MasteryLevel } from "@/lib/learner/store";
import type { Journey } from "@/lib/graph/schema";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import { journeys } from "@content/journeys/foundations";

const nodeById = new Map(nodes.map((n) => [n.id, n]));
const liveIds = new Set(nodes.filter((n) => isLive(n.id)).map((n) => n.id));

const DONE: ReadonlySet<MasteryLevel> = new Set(["assessed", "mastered"]);
const STARTED: ReadonlySet<MasteryLevel> = new Set(["seen", "practiced"]);

/** Glance-able station labels for journey rails (full title stays in aria-label). */
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
  "decision-trees": "Decision Trees",
  "neural-network-fundamentals": "Neural Nets",
  "random-forests": "Random Forest",
  "gradient-boosting": "Boosting",
  "k-means": "K-Means",
  pca: "PCA",
};

/**
 * A guided journey rail — temporal complement to the spatial jewel cabinet.
 * Renders progress, live links on every stop, and one explainable next step.
 */
export function JourneyTrail({ journey }: { journey: Journey }) {
  const mastery = useLearner((s) => s.mastery);
  const levelOf = (id: string): MasteryLevel => mastery[id]?.level ?? "untouched";

  const stops = journey.stops;
  const total = stops.length;
  const doneCount = stops.filter((s) => DONE.has(levelOf(s.nodeId))).length;

  const recs = recommendNext({ nodes, edges, journeys, mastery, liveIds });
  const recOnTrail = recs.find((r) => stops.some((s) => s.nodeId === r.nodeId));

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
    <section id={journey.id} className="scroll-mt-8 border-t border-line py-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-sm tracking-widest text-ink-faint uppercase">
          Journey · {journey.title}
        </h2>
        <span className="font-mono text-xs tracking-widest text-ink-faint tabular-nums">
          {doneCount} / {total} done
        </span>
      </div>
      <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-muted">{journey.description}</p>

      <ol className="mt-10 flex items-start overflow-x-auto pb-2">
        {stops.map((stop, i) => {
          const node = nodeById.get(stop.nodeId)!;
          const level = levelOf(node.id);
          const done = DONE.has(level);
          const current = node.id === nextId;
          const href = liveExhibits[node.id]?.href;
          if (!href) return null;

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
                    <span className="mt-0.5 block text-[10px] text-ink-faint">optional</span>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {nextNode ? (
        <div
          role="region"
          aria-label={`Your next step on ${journey.title}`}
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
          aria-label={`${journey.title} trail complete`}
          className="mt-12 max-w-xl border-l-2 border-accent pl-6"
        >
          <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
            Trail complete
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            You&rsquo;ve walked every stop.
          </p>
          <p className="mt-2 leading-relaxed text-ink-muted">
            That&rsquo;s the whole {journey.title} trail behind you. Browse the exhibits
            again, or follow a connection somewhere new.
          </p>
          <a
            href="#exhibits"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
          >
            Browse all exhibits →
          </a>
        </div>
      )}
    </section>
  );
}
