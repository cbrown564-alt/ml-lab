/**
 * Drafting-context assembler (docs/04, Tooling): `npm run brief -- <node-id>`.
 * Assembles everything a drafting session needs into one markdown bundle on
 * stdout — node, graph neighborhood, journey position, experiment spec if
 * present, house exemplars, and the quality bar. Repeatable prompting, not
 * ad-hoc chats.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { nodes } from "../content/graph/nodes";
import { edges } from "../content/graph/edges";
import { journeys } from "../content/journeys/foundations";

const id = process.argv[2];
const node = nodes.find((n) => n.id === id);
if (!node) {
  console.error(`usage: npm run brief -- <node-id>\nUnknown node: "${id}"`);
  process.exit(1);
}

const byId = new Map(nodes.map((n) => [n.id, n]));
const lines: string[] = [];
const p = (s = "") => lines.push(s);

p(`# Drafting brief: ${node.title} (\`${node.id}\`)`);
p();
p(`> ${node.oneLiner}`);
p();
p(`- Domain: ${node.domain} · Kind: ${node.kind} · Phase: ${node.phase} · Depth: ${node.depth} · Status: ${node.status}`);
p(`- Tags: ${node.tags.join(", ") || "—"}`);

p();
p(`## Graph neighborhood`);
for (const e of edges) {
  if (e.from !== id && e.to !== id) continue;
  const other = byId.get(e.from === id ? e.to : e.from)!;
  const arrow = e.from === id ? `→ ${other.title}` : `← ${other.title}`;
  p(`- ${arrow} (${e.type}, ${e.strength})${e.note ? ` — ${e.note}` : ""}`);
}

p();
p(`## Journey position`);
for (const j of journeys) {
  const idx = j.stops.findIndex((s) => s.nodeId === id);
  if (idx === -1) continue;
  const before = j.stops[idx - 1] ? byId.get(j.stops[idx - 1].nodeId)!.title : "(start)";
  const after = j.stops[idx + 1] ? byId.get(j.stops[idx + 1].nodeId)!.title : "(end)";
  p(`- ${j.title}, stop ${idx + 1}/${j.stops.length}: ${before} → **${node.title}** → ${after}`);
  const framing = j.stops[idx].framing;
  if (framing) p(`  - Framing: ${framing}`);
}

p();
p(`## Experiment spec`);
const specPath = path.join("content", "exhibits", id, "experiment.ts");
if (existsSync(specPath)) {
  p("```ts");
  p(readFileSync(specPath, "utf8").trimEnd());
  p("```");
  p(
    `Prose must reference only controls and scenarios that exist above — "drag the red point" only if there is one.`,
  );
} else {
  p(`_No spec yet. Scaffold with \`npm run new:exhibit -- ${id}\` and build the experiment first: narrative references real controls._`);
}

p();
p(`## House exemplars (match this register)`);
p(`- content/exhibits/linear-regression/narrative.ts — hook/story/field-notes voice`);
p(`- content/exhibits/gradient-descent/concept-check.ts — misconception-encoding distractors with explanatory feedback`);

p();
p(`## The bar (docs/06-evaluation-criteria.md)`);
p(`- One aha per exhibit; intuition before formalism; the experiment is the centerpiece, prose consolidates it.`);
p(`- Scenario prompts make claims — every claim must be pinned by a unit test at the exhibit's budget.`);
p(`- Concept checks: retrieval practice, not recognition theater; feedback addresses the misconception.`);
p(`- Exit test: could the learner explain this at a whiteboard after 20 minutes here?`);

console.log(lines.join("\n"));
