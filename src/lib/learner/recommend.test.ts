import { describe, expect, it } from "vitest";
import type { ConceptEdge, ConceptNode, Journey } from "@/lib/graph/schema";
import type { NodeMastery } from "./store";
import { recommendNext } from "./recommend";

/**
 * The recommender's contract (docs/06, A2): explainable, never points at a
 * closed door, and degrades to the journey's front door for a cold visitor.
 */

const node = (id: string, title: string): ConceptNode => ({
  id,
  title,
  oneLiner: `${title} in one line.`,
  domain: "supervised",
  tags: [],
  kind: "concept",
  phase: 1,
  depth: "core",
  status: "stub",
});

const nodes = [
  node("a", "Alpha"),
  node("b", "Beta"),
  node("c", "Gamma"),
  node("d", "Delta"),
];

const edges: ConceptEdge[] = [
  { from: "a", to: "b", type: "requires", strength: "hard" },
  { from: "b", to: "c", type: "requires", strength: "hard" },
];

const journeys: Journey[] = [
  {
    id: "trail",
    title: "Trail",
    audience: "testers",
    description: "A walk through the alphabet.",
    stops: [{ nodeId: "a" }, { nodeId: "b" }, { nodeId: "c" }, { nodeId: "d" }],
  },
];

const m = (level: NodeMastery["level"], lastTouched = "2026-06-12T00:00:00Z"): NodeMastery => ({
  level,
  lastTouched,
  evidence: [],
});

const live = (...ids: string[]) => new Set(ids);

describe("recommendNext", () => {
  it("gives a cold visitor the journey's first open door", () => {
    const recs = recommendNext({ nodes, edges, journeys, mastery: {}, liveIds: live("a", "b") });
    expect(recs[0].nodeId).toBe("a");
    expect(recs[0].reason).toMatch(/first open stop on the Trail journey/);
  });

  it("asks the learner to finish what they started, freshest first", () => {
    const recs = recommendNext({
      nodes,
      edges,
      journeys,
      mastery: {
        a: m("practiced", "2026-06-10T00:00:00Z"),
        b: m("seen", "2026-06-11T00:00:00Z"),
      },
      liveIds: live("a", "b"),
    });
    expect(recs[0].nodeId).toBe("b");
    expect(recs[0].reason).toMatch(/haven't taken its concept check/);
    expect(recs[1].nodeId).toBe("a");
  });

  it("unlocks a node when its prerequisites are done, and says why", () => {
    const recs = recommendNext({
      nodes,
      edges,
      journeys,
      mastery: { a: m("mastered") },
      liveIds: live("a", "b"),
    });
    expect(recs[0].nodeId).toBe("b");
    expect(recs[0].reason).toBe("Because you finished Alpha, which it builds on.");
  });

  it("continues the journey past the learner's footprints", () => {
    // b is mastered but c is not live; d is the next open stop.
    const recs = recommendNext({
      nodes,
      edges,
      journeys,
      mastery: { a: m("mastered"), b: m("mastered") },
      liveIds: live("a", "b", "d"),
    });
    expect(recs.map((r) => r.nodeId)).toContain("d");
    const d = recs.find((r) => r.nodeId === "d")!;
    expect(d.reason).toBe("The next open stop on the Trail journey.");
  });

  it("never recommends a closed door", () => {
    const recs = recommendNext({
      nodes,
      edges,
      journeys,
      mastery: { a: m("mastered"), b: m("mastered") },
      liveIds: live("a", "b"),
    });
    for (const r of recs) expect(["a", "b"]).toContain(r.nodeId);
  });

  it("returns nothing when every open exhibit is fully done", () => {
    const recs = recommendNext({
      nodes,
      edges,
      journeys,
      mastery: { a: m("mastered"), b: m("mastered") },
      liveIds: live("a"),
    });
    expect(recs).toEqual([]);
  });
});
