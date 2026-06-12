import { NodeChip } from "@/components/graph/NodeChip";
import type { MathBlock, MathDrawerContent } from "@/lib/narrative/math";
import { nodes } from "@content/graph/nodes";

/**
 * The math drawer (docs/01-vision.md, exhibit anatomy): the formal
 * treatment, on demand, after the hands and the story have built the
 * intuition. A native <details> — server-rendered, keyboard-operable,
 * zero client JS. Equations are set Unicode, in the mono voice the
 * readouts already speak.
 */

function Block({ block }: { block: MathBlock }) {
  if (block.kind === "prose") {
    return <p className="mt-4 leading-relaxed text-ink-muted">{block.text}</p>;
  }
  return (
    <div className="mt-4 overflow-x-auto rounded-lg bg-sunken px-5 py-4">
      {block.lines.map((line) => (
        <div key={line} className="font-mono text-[15px] leading-loose text-ink">
          {line}
        </div>
      ))}
      {block.caption && (
        <p className="mt-2 text-sm leading-relaxed text-ink-faint">{block.caption}</p>
      )}
    </div>
  );
}

export function MathDrawer({ math }: { math: MathDrawerContent }) {
  const mathNodes = math.mathNodeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n) => n !== undefined);

  return (
    <section className="mt-14 max-w-[65ch]">
      <h2 className="text-2xl font-semibold tracking-tight">The math</h2>
      <p className="mt-4 leading-relaxed text-ink-muted">{math.invitation}</p>
      <details className="group mt-5 rounded-xl border border-line bg-raised">
        <summary className="cursor-pointer rounded-xl px-6 py-4 font-medium text-accent select-none marker:text-ink-faint hover:bg-sunken group-open:rounded-b-none">
          Open the drawer
        </summary>
        <div className="border-t border-line px-6 pb-6">
          {math.sections.map((s) => (
            <div key={s.id} className="mt-6">
              <h3 className="text-lg font-semibold tracking-tight">{s.heading}</h3>
              {s.blocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
            </div>
          ))}
          {mathNodes.length > 0 && (
            <div className="mt-8 border-t border-line pt-5">
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
        </div>
      </details>
    </section>
  );
}
