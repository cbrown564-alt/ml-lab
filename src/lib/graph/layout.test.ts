import { describe, expect, it } from "vitest";
import { layerNodes, layoutGraph } from "./layout";
import { nodes } from "@content/graph/nodes";
import { edges } from "@content/graph/edges";
import type { ConceptEdge, ConceptNode } from "./schema";

describe("layerNodes on the real graph", () => {
  const layers = layerNodes(nodes, edges);

  it("assigns every node a layer", () => {
    for (const n of nodes) {
      expect(layers.get(n.id), n.id).toBeTypeOf("number");
    }
  });

  it("every ordering edge points to a strictly later layer", () => {
    const ordering = new Set([
      "requires",
      "generalises",
      "used_inside",
      "mathematical_basis",
      "optimised_by",
      "evaluated_by",
    ]);
    for (const e of edges) {
      if (!ordering.has(e.type)) continue;
      expect(
        layers.get(e.to)!,
        `${e.from} -> ${e.to} (${e.type})`,
      ).toBeGreaterThan(layers.get(e.from)!);
    }
  });

  it("entry concepts sit in the first column", () => {
    expect(layers.get("what-is-ml")).toBe(0);
    expect(layers.get("the-dataset")).toBe(0);
  });
});

describe("layerNodes cycle guard", () => {
  it("ignores a back edge instead of recursing forever", () => {
    const stub = (id: string): ConceptNode => ({
      id,
      title: id,
      oneLiner: "x",
      domain: "supervised",
      tags: [],
      kind: "concept",
      phase: 1,
      depth: "core",
      status: "stub",
    });
    const cyclic: ConceptEdge[] = [
      { from: "a", to: "b", type: "requires", strength: "soft" },
      { from: "b", to: "a", type: "requires", strength: "soft" },
    ];
    const layers = layerNodes([stub("a"), stub("b")], cyclic);
    expect(layers.size).toBe(2);
  });
});

describe("layoutGraph", () => {
  const layout = layoutGraph(nodes, edges);

  it("places every node inside the canvas", () => {
    expect(layout.placed).toHaveLength(nodes.length);
    for (const p of layout.placed) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(layout.width);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(layout.height);
    }
  });

  it("never stacks two nodes on the same spot", () => {
    const seen = new Set<string>();
    for (const p of layout.placed) {
      const key = `${p.x},${p.y}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
    }
  });

  it("is deterministic", () => {
    const again = layoutGraph(nodes, edges);
    expect(again.placed.map((p) => [p.node.id, p.x, p.y])).toEqual(
      layout.placed.map((p) => [p.node.id, p.x, p.y]),
    );
  });
});
