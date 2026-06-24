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
import { registerBreaches } from "../content/quality/rubric";
import { type DecisionCandidate } from "../content/quality/decisions";
import {
  contentHash,
  readDecisions,
  readScorecard,
  readTextDoc,
} from "../src/app/review/_lib/store";

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

// Human review feedback is GROUND TRUTH: the panel proposes and predicts; the
// human disposes on taste; the filesystem remembers (docs/08 Part 4). A stored
// verdict overrides the agent panel for the same dimension, and a rejected
// direction in decisions.md must never be re-proposed.
p();
p(`## Human review verdict (ground truth — overrides the agent panel)`);
const card = readScorecard(id);
if (!card) {
  p(`_No human verdict on file yet. Once this exhibit is judged in \`/review\`, its scorecard, blocking items, and this-not-that decisions land here as ground truth. Until then, the agent panel's prediction stands._`);
} else {
  const stale = card.contentHash !== contentHash(id);
  p(`- Verdict: **${card.verdict.decision}** (${card.reviewer}, ${card.date})${stale ? " — ⚠ STALE: content changed since this verdict; re-judge before trusting it" : ""}`);
  if (card.verdict.summary) p(`- Summary: ${card.verdict.summary}`);
  const breaches = registerBreaches(card);
  if (breaches.length) {
    p(`- Below floor (do not regress, fix these): ${breaches.map((b) => `${b.dimension} ${b.score}/<${b.floor}`).join(", ")}`);
  }
  if (card.verdict.blocking.length) {
    p(`- Blocking:`);
    for (const b of card.verdict.blocking) p(`  - ${b}`);
  }
  const notes = readTextDoc(id, "notes.md").trim();
  if (notes) {
    p(`- Notes (what's wrong, pinned to frames):`);
    for (const line of notes.split("\n")) p(`  > ${line}`);
  }
}
const decisions = readDecisions(id);
if (decisions && decisions.slots.length) {
  p();
  p(`### This-not-that decisions (never re-propose a rejected direction)`);
  const describe = (c: DecisionCandidate) =>
    c.text ? `"${c.text}"` : (c.frame ?? c.label ?? c.id);
  for (const slot of decisions.slots) {
    const tag = `${slot.kind}${slot.dimension ? ` · ${slot.dimension}` : ""}`;
    const chosen = slot.candidates.find((c) => c.id === slot.chosen);
    if (chosen) {
      const rejected = slot.candidates.filter((c) => c.id !== slot.chosen);
      p(`- **${tag}** — chose ${chosen.id}: ${describe(chosen)}${slot.why ? ` — ${slot.why}` : ""}`);
      if (rejected.length) {
        p(`  - rejected (do not re-propose): ${rejected.map(describe).join("; ")}`);
      }
      if (slot.refs) p(`  - refs: ${slot.refs}`);
    } else {
      p(
        `- **${tag}** — OPEN: ${slot.prompt}` +
          (slot.candidates.length
            ? ` (${slot.candidates.length} candidate(s) awaiting a pick)`
            : " (awaiting candidates)"),
      );
    }
  }
}

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
