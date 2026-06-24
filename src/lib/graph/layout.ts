import type { ConceptEdge, ConceptNode } from "./schema";

/**
 * Deterministic layered layout for the graph explorer. Nodes are placed in
 * columns by longest path along *ordering* edges (the edge types that imply
 * "learn this before that"), so the map reads left to right as a learning
 * direction — no force simulation, no randomness, no layout dependency.
 */

const ORDERING_EDGE_TYPES = new Set([
  "requires",
  "generalises",
  "used_inside",
  "mathematical_basis",
  "optimised_by",
  "evaluated_by",
]);

export type PlacedNode = {
  node: ConceptNode;
  layer: number;
  x: number;
  y: number;
};

export type GraphLayout = {
  placed: PlacedNode[];
  byId: Map<string, PlacedNode>;
  width: number;
  height: number;
};

/** Longest-path layer per node. Validation guarantees the `requires` DAG;
 * other ordering types are not formally checked, so a defensive cycle guard
 * drops any back edge instead of hanging the build. */
export function layerNodes(
  nodes: ConceptNode[],
  edges: ConceptEdge[],
): Map<string, number> {
  const inbound = new Map<string, string[]>();
  for (const e of edges) {
    if (!ORDERING_EDGE_TYPES.has(e.type)) continue;
    inbound.set(e.to, [...(inbound.get(e.to) ?? []), e.from]);
  }

  const layers = new Map<string, number>();
  const inProgress = new Set<string>();

  const layerOf = (id: string): number => {
    const known = layers.get(id);
    if (known !== undefined) return known;
    if (inProgress.has(id)) return 0; // cycle guard: ignore the back edge
    inProgress.add(id);
    const sources = inbound.get(id) ?? [];
    const layer =
      sources.length === 0 ? 0 : Math.max(...sources.map((s) => layerOf(s) + 1));
    inProgress.delete(id);
    layers.set(id, layer);
    return layer;
  };

  for (const n of nodes) layerOf(n.id);
  return layers;
}

export function layoutGraph(
  nodes: ConceptNode[],
  edges: ConceptEdge[],
  {
    columnGap = 196,
    rowGap = 132,
    paddingX = 104,
    paddingY = 72,
  }: { columnGap?: number; rowGap?: number; paddingX?: number; paddingY?: number } = {},
): GraphLayout {
  const layers = layerNodes(nodes, edges);
  const layerCount = Math.max(...[...layers.values()]) + 1;

  const columns: ConceptNode[][] = Array.from({ length: layerCount }, () => []);
  for (const n of nodes) columns[layers.get(n.id)!].push(n);
  // Stable within-column order: group by domain, then title.
  for (const col of columns) {
    col.sort((a, b) => a.domain.localeCompare(b.domain) || a.title.localeCompare(b.title));
  }

  const tallest = Math.max(...columns.map((c) => c.length));
  const width = paddingX * 2 + (layerCount - 1) * columnGap;
  const height = paddingY * 2 + (tallest - 1) * rowGap;
  const centerY = height / 2;

  const placed: PlacedNode[] = [];
  columns.forEach((col, layer) => {
    col.forEach((node, i) => {
      placed.push({
        node,
        layer,
        x: paddingX + layer * columnGap,
        y: centerY + (i - (col.length - 1) / 2) * rowGap,
      });
    });
  });

  return { placed, byId: new Map(placed.map((p) => [p.node.id, p])), width, height };
}
