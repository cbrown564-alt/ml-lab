/**
 * Exhibit scaffolder (docs/04, Tooling): `npm run new:exhibit -- <node-id>`.
 * Graph-first authoring — the node must already exist in content/graph/nodes
 * (an exhibit without a place in the territory is a kiosk in a car park).
 * Emits schema-valid, compiling stubs; going live stays a deliberate act
 * (adding the id to content/exhibits/index.ts).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { nodes } from "../content/graph/nodes";

const id = process.argv[2];
if (!id) {
  console.error("usage: npm run new:exhibit -- <node-id>");
  process.exit(1);
}

const node = nodes.find((n) => n.id === id);
if (!node) {
  console.error(
    `No graph node "${id}". Add it to content/graph/nodes.ts first — exhibits live in the territory, not beside it.`,
  );
  process.exit(1);
}

const pascal = id
  .split("-")
  .map((w) => w[0].toUpperCase() + w.slice(1))
  .join("");
const camel = pascal[0].toLowerCase() + pascal.slice(1);

const contentDir = path.join("content", "exhibits", id);
const pageDir = path.join("src", "app", "exhibits", id);
for (const dir of [contentDir, pageDir]) {
  if (existsSync(dir)) {
    console.error(`${dir} already exists — refusing to overwrite.`);
    process.exit(1);
  }
}

const experiment = `import type { ExperimentSpec } from "@/lib/experiment/spec";

/** TODO: datasets must come from committed, generated fixtures (see
 * scripts/generate_fixtures.py) so learners manipulate verified data. */
export const ${camel}Experiment: ExperimentSpec = {
  id: "${id}",
  title: "TODO",
  params: [],
  datasets: [],
  scenarios: [],
};
`;

const narrative = `import type { ExhibitNarrative } from "@/lib/narrative/schema";

/** TODO: hook = the real problem this concept exists to solve; story
 * sections must reference what the learner actually manipulated. Draft with
 * \`npm run brief -- ${id}\`. */
export const ${camel}Narrative: ExhibitNarrative = {
  nodeId: "${id}",
  hook: [],
  story: [],
  fieldNotes: [],
};
`;

const check = `import type { ConceptCheck } from "@/lib/assessment/schema";

/** TODO: distractors must encode real misconceptions; every option carries
 * explanatory feedback (docs/06, B5). */
export const ${camel}Check: ConceptCheck = {
  nodeId: "${id}",
  items: [],
};
`;

const page = `import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";

/** TODO: build the experiment island, then wire narrative + check via
 * ExhibitFrame props. Add "${id}" to content/exhibits/index.ts to open the
 * door, and give every interactive affordance an e2e smoke test. */
export default function ${pascal}Exhibit() {
  return (
    <ExhibitFrame nodeId="${id}" lede={<p>TODO</p>}>
      <div data-surface="lab" className="rounded-xl border border-line p-6">
        <p className="text-ink-muted">Experiment under construction.</p>
      </div>
    </ExhibitFrame>
  );
}
`;

mkdirSync(contentDir, { recursive: true });
mkdirSync(pageDir, { recursive: true });
writeFileSync(path.join(contentDir, "experiment.ts"), experiment);
writeFileSync(path.join(contentDir, "narrative.ts"), narrative);
writeFileSync(path.join(contentDir, "concept-check.ts"), check);
writeFileSync(path.join(pageDir, "page.tsx"), page);

console.log(`Scaffolded "${node.title}" (${id}):`);
console.log(`  ${contentDir}/{experiment,narrative,concept-check}.ts`);
console.log(`  ${pageDir}/page.tsx`);
console.log(`Next: npm run brief -- ${id}  (drafting context for the narrative pass)`);
console.log(`Then: add "${id}" to content/exhibits/index.ts when the door should open.`);
