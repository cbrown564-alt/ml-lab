import Link from "next/link";
import { JewelGallery, type Wing } from "@/components/graph/JewelGallery";
import { FoundationsTrail } from "@/components/learner/FoundationsTrail";
import { domainLabel } from "@/lib/graph/labels";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";

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
    blurb: "What learning from data means—and what a model can actually see.",
    ids: ["what-is-ml", "the-dataset"],
  },
  {
    title: "The first models",
    blurb: "Predict a number. Draw a boundary.",
    ids: ["regression-task", "linear-regression", "classification-task", "logistic-regression"],
  },
  {
    title: "How models learn",
    blurb: "Turn error into an update.",
    ids: ["loss-functions", "the-gradient", "gradient-descent", "feature-scaling"],
  },
  {
    title: "Keeping it honest",
    blurb: "Measure what generalizes and spot what misleads.",
    ids: ["train-test-generalization", "overfitting-regularization", "bias-variance", "data-leakage"],
  },
  {
    title: "Going deeper",
    blurb: "Combine simple units into flexible models.",
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
        <section className="pt-20 pb-32 text-center">
          <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
            Interactive machine-learning exhibits
          </p>
          <h1 className="mx-auto mt-5 max-w-[20ch] text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
            Build intuition by running the model.
          </h1>
          <p className="mx-auto mt-6 max-w-[58ch] text-xl leading-relaxed text-balance text-ink-muted">
            ML Lab turns core machine-learning ideas into hands-on exhibits. See
            the idea, change the inputs, push the model until it fails, then
            explain what happened. Explore freely or follow the Foundations
            journey.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={liveExhibits["what-is-ml"].href}
              className="rounded-full bg-accent px-6 py-2.5 font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              Start with What Is Machine Learning
            </Link>
            <a
              href="#exhibits"
              className="rounded-full border border-line px-6 py-2.5 text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
            >
              Browse all exhibits
            </a>
          </div>
        </section>

        {/* The cabinet of jewels: live micro-specimens in warm diagrammatic plates,
            the collection as a gallery you can wander. Hover lights connections. */}
        <section
          id="exhibits"
          className="jewel-field relative left-1/2 w-screen -translate-x-1/2 scroll-mt-8 border-y border-line pt-20 pb-24"
        >
          <div className="mx-auto max-w-6xl px-8">
            <h2 className="mb-12 text-center font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
              {openExhibits.length} interactive exhibits
            </h2>
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
                ["See it", "Build a visual intuition."],
                ["Run it", "Change the inputs and inspect the model."],
                ["Break it", "Trigger a failure and diagnose the cause."],
                ["Explain it", "Apply the idea to a new case."],
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

        <FoundationsTrail />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline justify-between gap-4 px-8 py-8 text-sm text-ink-faint">
          <span>ML Lab — hands-on exhibits for building machine-learning intuition.</span>
          <span>
            {openExhibits.length} exhibits · designed for laptop and desktop
          </span>
        </div>
      </footer>
    </div>
  );
}
