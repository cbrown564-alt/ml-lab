import Link from "next/link";
import { GraphExplorer } from "@/components/graph/GraphExplorer";
import { MasteryBadge } from "@/components/learner/MasteryBadge";
import { NextStep } from "@/components/learner/NextStep";
import { domainLabel, statusLabel } from "@/lib/graph/labels";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { foundations } from "@content/journeys/foundations";

/**
 * The lab's front door (docs/06, A1): orient in seconds — what this place
 * is, what's open today, the map of the territory, and one guided path in.
 * Calm editorial surface throughout, including interactive exhibits.
 */

const nodeById = new Map(nodes.map((n) => [n.id, n]));
const openExhibits = nodes.filter((n) => isLive(n.id));

export default function Home() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between px-8 py-5">
          <span className="font-mono text-sm font-semibold tracking-widest uppercase">
            ML Lab
          </span>
          <nav className="flex gap-8 text-sm text-ink-muted">
            <a href="#exhibits" className="transition-colors hover:text-ink">
              Exhibits
            </a>
            <a href="#map" className="transition-colors hover:text-ink">
              The map
            </a>
            <a href="#foundations" className="transition-colors hover:text-ink">
              Journeys
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-8">
        <section className="grid items-center gap-12 py-24 lg:grid-cols-[3fr_2fr]">
          <div>
          <h1 className="max-w-[18ch] text-6xl font-semibold tracking-tight text-balance">
            Get your hands on machine learning.
          </h1>
          <p className="mt-6 max-w-[58ch] text-xl leading-relaxed text-ink-muted">
            A laboratory, not a course. Every concept is an exhibit with a live
            experiment at its heart — drag the data, turn the knobs, break the
            model on purpose — until the intuition practitioners build over
            years is sitting in your hands.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={liveExhibits["linear-regression"].href}
              className="rounded-full bg-accent px-6 py-2.5 font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              Enter the first exhibit
            </Link>
            <a
              href="#map"
              className="rounded-full border border-line px-6 py-2.5 text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
            >
              Browse the map
            </a>
          </div>
          </div>

          {/* The lab's signature in one glance: data you can grab, the line
              that chases it, the penalty it pays — drawn in the same visual
              grammar every exhibit speaks. */}
          <svg
            viewBox="0 0 380 280"
            aria-hidden
            className="hidden h-auto w-full max-w-md justify-self-end lg:block"
          >
            <line
              x1="20"
              y1="232"
              x2="372"
              y2="56"
              stroke="var(--viz-prediction)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* one big miss, squared */}
            <rect
              x="178"
              y="42"
              width="76"
              height="76"
              fill="var(--viz-error)"
              fillOpacity="0.12"
              stroke="var(--viz-error)"
              strokeOpacity="0.55"
            />
            <line
              x1="254"
              y1="42"
              x2="254"
              y2="118"
              stroke="var(--viz-error)"
              strokeWidth="1.5"
              strokeOpacity="0.7"
              strokeDasharray="3 3"
            />
            {[
              [44, 212],
              [86, 202],
              [118, 176],
              [152, 170],
              [196, 140],
              [254, 42],
              [262, 116],
              [300, 86],
              [340, 78],
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={i === 5 ? 8 : 6.5}
                fill="var(--viz-truth)"
                stroke="var(--surface-bg)"
                strokeWidth="1.5"
              />
            ))}
            <text
              x="244"
              y="32"
              textAnchor="end"
              fontSize="13"
              fontStyle="italic"
              fill="var(--viz-error)"
            >
              the one that got away
            </text>
          </svg>
        </section>

        {/* The method, made visible at the front door: every exhibit is worked in
            four passes. The product's promise, not a tagline. */}
        <section className="border-t border-line py-12">
          <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
            How every exhibit works
          </p>
          <ol className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["See it", "Form the mental model — the visual intuition, before the math."],
                ["Run it", "Inspect the implementation — drive the model, read it as code and maths."],
                ["Break it", "Learn the operating envelope — trigger the failures and diagnose them."],
                ["Explain it", "Prove transfer — reconstruct the idea on a fresh, unseen case."],
              ] as const
            ).map(([verb, gloss], i) => (
              <li key={verb} className="flex gap-3">
                <span className="mt-0.5 font-mono text-sm text-ink-faint tabular-nums">
                  {`0${i + 1}`}
                </span>
                <span>
                  <span className="block font-semibold tracking-tight">{verb}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                    {gloss}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <NextStep />

        <section id="exhibits" className="scroll-mt-8 border-t border-line py-16">
          <h2 className="font-mono text-sm tracking-widest text-ink-faint uppercase">
            Now showing
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {openExhibits.map((n) => (
              <Link
                key={n.id}
                href={liveExhibits[n.id].href}
                className="group rounded-xl border border-line bg-raised p-7 transition-colors hover:border-accent"
              >
                <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
                  {domainLabel(n.domain)} · {statusLabel(n.status)}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight">{n.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-muted">{n.oneLiner}</p>
                <p className="mt-5 text-sm font-medium text-accent">
                  Enter exhibit{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section id="map" className="scroll-mt-8 border-t border-line py-16">
          <h2 className="font-mono text-sm tracking-widest text-ink-faint uppercase">
            The map
          </h2>
          <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-muted">
            The lab is a connected territory, not a syllabus. Concepts point to
            what they require and what they unlock; wander freely, or follow a
            journey. Two doors are open today — the rest of the wing is under
            construction.
          </p>
          <div className="mt-10">
            <GraphExplorer />
          </div>
        </section>

        <section id="foundations" className="scroll-mt-8 border-t border-line py-16">
          <h2 className="font-mono text-sm tracking-widest text-ink-faint uppercase">
            Journey · {foundations.title}
          </h2>
          <p className="mt-4 max-w-[58ch] leading-relaxed text-ink-muted">
            {foundations.description}
          </p>
          <ol className="mt-10 max-w-2xl">
            {foundations.stops.map((stop, i) => {
              const node = nodeById.get(stop.nodeId)!;
              const live = isLive(node.id);
              return (
                <li
                  key={stop.nodeId}
                  className="relative flex gap-5 border-l border-line pb-8 pl-8 last:pb-0"
                >
                  <span
                    aria-hidden
                    className={`absolute top-1 -left-[0.6875rem] flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-medium ${
                      live
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-line bg-surface text-ink-faint"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    {live ? (
                      <span className="inline-flex flex-wrap items-center gap-3">
                        <Link
                          href={liveExhibits[node.id].href}
                          className="font-medium text-accent transition-colors hover:underline"
                        >
                          {node.title} →
                        </Link>
                        <MasteryBadge nodeId={node.id} />
                      </span>
                    ) : (
                      <span className="font-medium text-ink-muted">
                        {node.title}
                        {stop.optional ? (
                          <span className="ml-2 text-sm font-normal text-ink-faint">
                            optional
                          </span>
                        ) : null}
                      </span>
                    )}
                    <p className="mt-1 text-sm leading-relaxed text-ink-faint">
                      {stop.framing ?? node.oneLiner}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-4 px-8 py-8 text-sm text-ink-faint">
          <span>ML Lab — an interactive museum of machine learning.</span>
          <span>
            {openExhibits.length} of {nodes.length} exhibits open · best on a big
            screen
          </span>
        </div>
      </footer>
    </>
  );
}
