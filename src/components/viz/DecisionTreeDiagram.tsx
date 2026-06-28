"use client";

import { useMemo } from "react";
import type { TreeNode } from "@/lib/models/decision-tree";

/**
 * The tree itself, drawn — the signature visual of the node. A node-link diagram of the
 * fitted CART: internal nodes are the yes/no questions ("x₁ ≤ 0.42"), leaves are little
 * pies sized by how many training points fell in them and split amber/blue by their class
 * mixture (R2D3's leaf-pie idiom — a solid disc is a pure leaf, a halved one is a 50/50
 * box). It is the coordinated partner of the decision field: the same model, once as boxes
 * on the plane and once as the cascade of questions that drew them. Grown deep, the labels
 * drop away past a few levels and the pies multiply into a visible thicket — overfitting
 * you can read at a glance.
 */

// Class hues echoing DecisionField (amber = class 0, blue = class 1).
const AMBER = "rgb(196, 150, 68)";
const BLUE = "rgb(72, 112, 190)";

const SLOT = 64; // horizontal pixels per leaf
const LEVEL = 70; // vertical pixels per depth level
const PAD = 22;
/** Past this depth the split labels are illegible, so internal nodes shrink to a dot and
 * only the leaf pies carry meaning — the sprawl then reads as "look how complex" by design. */
const MAX_LABEL_DEPTH = 4;

type Placed = {
  node: TreeNode;
  x: number;
  depth: number;
  parent?: { x: number; depth: number };
  /** Which branch of the parent this is: "L" = the split's condition held (yes / ≤). */
  side?: "L" | "R";
};

function layout(tree: TreeNode): { placed: Placed[]; leaves: number; maxDepth: number } {
  const placed: Placed[] = [];
  let slot = 0;
  let maxDepth = 0;

  const walk = (
    node: TreeNode,
    depth: number,
    parent?: { x: number; depth: number },
    side?: "L" | "R",
  ): number => {
    maxDepth = Math.max(maxDepth, depth);
    if (node.kind === "leaf") {
      const x = slot + 0.5;
      slot += 1;
      placed.push({ node, x, depth, parent, side });
      return x;
    }
    const self = { x: 0, depth };
    const lx = walk(node.left, depth + 1, self, "L");
    const rx = walk(node.right, depth + 1, self, "R");
    const x = (lx + rx) / 2;
    self.x = x;
    placed.push({ node, x, depth, parent, side });
    return x;
  };

  walk(tree, 0);
  return { placed, leaves: slot, maxDepth };
}

const featLabel = (f: 0 | 1) => (f === 0 ? "x₁" : "x₂");

/** An SVG arc slice from fraction a→b of a circle, starting at the top, clockwise. */
function slice(cx: number, cy: number, r: number, a: number, b: number): string {
  const ang = (f: number) => f * 2 * Math.PI - Math.PI / 2;
  const x0 = cx + r * Math.cos(ang(a));
  const y0 = cy + r * Math.sin(ang(a));
  const x1 = cx + r * Math.cos(ang(b));
  const y1 = cy + r * Math.sin(ang(b));
  const large = b - a > 0.5 ? 1 : 0;
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

function LeafPie({ cx, cy, counts }: { cx: number; cy: number; counts: [number, number] }) {
  const n = counts[0] + counts[1];
  const r = Math.max(6, Math.min(18, 5 + Math.sqrt(n) * 1.7));
  const f0 = n === 0 ? 0 : counts[0] / n; // class-0 (amber) fraction
  if (f0 >= 0.999 || f0 <= 0.001) {
    return <circle cx={cx} cy={cy} r={r} fill={f0 >= 0.5 ? AMBER : BLUE} stroke="var(--surface-bg)" strokeWidth={1.5} />;
  }
  return (
    <g stroke="var(--surface-bg)" strokeWidth={1}>
      <path d={slice(cx, cy, r, 0, f0)} fill={AMBER} />
      <path d={slice(cx, cy, r, f0, 1)} fill={BLUE} />
    </g>
  );
}

export function DecisionTreeDiagram({
  tree,
  caption,
  className,
}: {
  tree: TreeNode;
  caption?: string;
  className?: string;
}) {
  const { placed, leaves, maxDepth } = useMemo(() => layout(tree), [tree]);
  const w = Math.max(leaves, 1) * SLOT;
  const h = (maxDepth + 1) * LEVEL;
  const px = (x: number) => PAD + (x / Math.max(leaves, 1)) * (w - 2 * PAD);
  const py = (depth: number) => PAD + depth * LEVEL + 16;

  const onlyRoot = tree.kind === "leaf";

  return (
    <figure className={className}>
      {caption && (
        <figcaption className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          {caption}
        </figcaption>
      )}
      <svg
        viewBox={`0 0 ${w} ${h + PAD}`}
        role="img"
        aria-label={
          onlyRoot
            ? "A decision tree with no questions yet — a single leaf voting the majority class."
            : `A decision tree of ${leaves} leaves and depth ${maxDepth}: internal nodes test one feature against a threshold; each leaf is a pie sized by its training count and split by class.`
        }
        className="h-auto w-full select-none"
      >
        {placed
          .filter((p) => p.parent)
          .map((p, i) => (
            <line
              key={`e${i}`}
              x1={px(p.parent!.x)}
              y1={py(p.parent!.depth)}
              x2={px(p.x)}
              y2={py(p.depth)}
              stroke="var(--line)"
              strokeWidth={1.4}
            />
          ))}
        {/* Branch semantics: yes/no on the edges from a labelled split, so the diagram
            reads as a partition (condition true → left), not a bare flowchart. */}
        {placed
          .filter((p) => p.parent && p.side && p.parent.depth <= MAX_LABEL_DEPTH)
          .map((p, i) => {
            const t = 0.34;
            const lx = px(p.parent!.x) + (px(p.x) - px(p.parent!.x)) * t;
            const ly = py(p.parent!.depth) + (py(p.depth) - py(p.parent!.depth)) * t;
            return (
              <text
                key={`b${i}`}
                x={lx + (p.side === "L" ? -5 : 5)}
                y={ly}
                textAnchor={p.side === "L" ? "end" : "start"}
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill="var(--ink-faint)"
              >
                {p.side === "L" ? "yes" : "no"}
              </text>
            );
          })}
        {placed.map((p, i) => {
          if (p.node.kind === "leaf") {
            return <LeafPie key={`n${i}`} cx={px(p.x)} cy={py(p.depth)} counts={p.node.counts} />;
          }
          // Past the legible depth, internal nodes shrink to a dot.
          if (p.depth > MAX_LABEL_DEPTH) {
            return <circle key={`n${i}`} cx={px(p.x)} cy={py(p.depth)} r={3.5} fill="var(--viz-param)" />;
          }
          const label = `${featLabel(p.node.feature)} ≤ ${p.node.threshold.toFixed(2)}`;
          // Auto-fit the pill to its label (mono ≈ 7.3px/char at 13px) — no fixed half-width.
          const half = Math.max(26, label.length * 3.8 + 9);
          return (
            <g key={`n${i}`}>
              <rect
                x={px(p.x) - half}
                y={py(p.depth) - 12}
                width={half * 2}
                height={24}
                rx={6}
                fill="var(--surface-raised)"
                stroke="var(--viz-param)"
                strokeWidth={1.5}
              />
              <text
                x={px(p.x)}
                y={py(p.depth) + 4}
                textAnchor="middle"
                fontSize={13}
                fontFamily="var(--font-mono)"
                fill="var(--ink)"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
