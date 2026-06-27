"use client";

import { useMemo } from "react";
import type { TreeNode } from "@/lib/models/decision-tree";

/**
 * The tree itself, drawn — the signature visual of the node. A node-link diagram of the
 * fitted CART: internal nodes are the yes/no questions ("x₁ ≤ 0.42"), leaves are class
 * votes tinted the same amber/blue as the plane and saturated by their purity. It is the
 * coordinated partner of the decision field: the same model, once as boxes on the plane
 * and once as the cascade of questions that drew them. Grown deep, the diagram sprawls
 * into a visible thicket — overfitting you can read at a glance.
 */

// Class hues echoing DecisionField (amber = class 0, blue = class 1), pale at 50/50.
const AMBER = [206, 158, 74];
const BLUE = [78, 120, 200];
const PALE = [236, 233, 226];
const mix = (a: number[], b: number[], t: number) =>
  `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)}, ${Math.round(a[1] + (b[1] - a[1]) * t)}, ${Math.round(a[2] + (b[2] - a[2]) * t)})`;
const leafColor = (prob1: number) => {
  const conf = Math.abs(prob1 - 0.5) * 2;
  return mix(PALE, prob1 >= 0.5 ? BLUE : AMBER, conf * 0.85);
};

const SLOT = 66; // horizontal pixels per leaf
const LEVEL = 72; // vertical pixels per depth level
const PAD = 18;

type Placed = {
  node: TreeNode;
  x: number;
  depth: number;
  parent?: { x: number; depth: number };
};

function layout(tree: TreeNode): { placed: Placed[]; leaves: number; maxDepth: number } {
  const placed: Placed[] = [];
  let slot = 0;
  let maxDepth = 0;

  const walk = (node: TreeNode, depth: number, parent?: { x: number; depth: number }): number => {
    maxDepth = Math.max(maxDepth, depth);
    if (node.kind === "leaf") {
      const x = slot + 0.5;
      slot += 1;
      placed.push({ node, x, depth, parent });
      return x;
    }
    // Place children first so the split sits centred above them.
    const self = { x: 0, depth };
    const lx = walk(node.left, depth + 1, self);
    const rx = walk(node.right, depth + 1, self);
    const x = (lx + rx) / 2;
    self.x = x;
    placed.push({ node, x, depth, parent });
    return x;
  };

  walk(tree, 0);
  return { placed, leaves: slot, maxDepth };
}

const featLabel = (f: 0 | 1) => (f === 0 ? "x₁" : "x₂");

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
  const py = (depth: number) => PAD + depth * LEVEL + 22;

  // Just the root before any question is asked (depth-0 leaf) reads as "no questions yet".
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
            : `A decision tree of ${leaves} leaves and depth ${maxDepth}: internal nodes test one feature against a threshold, leaves vote a class.`
        }
        className="h-auto w-full select-none"
      >
        {/* edges */}
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
        {/* nodes */}
        {placed.map((p, i) => {
          if (p.node.kind === "leaf") {
            return (
              <g key={`n${i}`}>
                <circle
                  cx={px(p.x)}
                  cy={py(p.depth)}
                  r={11}
                  fill={leafColor(p.node.prob1)}
                  stroke="var(--surface-bg)"
                  strokeWidth={1.5}
                />
              </g>
            );
          }
          const label = `${featLabel(p.node.feature)} ≤ ${p.node.threshold.toFixed(2)}`;
          const half = 30;
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
