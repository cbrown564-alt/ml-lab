/**
 * Exhibit scaffolder (docs/04, Tooling): `npm run new:exhibit -- <node-id>`.
 * Graph-first authoring — the node must already exist in content/graph/nodes
 * (an exhibit without a place in the territory is a kiosk in a car park).
 * Emits schema-valid, compiling stubs on the **four-act spine** (See it · Run it ·
 * Break it · Explain it); going live stays a deliberate act (adding the id to
 * content/exhibits/index.ts). Fill the stubs against the brief: `npm run brief`.
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

/** TODO: hook = the real problem this concept exists to solve (a surprise or a
 * prediction, not a definition); story sections must reference what the learner
 * actually manipulates. Draft with \`npm run brief -- ${id}\`. */
export const ${camel}Narrative: ExhibitNarrative = {
  nodeId: "${id}",
  hook: ["TODO — open on a concrete puzzle or prediction."],
  story: [
    { id: "intro", heading: "TODO", paragraphs: ["TODO — the guided beat."] },
  ],
  fieldNotes: ["TODO — where this lives in the wild."],
};
`;

const spine = `import type { Spine } from "@/lib/exhibit/spine";

/** The See-it story spine: which canvas state each beat asserts (object
 * constancy) plus the grammar-hued key terms. \`Frame\` is exhibit-specific — the
 * placeholder graphic ignores it; a real one reads it via \`useActiveFrame\`. */
export type ${pascal}Frame = Record<string, never>;

export const ${camel}Spine: Spine<${pascal}Frame> = [
  { sectionId: "hook", frame: {} },
  { sectionId: "intro", frame: {} },
];
`;

const check = `import type { ConceptCheck } from "@/lib/assessment/schema";

/** TODO: all four kinds where they fit (docs/06 B5 + success metrics): choice
 * (misconception distractors), predict (commit-then-verify), experiment-task
 * (completed in the bench), and the north-star \`transfer\` item (a novel unseen
 * case that can't be passed by parroting). */
export const ${camel}Check: ConceptCheck = {
  nodeId: "${id}",
  items: [],
};
`;

const placeholder = (label: string) =>
  `<div className="rounded-xl border border-line bg-raised p-8 text-center text-ink-muted">${label} — under construction.</div>`;

const page = `import { ExhibitFrame } from "@/components/exhibits/ExhibitFrame";
import { ${camel}Check } from "@content/exhibits/${id}/concept-check";
import { ${camel}Narrative } from "@content/exhibits/${id}/narrative";
import { ${camel}Spine } from "@content/exhibits/${id}/spine";

/** TODO: build the See-it story graphic and the Run-it bench as components, then
 * add the Math (math.ts), the interactive Break-it lab + failure field guide
 * (failures.ts), and the transfer check. Add "${id}" to content/exhibits/index.ts
 * to open the door, and give every interactive affordance an e2e smoke test. */
export default function ${pascal}Exhibit() {
  return (
    <ExhibitFrame
      nodeId="${id}"
      lede={<p>TODO — the opening prose.</p>}
      narrative={${camel}Narrative}
      spine={${camel}Spine}
      check={${camel}Check}
      story={${placeholder("See it — the guided story graphic")}}
      experiment={${placeholder("Run it — the open bench")}}
    />
  );
}
`;

mkdirSync(contentDir, { recursive: true });
mkdirSync(pageDir, { recursive: true });
writeFileSync(path.join(contentDir, "experiment.ts"), experiment);
writeFileSync(path.join(contentDir, "narrative.ts"), narrative);
writeFileSync(path.join(contentDir, "spine.ts"), spine);
writeFileSync(path.join(contentDir, "concept-check.ts"), check);
writeFileSync(path.join(pageDir, "page.tsx"), page);

console.log(`Scaffolded "${node.title}" (${id}) on the four-act spine:`);
console.log(`  ${contentDir}/{experiment,narrative,spine,concept-check}.ts`);
console.log(`  ${pageDir}/page.tsx  (See it + Run it placeholders; add Break it + Explain it)`);
console.log(`Next: npm run brief -- ${id}   (drafting context for the narrative pass)`);
console.log(`Then build the story graphic + bench, the Math (math.ts), the interactive`);
console.log(`Break-it lab + failures.ts, and the transfer check — then open the door in`);
console.log(`content/exhibits/index.ts.`);
