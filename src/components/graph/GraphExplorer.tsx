import Link from "next/link";
import { MasteryDot } from "@/components/learner/MasteryDot";
import { layoutGraph } from "@/lib/graph/layout";
import { isLive, liveExhibits } from "@content/exhibits";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";

/**
 * Graph explorer v1 — the lab's floor plan (docs/06, A1). Server-rendered:
 * a deterministic layered layout, SVG edges underneath, HTML node chips on
 * top. Open exhibits are doors; everything else is territory on the map.
 * Reads left to right as a learning direction.
 */

const edgeClass = (type: string, strength: string) => {
  if (type === "requires") {
    return strength === "hard"
      ? { dash: undefined, opacity: 0.55 }
      : { dash: "6 5", opacity: 0.4 };
  }
  return { dash: "2 5", opacity: 0.35 };
};

export function GraphExplorer() {
  const layout = layoutGraph(nodes, edges);
  const { width, height } = layout;

  return (
    <figure>
      <div className="overflow-x-auto">
        <div className="relative mx-auto" style={{ width, height }}>
          <svg
            className="absolute inset-0"
            width={width}
            height={height}
            aria-hidden
          >
            {edges.map((e, i) => {
              const from = layout.byId.get(e.from);
              const to = layout.byId.get(e.to);
              if (!from || !to) return null;
              const bend = Math.min(90, Math.max(48, (to.x - from.x) / 2));
              const style = edgeClass(e.type, e.strength);
              return (
                <path
                  key={i}
                  d={`M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`}
                  fill="none"
                  stroke="var(--ink-faint)"
                  strokeWidth={1.5}
                  strokeDasharray={style.dash}
                  strokeOpacity={style.opacity}
                />
              );
            })}
          </svg>

          {layout.placed.map(({ node, x, y }) =>
            isLive(node.id) ? (
              <Link
                key={node.id}
                href={liveExhibits[node.id].href}
                title={node.oneLiner}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-raised px-4 py-2 text-sm font-medium whitespace-nowrap text-accent shadow-sm transition-colors hover:bg-accent hover:text-accent-ink"
                style={{ left: x, top: y }}
              >
                {node.title} →
                <MasteryDot nodeId={node.id} />
              </Link>
            ) : (
              <span
                key={node.id}
                title={node.oneLiner}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-sunken px-4 py-2 text-sm whitespace-nowrap text-ink-muted"
                style={{ left: x, top: y }}
              >
                {node.title}
                <MasteryDot nodeId={node.id} />
              </span>
            ),
          )}
        </div>
      </div>

      <figcaption className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-ink-faint">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block rounded-full border border-accent px-2 py-0.5 text-xs text-accent">
            open
          </span>
          exhibit you can enter today
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="28" height="2" aria-hidden>
            <line x1="0" y1="1" x2="28" y2="1" stroke="var(--ink-faint)" strokeWidth="1.5" />
          </svg>
          requires
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="28" height="2" aria-hidden>
            <line x1="0" y1="1" x2="28" y2="1" stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="6 5" />
          </svg>
          helps
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="28" height="2" aria-hidden>
            <line x1="0" y1="1" x2="28" y2="1" stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="2 5" />
          </svg>
          related
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="inline-block h-3 w-3 rounded-full border-2 border-accent bg-accent" />
          your progress (filled = mastered)
        </span>
      </figcaption>
    </figure>
  );
}
