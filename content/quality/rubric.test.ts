import { describe, expect, it } from "vitest";
import {
  ASSESSMENT_CHECKS,
  HERO_CHECKS,
  HERO_JUDGED_DIMENSION_KEYS,
  REGISTER_DIMENSIONS,
  RUBRIC_VERSION,
  ScorecardSchema,
  type HeroSpec,
  type Scorecard,
  assessmentPasses,
  flagshipBlockers,
  heroPasses,
  meetsFlagship,
  registerBreaches,
  scorecardComplete,
} from "./rubric";

/**
 * The rubric is the instrument the whole review system is built on (docs/08
 * Part 1), so its honesty pins matter more than most: a scorecard that validates
 * but can't actually gate flagship would re-open the exact "the bar is prose"
 * hole this schema closes. These tests assert the schema rejects under-specified
 * verdicts and that the floor/completeness predicates agree on what flagship means.
 */

const base: Scorecard = {
  schemaVersion: RUBRIC_VERSION,
  exhibit: "linear-regression",
  reviewer: "human",
  date: "2026-06-23",
  contentHash: "abc123",
  register: REGISTER_DIMENSIONS.map((d) => ({
    dimension: d.key,
    score: 3 as const,
    exemplarFrame: "distill-momentum/00-viewport.png",
    note: "matches the benchmark composition",
  })),
  hero: Object.fromEntries(HERO_CHECKS.map((c) => [c.key, true])) as unknown as Scorecard["hero"],
  assessment: Object.fromEntries(
    ASSESSMENT_CHECKS.map((c) => [c.key, true]),
  ) as unknown as Scorecard["assessment"],
  verdict: { decision: "advance", blocking: [] },
};

describe("rubric v2 scorecard schema", () => {
  it("accepts a complete, flagship-clearing scorecard", () => {
    const parsed = ScorecardSchema.safeParse(base);
    expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    expect(scorecardComplete(base).complete).toBe(true);
    expect(meetsFlagship(base)).toBe(true);
  });

  it("rejects a register sub-score with no named exemplar frame (§1e)", () => {
    const bad = {
      ...base,
      register: [{ dimension: "atmosphere-finish", score: 3, exemplarFrame: "memory" }],
    };
    expect(ScorecardSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an out-of-range score", () => {
    const bad = {
      ...base,
      register: [
        { dimension: "motion", score: 5, exemplarFrame: "distill-momentum/00-viewport.png" },
      ],
    };
    expect(ScorecardSchema.safeParse(bad).success).toBe(false);
  });

  it("flags a register dimension below its floor as a blocker", () => {
    const harshBowl: Scorecard = {
      ...base,
      register: base.register.map((s) =>
        s.dimension === "atmosphere-finish" ? { ...s, score: 2 } : s,
      ),
      verdict: { decision: "hold", blocking: [] },
    };
    expect(registerBreaches(harshBowl)).toHaveLength(1);
    expect(meetsFlagship(harshBowl)).toBe(false);
    expect(flagshipBlockers(harshBowl).some((b) => b.includes("atmosphere-finish"))).toBe(true);
  });

  it("treats a missing hero as flagship-incomplete (§1b doorway fix)", () => {
    const noHero: Scorecard = { ...base, hero: undefined };
    expect(scorecardComplete(noHero).missing).toContain("hero-spec");
    expect(meetsFlagship(noHero)).toBe(false);
  });

  it("fails a hero that exists but isn't poster-worthy", () => {
    expect(heroPasses({ ...base.hero!, thumbnailLegible: false })).toBe(false);
  });

  it("rejects a hero-judged dimension scored above 0 when no hero is present", () => {
    // The exact contradiction this invariant exists to kill: "mechanism-in-the-
    // picture 3" while the hero is absent — there is no protagonist to judge.
    const noHero: HeroSpec = {
      present: false,
      fullWidth: false,
      labeledAnnotation: false,
      depictsMechanism: false,
      thumbnailLegible: false,
      atMostOneLoadMotion: false,
    };
    const contradictory = {
      ...base,
      hero: noHero,
      register: base.register.map((s) =>
        s.dimension === "mechanism-in-the-picture" ? { ...s, score: 3 } : { ...s, score: 0 },
      ),
      verdict: { decision: "hold" as const, blocking: [] },
    };
    const parsed = ScorecardSchema.safeParse(contradictory);
    expect(parsed.success).toBe(false);
    expect(JSON.stringify(parsed.error?.issues)).toContain("mechanism-in-the-picture");
  });

  it("accepts a hero-less card when every hero-judged dim is 0", () => {
    const noHero: HeroSpec = {
      present: false,
      fullWidth: false,
      labeledAnnotation: false,
      depictsMechanism: false,
      thumbnailLegible: false,
      atMostOneLoadMotion: false,
    };
    const honest = {
      ...base,
      hero: noHero,
      register: base.register.map((s) =>
        HERO_JUDGED_DIMENSION_KEYS.includes(s.dimension as (typeof HERO_JUDGED_DIMENSION_KEYS)[number])
          ? { ...s, score: 0 as const }
          : s,
      ),
      verdict: { decision: "hold" as const, blocking: [] },
    };
    expect(ScorecardSchema.safeParse(honest).success).toBe(true);
  });

  it("rejects a hero sub-check set true while hero.present is false", () => {
    const inconsistentHero: HeroSpec = {
      present: false,
      fullWidth: true, // cannot be full-width if there is no hero
      labeledAnnotation: false,
      depictsMechanism: false,
      thumbnailLegible: false,
      atMostOneLoadMotion: false,
    };
    const bad = {
      ...base,
      hero: inconsistentHero,
      register: base.register.map((s) =>
        HERO_JUDGED_DIMENSION_KEYS.includes(s.dimension as (typeof HERO_JUDGED_DIMENSION_KEYS)[number])
          ? { ...s, score: 0 as const }
          : s,
      ),
    };
    expect(ScorecardSchema.safeParse(bad).success).toBe(false);
  });

  it("fails a pure MCQ stack outright (§1c exam-cosplay gate)", () => {
    expect(assessmentPasses({ ...base.assessment!, notPureMcqStack: false })).toBe(false);
    const mcqStack: Scorecard = {
      ...base,
      assessment: { ...base.assessment!, notPureMcqStack: false },
    };
    expect(meetsFlagship(mcqStack)).toBe(false);
  });
});
