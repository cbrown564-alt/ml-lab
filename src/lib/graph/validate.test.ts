import { describe, expect, it } from "vitest";
import { validateGraph, type GraphIssue } from "./validate";
import type { ConceptEdge, ConceptNode, Journey } from "./schema";

const node = (id: string, over: Partial<ConceptNode> = {}): ConceptNode => ({
  id,
  title: id,
  oneLiner: "A test node.",
  domain: "supervised",
  tags: [],
  kind: "concept",
  phase: 1,
  depth: "core",
  status: "stub",
  ...over,
});

const prereq = (from: string, to: string, strength: "hard" | "soft" = "hard"): ConceptEdge => ({
  from,
  to,
  type: "prerequisite",
  strength,
});

const errors = (issues: GraphIssue[]) => issues.filter((i) => i.level === "error");

describe("validateGraph", () => {
  it("accepts a healthy graph", () => {
    const issues = validateGraph(
      [node("a"), node("b")],
      [prereq("a", "b")],
      [],
    );
    expect(errors(issues)).toHaveLength(0);
  });

  it("rejects prerequisite cycles", () => {
    const issues = validateGraph(
      [node("a"), node("b"), node("c")],
      [prereq("a", "b"), prereq("b", "c"), prereq("c", "a")],
      [],
    );
    expect(errors(issues).some((e) => e.message.includes("cycle"))).toBe(true);
  });

  it("rejects dangling edge endpoints", () => {
    const issues = validateGraph([node("a")], [prereq("a", "ghost")], []);
    expect(errors(issues).some((e) => e.message.includes("ghost"))).toBe(true);
  });

  it("rejects duplicate node ids", () => {
    const issues = validateGraph([node("a"), node("a")], [], []);
    expect(errors(issues).some((e) => e.message.includes("duplicate"))).toBe(true);
  });

  it("rejects nodes disconnected from phase-1 territory", () => {
    const issues = validateGraph(
      [node("a"), node("island", { phase: 2 })],
      [],
      [],
    );
    expect(errors(issues).some((e) => e.message.includes("island"))).toBe(true);
  });

  it("rejects contrasts edges without a note", () => {
    const issues = validateGraph(
      [node("a"), node("b")],
      [{ from: "a", to: "b", type: "contrasts", strength: "soft" } as ConceptEdge],
      [],
    );
    expect(errors(issues).length).toBeGreaterThan(0);
  });

  it("rejects a journey stop appearing before its in-journey hard prerequisite", () => {
    const journey: Journey = {
      id: "j",
      title: "J",
      audience: "tests",
      description: "test journey",
      stops: [{ nodeId: "b" }, { nodeId: "a" }],
    };
    const issues = validateGraph([node("a"), node("b")], [prereq("a", "b")], [journey]);
    expect(errors(issues).some((e) => e.message.includes("before its hard prerequisite"))).toBe(true);
  });

  it("warns (not errors) when a hard prerequisite is missing from the journey", () => {
    const journey: Journey = {
      id: "j",
      title: "J",
      audience: "tests",
      description: "test journey",
      stops: [{ nodeId: "b" }, { nodeId: "c" }],
    };
    const issues = validateGraph(
      [node("a"), node("b"), node("c")],
      [prereq("a", "b"), prereq("b", "c", "soft")],
      [journey],
    );
    expect(errors(issues)).toHaveLength(0);
    expect(issues.some((i) => i.level === "warning" && i.message.includes("not covered"))).toBe(true);
  });
});
