/**
 * Ingest adversarial agent-panel predictions into validated `scorecard.agent.json`
 * sidecars (docs/08 Part 4 — "the panel proposes and predicts; the human disposes").
 *
 *   npx tsx scripts/ingest-agent-scorecards.ts <dir-of-card-jsons>
 *
 * Each input JSON is the judgment the designer-critic returned (register/hero/
 * assessment/verdict + exhibit id). This script supplies the provenance (reviewer
 * agent-panel, date, contentHash), enforces the hero invariant DEFENSIVELY (no hero
 * ⇒ hero-judged dims forced to 0, dependent hero booleans false — the agent is told
 * this, but the machine guarantees it), validates against the rubric schema, and
 * writes the sidecar the `/review` form seeds from. Invalid cards are reported and
 * skipped, never written.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  ScorecardSchema,
  RUBRIC_VERSION,
  HERO_CHECKS,
  isHeroJudged,
  type RegisterDimensionKey,
} from "../content/quality/rubric";
import { contentHash, writeAgentScorecard } from "../src/app/review/_lib/store";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: npx tsx scripts/ingest-agent-scorecards.ts <dir-of-card-jsons>");
  process.exit(1);
}

let ok = 0;
let bad = 0;
for (const f of readdirSync(dir).sort()) {
  if (!f.endsWith(".json")) continue;
  const raw = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
  const id: string = raw.exhibit;

  // Defensive invariant: even if the agent slipped, no hero ⇒ hero-judged dims 0.
  if (raw.hero && raw.hero.present === false) {
    for (const s of raw.register as { dimension: RegisterDimensionKey; score: number }[]) {
      if (isHeroJudged(s.dimension)) s.score = 0;
    }
    for (const c of HERO_CHECKS) {
      if (c.key !== "present") raw.hero[c.key] = false;
    }
  }

  const stamped = {
    ...raw,
    schemaVersion: RUBRIC_VERSION,
    exhibit: id,
    reviewer: "agent-panel",
    date: new Date().toISOString().slice(0, 10),
    contentHash: contentHash(id),
  };

  const parsed = ScorecardSchema.safeParse(stamped);
  if (!parsed.success) {
    bad++;
    console.error(`✖ ${id}: INVALID — ${JSON.stringify(parsed.error.issues)}`);
    continue;
  }
  writeAgentScorecard(id, parsed.data);
  ok++;
  console.log(`✓ ${id}: scorecard.agent.json written (verdict ${parsed.data.verdict.decision})`);
}
console.log(`\n${ok} written · ${bad} rejected`);
