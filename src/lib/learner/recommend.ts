import type { ConceptEdge, ConceptNode, Journey } from "@/lib/graph/schema";
import type { MasteryLevel, NodeMastery } from "./store";

/**
 * The recommender (docs/06, A2): every recommendation is explainable in one
 * sentence — Nielsen's visibility of system status applied to the mastery
 * model. No black-box "next": the reason IS the recommendation, and it only
 * ever points at doors that are actually open.
 *
 * Pure and data-in/data-out: the graph and journeys arrive as arguments so
 * the lib layer stays content-free (C2).
 */

export type Recommendation = {
  nodeId: string;
  /** One learner-facing sentence: why this, why now. */
  reason: string;
};

export type RecommendInput = {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  journeys: Journey[];
  mastery: Record<string, NodeMastery>;
  /** Only nodes with a live exhibit may be recommended — never a locked door. */
  liveIds: ReadonlySet<string>;
};

const DONE: ReadonlySet<MasteryLevel> = new Set(["assessed", "mastered"]);
const STARTED: ReadonlySet<MasteryLevel> = new Set(["seen", "practiced"]);

export function recommendNext({
  nodes,
  edges,
  journeys,
  mastery,
  liveIds,
}: RecommendInput): Recommendation[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const levelOf = (id: string): MasteryLevel => mastery[id]?.level ?? "untouched";
  const touched = (id: string) => levelOf(id) !== "untouched";

  const recs: Recommendation[] = [];
  const recommended = new Set<string>();
  const add = (nodeId: string, reason: string) => {
    if (recommended.has(nodeId)) return;
    recommended.add(nodeId);
    recs.push({ nodeId, reason });
  };

  // 1. Finish what you started: explored but never took the concept check.
  //    Most recently touched first — that's the freshest thread to pick up.
  const started = nodes
    .filter((n) => liveIds.has(n.id) && STARTED.has(levelOf(n.id)))
    .sort((a, b) =>
      (mastery[b.id]?.lastTouched ?? "").localeCompare(mastery[a.id]?.lastTouched ?? ""),
    );
  for (const n of started) {
    add(
      n.id,
      `You've explored ${n.title} but haven't taken its concept check yet.`,
    );
  }

  // 2. The graph unlocks it: every prerequisite is behind you.
  for (const n of nodes) {
    if (!liveIds.has(n.id) || touched(n.id)) continue;
    const prereqs = edges
      .filter((e) => e.to === n.id && e.type === "requires")
      .map((e) => byId.get(e.from)!);
    const cleared = prereqs.filter((p) => DONE.has(levelOf(p.id)));
    if (prereqs.length > 0 && cleared.length === prereqs.length) {
      const names = cleared.map((p) => p.title).join(" and ");
      add(n.id, `Because you finished ${names}, which it builds on.`);
    }
  }

  // 3. The journey continues: the first open, unfinished stop after the
  //    learner's footprints.
  for (const journey of journeys) {
    let walkedHere = false;
    for (const stop of journey.stops) {
      if (touched(stop.nodeId)) {
        walkedHere = true;
        continue;
      }
      if (walkedHere && liveIds.has(stop.nodeId)) {
        const n = byId.get(stop.nodeId)!;
        add(n.id, `The next open stop on the ${journey.title} journey.`);
        break;
      }
    }
  }

  // 4. Cold start: nothing touched yet — the front door of the first journey.
  if (recs.length === 0 && Object.keys(mastery).length === 0) {
    for (const journey of journeys) {
      const first = journey.stops.find((s) => liveIds.has(s.nodeId));
      if (first) {
        const n = byId.get(first.nodeId)!;
        add(n.id, `The first open stop on the ${journey.title} journey.`);
        break;
      }
    }
  }

  return recs.slice(0, 3);
}
