import {
  ConceptNodeSchema,
  ConceptEdgeSchema,
  JourneySchema,
  type ConceptNode,
  type ConceptEdge,
  type Journey,
} from "./schema";

export type GraphIssue = { level: "error" | "warning"; message: string };

/**
 * Structural validation of the knowledge graph (docs/03-data-model.md):
 * schema conformance, unique ids, no dangling edges, `requires` DAG,
 * no disconnected nodes, journey-prerequisite coherence.
 * A broken graph cannot ship (docs/06, C3).
 */
export function validateGraph(
  nodes: ConceptNode[],
  edges: ConceptEdge[],
  journeys: Journey[],
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const error = (message: string) => issues.push({ level: "error", message });
  const warning = (message: string) => issues.push({ level: "warning", message });

  for (const [i, n] of nodes.entries()) {
    const r = ConceptNodeSchema.safeParse(n);
    if (!r.success) error(`node[${i}] (${n?.id ?? "?"}): ${r.error.issues[0].message}`);
  }
  for (const [i, e] of edges.entries()) {
    const r = ConceptEdgeSchema.safeParse(e);
    if (!r.success) error(`edge[${i}] (${e?.from}→${e?.to}): ${r.error.issues[0].message}`);
  }
  for (const [i, j] of journeys.entries()) {
    const r = JourneySchema.safeParse(j);
    if (!r.success) error(`journey[${i}] (${j?.id ?? "?"}): ${r.error.issues[0].message}`);
  }

  const ids = new Set<string>();
  for (const n of nodes) {
    if (ids.has(n.id)) error(`duplicate node id: ${n.id}`);
    ids.add(n.id);
  }

  for (const e of edges) {
    if (!ids.has(e.from)) error(`edge ${e.from}→${e.to}: unknown node '${e.from}'`);
    if (!ids.has(e.to)) error(`edge ${e.from}→${e.to}: unknown node '${e.to}'`);
  }

  // `requires` edges must form a DAG.
  const prereqOut = new Map<string, string[]>();
  for (const e of edges) {
    if (e.type !== "requires") continue;
    prereqOut.set(e.from, [...(prereqOut.get(e.from) ?? []), e.to]);
  }
  const state = new Map<string, "visiting" | "done">();
  const visit = (id: string, path: string[]): void => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") {
      error(`prerequisite cycle: ${[...path.slice(path.indexOf(id)), id].join(" → ")}`);
      return;
    }
    state.set(id, "visiting");
    for (const next of prereqOut.get(id) ?? []) visit(next, [...path, id]);
    state.set(id, "done");
  };
  for (const id of ids) visit(id, []);

  // No disconnected nodes: every node connects (undirected) to a phase-1 node.
  const phase1 = nodes.filter((n) => n.phase === 1).map((n) => n.id);
  if (nodes.length > 0 && phase1.length === 0) {
    error("graph has no phase-1 nodes");
  } else if (nodes.length > 1) {
    const adjacent = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!ids.has(e.from) || !ids.has(e.to)) continue;
      (adjacent.get(e.from) ?? adjacent.set(e.from, new Set()).get(e.from)!).add(e.to);
      (adjacent.get(e.to) ?? adjacent.set(e.to, new Set()).get(e.to)!).add(e.from);
    }
    const reached = new Set<string>(phase1);
    const queue = [...phase1];
    while (queue.length) {
      for (const next of adjacent.get(queue.pop()!) ?? []) {
        if (!reached.has(next)) {
          reached.add(next);
          queue.push(next);
        }
      }
    }
    for (const n of nodes) {
      if (!reached.has(n.id)) error(`node '${n.id}' is not connected to any phase-1 node`);
    }
  }

  // Journeys: stops exist; a hard prerequisite that is itself a stop must come first.
  const hardPrereqsOf = new Map<string, string[]>();
  for (const e of edges) {
    if (e.type === "requires" && e.strength === "hard") {
      hardPrereqsOf.set(e.to, [...(hardPrereqsOf.get(e.to) ?? []), e.from]);
    }
  }
  for (const j of journeys) {
    const seen = new Set<string>();
    const stopIds = new Set(j.stops.map((s) => s.nodeId));
    for (const stop of j.stops) {
      if (!ids.has(stop.nodeId)) {
        error(`journey '${j.id}': unknown stop '${stop.nodeId}'`);
        continue;
      }
      for (const prereq of hardPrereqsOf.get(stop.nodeId) ?? []) {
        if (stopIds.has(prereq) && !seen.has(prereq)) {
          error(`journey '${j.id}': '${stop.nodeId}' appears before its hard prerequisite '${prereq}'`);
        } else if (!stopIds.has(prereq)) {
          warning(`journey '${j.id}': '${stop.nodeId}' has hard prerequisite '${prereq}' not covered by the journey`);
        }
      }
      seen.add(stop.nodeId);
    }
  }

  return issues;
}
