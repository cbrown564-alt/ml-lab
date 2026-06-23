import { Fragment, type ReactNode } from "react";
import { NodeChip } from "@/components/graph/NodeChip";
import { StabilityScale } from "@/components/exhibits/StabilityScale";
import { SquaredPenalty } from "@/components/exhibits/SquaredPenalty";
import { NonlinearityToggle } from "@/components/exhibits/NonlinearityToggle";
import { HUE_INK } from "@/lib/narrative/hues";
import type { MathBlock, MathDrawerContent, MathHighlight } from "@/lib/narrative/math";
import { nodes } from "@content/graph/nodes";

/**
 * The math, composed as its own act (Stream 2, pattern 5) — not a drawer sealed
 * at the foot of the page. Equations are set Unicode in the mono voice the
 * readouts speak; key symbols are tinted to their mark on the canvas (η in the
 * param hue, the miss ŷ−y in error-red) so the formula speaks the same colour
 * grammar as the graphic. Where a claim has a live consequence — the stability
 * cliff — a widget lets the reader cross it rather than take it on faith.
 */

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Split text into runs, tinting any run that exactly matches a highlight. Longer
 * phrases match first so "ŷᵢ − yᵢ" wins over a bare "yᵢ".
 */
function tint(
  text: string,
  highlights: MathHighlight[] | undefined,
  variant: "prose" | "equation",
): ReactNode {
  if (!highlights || highlights.length === 0) return text;
  const byText = new Map(highlights.map((h) => [h.text, h.hue]));
  const phrases = [...byText.keys()].sort((a, b) => b.length - a.length);
  const re = new RegExp(`(${phrases.map(esc).join("|")})`, "g");
  const parts = text.split(re);
  return parts.map((part, i) => {
    const hue = byText.get(part);
    if (!hue) return <Fragment key={i}>{part}</Fragment>;
    return (
      <span
        key={i}
        className={
          variant === "prose"
            ? "font-medium underline decoration-1 underline-offset-2"
            : "font-medium"
        }
        style={{ color: HUE_INK[hue] }}
      >
        {part}
      </span>
    );
  });
}

function Block({ block }: { block: MathBlock }) {
  if (block.kind === "widget") {
    return (
      <div className="mt-6">
        {block.widget === "stability" ? (
          <StabilityScale config={block.config} />
        ) : block.widget === "penalty" ? (
          <SquaredPenalty config={block.config} />
        ) : (
          <NonlinearityToggle />
        )}
      </div>
    );
  }
  if (block.kind === "prose") {
    return (
      <p className="mt-4 leading-relaxed text-ink-muted">
        {tint(block.text, block.highlights, "prose")}
      </p>
    );
  }
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-sunken px-6 py-5">
      {block.lines.map((line) => (
        <div key={line} className="font-mono text-[15px] leading-loose text-ink">
          {tint(line, block.highlights, "equation")}
        </div>
      ))}
      {block.caption && (
        <p className="mt-3 text-sm leading-relaxed text-ink-faint">
          {tint(block.caption, block.highlights, "prose")}
        </p>
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
      <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
        The mechanism · the same model, as maths
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">Read it as maths</h2>
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
