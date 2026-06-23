/**
 * Rubric v2 mechanizable flagship gate (docs/08 §1b/§1c + Part 4).
 *
 *   npm run check:rubric              # report every live exhibit
 *   npm run check:rubric -- --strict  # exit 1 if any flagship node has a content blocker
 *
 * "The human judges taste; the machine judges everything mechanizable." This is
 * the machine half: it asserts the parts of rubric v2 the build can decide from
 * content alone — a hero specimen exists (§1b), the assessment form isn't exam
 * cosplay (§1c) — and reports whether each exhibit carries an in-date human
 * scorecard (red line #6). It deliberately does NOT block `prebuild` yet: until
 * Foundations is re-judged through `/review`, every node lacks a verdict, so the
 * gate reports the gap rather than failing the green build. `--strict` enforces
 * only the *content* blockers (the ones the build loop can fix today).
 */
import {
  contentHash,
  detectAssessment,
  detectHeroPresent,
  readScorecard,
} from "../src/app/review/_lib/store";
import { liveExhibits } from "../content/exhibits";
import { nodes } from "../content/graph/nodes";

type VerdictState = "absent" | "stale" | "in-date";

type Row = {
  id: string;
  title: string;
  status: string;
  heroPresent: boolean;
  contentBlockers: string[];
  verdict: VerdictState;
};

function evaluate(id: string): Row {
  const node = nodes.find((n) => n.id === id);
  const heroPresent = detectHeroPresent(id);
  const assess = detectAssessment(id);
  const card = readScorecard(id);

  const contentBlockers: string[] = [];
  if (!heroPresent) contentBlockers.push("no hero specimen (§1b)");
  if (assess) {
    if (!assess.playableExperimentTask) contentBlockers.push("no playable experiment-task (§1c)");
    if (!assess.processFeedbackEveryOption) contentBlockers.push("option without process feedback (§1c)");
    if (!assess.notPureMcqStack) contentBlockers.push("pure MCQ stack (§1c)");
  }

  const verdict: VerdictState = !card
    ? "absent"
    : card.contentHash !== contentHash(id)
      ? "stale"
      : "in-date";

  return {
    id,
    title: node?.title ?? id,
    status: node?.status ?? "unknown",
    heroPresent,
    contentBlockers,
    verdict,
  };
}

const rows = Object.keys(liveExhibits).map(evaluate).sort((a, b) => a.id.localeCompare(b.id));

const tick = (b: boolean) => (b ? "✓" : "✗");
console.log("\nRubric v2 — mechanizable flagship gate\n");
console.log(
  ["exhibit".padEnd(28), "status".padEnd(12), "hero", "verdict".padEnd(8), "content blockers"].join(" "),
);
console.log("-".repeat(96));
for (const r of rows) {
  console.log(
    [
      r.id.padEnd(28),
      r.status.padEnd(12),
      ` ${tick(r.heroPresent)}  `,
      r.verdict.padEnd(8),
      r.contentBlockers.join("; ") || "—",
    ].join(" "),
  );
}

const flagship = rows.filter((r) => r.status === "flagship");
const flagshipContentFails = flagship.filter((r) => r.contentBlockers.length > 0);
const flagshipNoVerdict = flagship.filter((r) => r.verdict !== "in-date");

console.log("\nSummary");
console.log(`  ${rows.length} live exhibits · ${flagship.length} marked flagship`);
console.log(
  `  ${flagshipContentFails.length} flagship nodes carry a mechanizable CONTENT blocker (§1b/§1c)`,
);
console.log(
  `  ${flagshipNoVerdict.length} flagship nodes lack an in-date human scorecard (red line #6 — re-judge via /review)`,
);
if (flagshipContentFails.length) {
  console.log("\n  Content blockers (fixable in the build loop):");
  for (const r of flagshipContentFails) console.log(`    · ${r.id}: ${r.contentBlockers.join("; ")}`);
}

const strict = process.argv.includes("--strict");
if (strict && flagshipContentFails.length) {
  console.error(`\n✖ --strict: ${flagshipContentFails.length} flagship node(s) below the rubric v2 content floor`);
  process.exit(1);
}
console.log("");
