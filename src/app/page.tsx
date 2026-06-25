import Link from "next/link";
import { JewelGallery, type Wing } from "@/components/graph/JewelGallery";
import { MasteryBadge } from "@/components/learner/MasteryBadge";
import { NextStep } from "@/components/learner/NextStep";
import { domainLabel } from "@/lib/graph/labels";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import { foundations } from "@content/journeys/foundations";

/**
 * The lab's front door (docs/06, A1): orient in seconds — what this place
 * is, what's open today, the map of the territory, and one guided path in.
 * Calm editorial surface throughout, including interactive exhibits.
 */

const nodeById = new Map(nodes.map((n) => [n.id, n]));
const openExhibits = nodes.filter((n) => isLive(n.id));

// The cabinet is curated into wings — a deliberate learning progression, so the
// grouping is explicit and the order is intentional rather than a scatter. The
// hover still lights connections *across* wings, so the graph structure is felt
// without lines. (Edit the wings here to re-curate the front door.)
const WINGS: { title: string; blurb: string; ids: string[] }[] = [
  {
    title: "Groundwork",
    blurb: "What learning from data even means.",
    ids: ["what-is-ml", "the-dataset"],
  },
  {
    title: "The first models",
    blurb: "Fit a line, draw a boundary.",
    ids: ["regression-task", "linear-regression", "classification-task", "logistic-regression"],
  },
  {
    title: "How models learn",
    blurb: "The machinery that does the fitting.",
    ids: ["loss-functions", "the-gradient", "gradient-descent", "feature-scaling"],
  },
  {
    title: "Keeping it honest",
    blurb: "Why a model fails — and how to tell.",
    ids: ["train-test-generalization", "overfitting-regularization", "bias-variance", "data-leakage"],
  },
  {
    title: "Going deeper",
    blurb: "Stacking simple parts into something powerful.",
    ids: ["neural-network-fundamentals"],
  },
];
const wings: Wing[] = WINGS.map((w) => ({
  title: w.title,
  blurb: w.blurb,
  jewels: w.ids.map((id) => {
    const node = nodeById.get(id)!;
    return {
      id,
      title: node.title,
      domain: node.domain,
      domainLabel: domainLabel(node.domain),
      live: isLive(id),
      href: isLive(id) ? liveExhibits[id].href : null,
    };
  }),
}));
const jewelEdges = edges.map((e) => ({ from: e.from, to: e.to, type: e.type }));

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-baseline justify-between px-8 py-5">
          <span className="font-mono text-sm font-semibold tracking-widest uppercase">
            ML Lab
          </span>
          <nav className="flex gap-8 text-sm text-ink-muted">
            <a href="#exhibits" className="transition-colors hover:text-ink">
              Exhibits
            </a>
            <a href="#how" className="transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#foundations" className="transition-colors hover:text-ink">
              Journeys
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-8">
        <section className="pt-20 pb-24 text-center">
          <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
            An interactive atlas of machine learning
          </p>
          <h1 className="mx-auto mt-5 max-w-[20ch] text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Get your hands on machine learning.
          </h1>
          <p className="mx-auto mt-6 max-w-[58ch] text-xl leading-relaxed text-balance text-ink-muted">
            A laboratory, not a course. Every concept is an exhibit with a live
            experiment at its heart — drag the data, turn the knobs, break the
            model on purpose. Pick a jewel and step inside.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={liveExhibits["linear-regression"].href}
              className="rounded-full bg-accent px-6 py-2.5 font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              Enter the first exhibit
            </Link>
            <a
              href="#foundations"
              className="rounded-full border border-line px-6 py-2.5 text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
            >
              Follow the Foundations path
            </a>
          </div>
        </section>

        {/* The cabinet of jewels (homepages/SYNTHESIS.md): the collection as a
            wall of luminous specimens, set in its own atmospheric field. This is
            both the showcase and the map — hovering a jewel lights what it
            connects to. Full-bleed; the w-screen overhang is clipped by the
            overflow-x-clip wrapper around the page. */}
        <section
          id="exhibits"
          className="jewel-field relative left-1/2 w-screen -translate-x-1/2 scroll-mt-8 border-y border-line pt-16 pb-24"
        >
          <div className="mx-auto max-w-6xl px-8">
            <p className="mb-16 text-center font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
              Now showing · {openExhibits.length} exhibits, all open
            </p>
            <JewelGallery wings={wings} edges={jewelEdges} />
          </div>
        </section>

        {/* The method, made visible at the front door: every exhibit is worked in
            four passes. The product's promise, not a tagline. */}
        <section id="how" className="scroll-mt-8 border-t border-line py-12">
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
    </div>
  );
}
