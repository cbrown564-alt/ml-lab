import Link from "next/link";
import { nodes } from "@content/graph/nodes";
import { journeys } from "@content/journeys/foundations";

/** Nodes whose exhibit routes exist. Becomes graph-driven once ExhibitMeta lands. */
const LIVE_EXHIBITS = new Set(["linear-regression"]);

/**
 * Placeholder shell home. Exists to prove the content pipeline end-to-end
 * (typed graph data → validated → rendered) and exercise both surfaces of
 * the dual-mode token system. The real lab home is a later design iteration.
 */
export default function Home() {
  const byDomain = new Map<string, number>();
  for (const n of nodes) byDomain.set(n.domain, (byDomain.get(n.domain) ?? 0) + 1);

  return (
    <main className="mx-auto w-full max-w-3xl px-8 py-20">
      <p className="font-mono text-sm tracking-widest text-ink-faint uppercase">
        Under construction
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight">ML Lab</h1>
      <p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-ink-muted">
        A laboratory of machine learning exhibits — visual, interactive,
        connected in a knowledge graph. Nothing to see yet; the foundations are
        being poured.
      </p>

      <section className="mt-12 rounded-lg border border-line bg-raised p-6">
        <h2 className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          Knowledge graph
        </h2>
        <p className="mt-2 text-ink">
          {nodes.length} concepts · {journeys.length} journey ·{" "}
          {[...byDomain.keys()].length} domains
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {nodes.map((n) =>
            LIVE_EXHIBITS.has(n.id) ? (
              <li key={n.id}>
                <Link
                  href={`/exhibits/${n.id}`}
                  title={n.oneLiner}
                  className="inline-block rounded-full border border-accent bg-raised px-3 py-1 text-sm font-medium text-accent hover:bg-accent hover:text-accent-ink"
                >
                  {n.title} →
                </Link>
              </li>
            ) : (
              <li
                key={n.id}
                className="rounded-full border border-line bg-sunken px-3 py-1 text-sm text-ink-muted"
                title={n.oneLiner}
              >
                {n.title}
              </li>
            ),
          )}
        </ul>
      </section>

      <section
        data-surface="lab"
        className="mt-8 rounded-lg border border-line p-6"
      >
        <h2 className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          The lab canvas
        </h2>
        <p className="mt-2 max-w-[65ch] leading-relaxed">
          Experiments will live on this dark surface, where{" "}
          <span style={{ color: "var(--viz-prediction)" }}>predictions</span>,{" "}
          <span style={{ color: "var(--viz-truth)" }}>ground truth</span>, and{" "}
          <span style={{ color: "var(--viz-error)" }}>error</span> keep the same
          colors in every exhibit in the building.
        </p>
      </section>
    </main>
  );
}
