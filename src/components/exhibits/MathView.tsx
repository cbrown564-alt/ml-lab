import { NodeChip } from "@/components/graph/NodeChip";
import type { MathBlock, MathDrawerContent } from "@/lib/narrative/math";
import { nodes } from "@content/graph/nodes";

/**
 * The math, as a composed view (Stream 2, iteration 2) — the formal treatment
 * is its own act now, not a drawer collapsed at the foot of the page. Equations
 * are set Unicode in the mono voice the readouts speak; the prose runs in a
 * readable column beside them.
 */

function Block({ block }: { block: MathBlock }) {
  if (block.kind === "prose") {
    return <p className="mt-4 leading-relaxed text-ink-muted">{block.text}</p>;
  }
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-sunken px-6 py-5">
      {block.lines.map((line) => (
        <div key={line} className="font-mono text-[15px] leading-loose text-ink">
          {line}
        </div>
      ))}
      {block.caption && (
        <p className="mt-3 text-sm leading-relaxed text-ink-faint">{block.caption}</p>
      )}
    </div>
  );
}

export function MathView({ math }: { math: MathDrawerContent }) {
  const mathNodes = math.mathNodeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n) => n !== undefined);

  return (
    <section className="max-w-[72ch]">
      <h2 className="text-3xl font-semibold tracking-tight">The math</h2>
      <p className="mt-4 text-lg leading-relaxed text-ink-muted">{math.invitation}</p>

      {math.sections.map((s) => (
        <div key={s.id} className="mt-12 border-t border-line pt-8 first:mt-10 first:border-0 first:pt-0">
          <h3 className="text-xl font-semibold tracking-tight">{s.heading}</h3>
          {s.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </div>
      ))}

      {mathNodes.length > 0 && (
        <div className="mt-12 border-t border-line pt-8">
          <h3 className="text-sm font-medium tracking-wide text-ink-faint uppercase">
            From the math wing
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {mathNodes.map((n) => (
              <li key={n.id}>
                <NodeChip node={n} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
