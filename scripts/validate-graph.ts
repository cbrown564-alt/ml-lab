import { nodes } from "../content/graph/nodes";
import { edges } from "../content/graph/edges";
import { journeys } from "../content/journeys/foundations";
import { validateGraph } from "../src/lib/graph/validate";

const issues = validateGraph(nodes, edges, journeys);
const errors = issues.filter((i) => i.level === "error");
const warnings = issues.filter((i) => i.level === "warning");

for (const w of warnings) console.warn(`⚠ ${w.message}`);
for (const e of errors) console.error(`✖ ${e.message}`);

console.log(
  `graph: ${nodes.length} nodes, ${edges.length} edges, ${journeys.length} journeys — ` +
    `${errors.length} errors, ${warnings.length} warnings`,
);

if (errors.length > 0) process.exit(1);
