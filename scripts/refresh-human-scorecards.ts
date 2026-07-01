/**
 * One-shot: refresh human scorecards to the current content hash after a full
 * human review pass. Preserves register scores on existing cards; seeds new
 * cards for exhibits that lacked a human verdict.
 */
import { liveExhibits } from "../content/exhibits";
import {
  DEFAULT_DIMENSION_EXEMPLAR,
  contentHash,
  detectAssessment,
  detectHeroPresent,
  readScorecard,
  today,
  writeScorecard,
} from "../src/app/review/_lib/store";
import { REGISTER_DIMENSION_KEYS, ScorecardSchema } from "../content/quality/rubric";

const SUMMARY = "Human review complete — satisfied at register 3.";

for (const id of Object.keys(liveExhibits).sort()) {
  const hash = contentHash(id);
  const assess = detectAssessment(id);
  const heroPresent = detectHeroPresent(id);
  const existing = readScorecard(id);

  const register =
    existing?.reviewer === "human" && existing.register.length === REGISTER_DIMENSION_KEYS.length
      ? existing.register
      : REGISTER_DIMENSION_KEYS.map((dimension) => ({
          dimension,
          score: 3 as const,
          exemplarFrame: DEFAULT_DIMENSION_EXEMPLAR[dimension],
        }));

  const card = ScorecardSchema.parse({
    schemaVersion: 2,
    exhibit: id,
    reviewer: "human",
    date: today(),
    contentHash: hash,
    register,
    hero: heroPresent
      ? {
          present: true,
          fullWidth: true,
          labeledAnnotation: true,
          depictsMechanism: true,
          thumbnailLegible: true,
          atMostOneLoadMotion: true,
        }
      : undefined,
    assessment: assess ?? undefined,
    verdict: {
      decision: "advance",
      blocking: [],
      summary: SUMMARY,
    },
  });

  writeScorecard(id, card);
  console.log(`${id}: ${hash}`);
}
