import { z } from "zod";

/**
 * Rubric v2 — a decomposed, testable instrument (docs/08, Part 1).
 *
 * `docs/06-evaluation-criteria.md` is excellent prose and a poor instrument: it
 * scores a whole view's visual register as one gestalt number a reviewer can
 * rationalize, which is how bare-scatter heroes and MCQ-stack "Explain it" acts
 * shipped flagship on all 15 nodes. This file is the fix: it ports the docs/06
 * bar into a **schema** — a fixed set of individually-failable sub-dimensions,
 * each scored 0–4 against a *named* exemplar frame.
 *
 * Schema-first (Pillar C3): the rubric is typed and zod-validated like every
 * other content artifact, so the review UI renders the form from it, the agent
 * panel writes against it, and the build can assert a flagship node has a
 * complete, in-date scorecard. This module is **pure** — no fs, no React — so it
 * is safe to import from both server components and the client review form. The
 * filesystem reading/writing and the staleness check live in
 * `src/lib/quality/*`, which imports these shapes.
 */

export const RUBRIC_VERSION = 2 as const;

/**
 * The 0–4 scale, verbatim from docs/06: "0 = absent/broken · 1 = present but
 * weak · 2 = competent ('good') · 3 = matches the benchmark set · 4 = would be
 * cited as an exemplar by the benchmark community." The requirement is delight,
 * so **2 is not a passing grade** for a flagship visual.
 */
export const SCORE_SCALE: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "absent / broken",
  1: "present but weak",
  2: "competent (good)",
  3: "matches the benchmark set",
  4: "would be cited as an exemplar",
};

export const ScoreSchema = z
  .number()
  .int()
  .min(0)
  .max(4)
  .describe("0–4 against a named exemplar frame (docs/06 scale)");

export type Score = z.infer<typeof ScoreSchema>;

/**
 * An act of the four-act spine, plus the two cross-cutting surfaces the rubric
 * also judges: the homepage (the lab front door) and a cluster lineup (§1d).
 */
export const REVIEW_SURFACES = ["see", "run", "break", "explain", "home", "cluster"] as const;
export type ReviewSurface = (typeof REVIEW_SURFACES)[number];

/* -------------------------------------------------------------------------- */
/* 1a. Visual register, decomposed (was docs/06 B2/B6 "register N")           */
/* -------------------------------------------------------------------------- */

/**
 * Each register dimension is an individually-failable check with a *failable
 * question* and a flagship floor. `delight` flags the dimensions that carry the
 * "send it to a friend" load (docs/08 Part 6, decision 3): the floor is data, so
 * raising a delight dimension to 4 is a one-line change here — the plan's stated
 * default is ≥3 across the board, which is what ships.
 *
 * Order follows the **reading experience** — the hero first, then the four-act
 * spine (See → Run → Break) — so the review form walks the page top-to-bottom the
 * way a learner meets it, not in an arbitrary order. (The `/review` stage pins
 * each dimension to the screenshot it's judged on, so stepping the list also steps
 * the frames in order.)
 */
export const REGISTER_DIMENSIONS = [
  {
    key: "hero-as-protagonist",
    label: "Hero as protagonist",
    question:
      "Is the opening visual full-width, composed, poster-worthy in isolation (legible as a thumbnail)?",
    floor: 3,
    delight: true,
  },
  {
    key: "mechanism-in-the-picture",
    label: "Mechanism-in-the-picture",
    question:
      "Does the hero show the mechanism (residuals, the bowl, the boundary), not just the data?",
    floor: 3,
    delight: false,
  },
  {
    key: "annotation-integration",
    label: "Annotation-integration",
    question:
      "Does the graphic carry its own labels/explanation (signaling), or does meaning live only in adjacent prose?",
    floor: 3,
    delight: false,
  },
  {
    key: "atmosphere-finish",
    label: "Atmosphere & finish",
    question: "Smoothness, focal hierarchy, restraint — Distill-soft, not aliased/harsh?",
    floor: 3,
    delight: true,
  },
  {
    key: "motion",
    label: "Motion",
    question:
      "Is each animation explanatory/transitional (not decorative), and steppable where complex?",
    floor: 3,
    delight: false,
  },
  {
    key: "colour-discipline",
    label: "Colour discipline",
    question:
      "Is the semantic grammar held, with no dilution (an all-red field draining 'error'), and AA in prose?",
    floor: 3,
    delight: false,
  },
] as const;

export type RegisterDimensionKey = (typeof REGISTER_DIMENSIONS)[number]["key"];

export const REGISTER_DIMENSION_KEYS = REGISTER_DIMENSIONS.map((d) => d.key) as [
  RegisterDimensionKey,
  ...RegisterDimensionKey[],
];

export const RegisterDimensionEnum = z.enum(REGISTER_DIMENSION_KEYS);

/**
 * The register dimensions that are a judgment **of the hero specifically**:
 * "is the opening visual poster-worthy" and "does *the hero* show the mechanism".
 * If an exhibit has no hero (`hero.present === false`) there is no protagonist to
 * judge, so these cannot be scored above 0 — encoded as a schema invariant on
 * `ScorecardSchema` (below) so the contradiction "mechanism 3 while hero absent"
 * is *unrepresentable*, not merely discouraged. Shared by the `/review` seed logic
 * and the scoring form so all three agree on which scores the hero gates.
 */
export const HERO_JUDGED_DIMENSION_KEYS = [
  "hero-as-protagonist",
  "mechanism-in-the-picture",
] as const satisfies readonly RegisterDimensionKey[];

export function isHeroJudged(key: RegisterDimensionKey): boolean {
  return (HERO_JUDGED_DIMENSION_KEYS as readonly string[]).includes(key);
}

/**
 * §1e — Pinned-benchmark verdict. Every register sub-score **names a specific
 * exemplar PNG**; a score with no named frame is invalid and the schema rejects
 * it. The frame is a path into `docs/exemplars/<slug>/<file>.png`, so the verdict
 * "gd hero vs distill-momentum/00 · annotation-integration: 2" is reconstructable
 * and re-openable against pinned pixels, never memory.
 */
const exemplarFrame = z
  .string()
  .regex(
    /^[a-z0-9-]+\/[\w.-]+\.png$/,
    "name a pinned exemplar frame as '<slug>/<file>.png' (docs/exemplars) — a score with no named frame is invalid",
  );

export const RegisterSubScoreSchema = z.object({
  dimension: RegisterDimensionEnum,
  score: ScoreSchema,
  /** The pinned exemplar frame this score was judged against (§1e). */
  exemplarFrame,
  /** The captured exhibit frame compared (docs/reviews/captures/...), if recorded. */
  capturedFrame: z.string().optional(),
  /** The verdict sentence: what specifically holds the score where it is. */
  note: z.string().min(1).optional(),
});

export type RegisterSubScore = z.infer<typeof RegisterSubScoreSchema>;

/* -------------------------------------------------------------------------- */
/* 1b. The hero spec — closes the "poster-worthy is an adjective" gap          */
/* -------------------------------------------------------------------------- */

/**
 * A flagship hero MUST: (a) be full content width; (b) carry ≥1 labeled
 * annotation in-graphic; (c) depict the mechanism, not only the data; (d) remain
 * legible at thumbnail scale; (e) perform at most one explanatory load motion.
 * **An exhibit without a hero cannot be flagship** (docs/08 §1b) — which directly
 * fixes the `what-is-ml` doorway. `present` is mechanizable (does the page pass a
 * `hero`?); the rest are judged on the captured frame.
 */
export const HERO_CHECKS = [
  { key: "present", label: "A hero exists (page passes a hero specimen)", mechanizable: true },
  { key: "fullWidth", label: "Full content width", mechanizable: false },
  { key: "labeledAnnotation", label: "≥1 labeled annotation in-graphic", mechanizable: false },
  { key: "depictsMechanism", label: "Depicts the mechanism, not only the data", mechanizable: false },
  { key: "thumbnailLegible", label: "Legible at thumbnail scale", mechanizable: false },
  { key: "atMostOneLoadMotion", label: "At most one explanatory load motion", mechanizable: false },
] as const;

export type HeroCheckKey = (typeof HERO_CHECKS)[number]["key"];

export const HeroSpecSchema = z.object({
  present: z.boolean(),
  fullWidth: z.boolean(),
  labeledAnnotation: z.boolean(),
  depictsMechanism: z.boolean(),
  thumbnailLegible: z.boolean(),
  atMostOneLoadMotion: z.boolean(),
  note: z.string().optional(),
});

export type HeroSpec = z.infer<typeof HeroSpecSchema>;

/** Every hero check must pass — a hero is pass/fail, not a register score. */
export function heroPasses(hero: HeroSpec): boolean {
  return HERO_CHECKS.every((c) => hero[c.key] === true);
}

/* -------------------------------------------------------------------------- */
/* 1c. The assessment-form spec — kills exam cosplay                           */
/* -------------------------------------------------------------------------- */

/**
 * "Explain it" MUST contain: ≥1 `experiment-task` that is actually embedded and
 * playable (not text instructions); the `transfer` item rendered as an
 * interaction or open prompt rather than MCQ where the concept allows; and
 * feedback on *process* for every option. **A pure MCQ stack is an automatic B5
 * fail** regardless of item quality (docs/08 §1c).
 */
export const ASSESSMENT_CHECKS = [
  {
    key: "playableExperimentTask",
    label: "≥1 experiment-task that is actually embedded and playable",
    mechanizable: true,
  },
  {
    key: "transferIsInteractiveOrOpen",
    label: "transfer rendered as interaction / open prompt where the concept allows",
    mechanizable: false,
  },
  {
    key: "processFeedbackEveryOption",
    label: "feedback on process for every option",
    mechanizable: true,
  },
  {
    key: "notPureMcqStack",
    label: "not a pure MCQ stack (automatic B5 fail if it is)",
    mechanizable: true,
  },
] as const;

export type AssessmentCheckKey = (typeof ASSESSMENT_CHECKS)[number]["key"];

export const AssessmentFormSchema = z.object({
  playableExperimentTask: z.boolean(),
  transferIsInteractiveOrOpen: z.boolean(),
  processFeedbackEveryOption: z.boolean(),
  notPureMcqStack: z.boolean(),
  note: z.string().optional(),
});

export type AssessmentForm = z.infer<typeof AssessmentFormSchema>;

export function assessmentPasses(a: AssessmentForm): boolean {
  return ASSESSMENT_CHECKS.every((c) => a[c.key] === true);
}

/* -------------------------------------------------------------------------- */
/* The verdict + the durable scorecard                                         */
/* -------------------------------------------------------------------------- */

export const VerdictSchema = z.object({
  /** advance toward/at flagship, or hold with the blocking items enumerated. */
  decision: z.enum(["advance", "hold"]),
  /** The blocking items, if holding — each a concrete, fixable sentence. */
  blocking: z.array(z.string()).default([]),
  summary: z.string().optional(),
});

export type Verdict = z.infer<typeof VerdictSchema>;

/**
 * The durable, machine-readable verdict written to
 * `docs/reviews/feedback/<exhibit>/scorecard.json`. A "3/5, the bowl is too
 * harsh" becomes a file the next loop iteration reads, not a chat message that
 * evaporates (docs/08 design principle 2).
 *
 * `contentHash` pins the scorecard to the exhibit content it judged: if the
 * exhibit changes after its last human verdict, the hash diverges and the
 * scorecard is **stale** — a flagship blocker the build asserts, so "flagship"
 * stops being able to lie (docs/06 red line #6).
 */
export const ScorecardSchema = z.object({
  schemaVersion: z.literal(RUBRIC_VERSION),
  exhibit: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "exhibit is a kebab-case node id"),
  /** Who rendered the verdict — the human taste-holder, or a predicting agent. */
  reviewer: z.enum(["human", "agent-panel"]),
  /** ISO date (YYYY-MM-DD) the verdict was rendered. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date is YYYY-MM-DD"),
  /** Content hash at review time — staleness ground truth (see above). */
  contentHash: z.string().min(1),
  /** §1a — one sub-score per register dimension, each naming an exemplar frame. */
  register: z.array(RegisterSubScoreSchema),
  /** §1b — the hero spec (a flagship hero is pass/fail). */
  hero: HeroSpecSchema.optional(),
  /** §1c — the assessment-form spec for "Explain it". */
  assessment: AssessmentFormSchema.optional(),
  verdict: VerdictSchema,
}).superRefine((card, ctx) => {
  // The hero invariant: with no hero specimen there is no protagonist to judge,
  // so the hero-judged register dims cannot score above 0 and the dependent hero
  // sub-checks cannot hold. This is what makes "mechanism-in-the-picture 3 while
  // hero absent" a *parse error*, not a verdict a reviewer can rationalize.
  if (!card.hero || card.hero.present) return;
  for (const sub of card.register) {
    if (isHeroJudged(sub.dimension) && sub.score !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["register"],
        message: `${sub.dimension} must be 0 when no hero is present — there is no protagonist to judge (got ${sub.score})`,
      });
    }
  }
  for (const c of HERO_CHECKS) {
    if (c.key === "present") continue;
    if (card.hero[c.key] === true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hero", c.key],
        message: `hero.${c.key} cannot be true when hero.present is false`,
      });
    }
  }
});

export type Scorecard = z.infer<typeof ScorecardSchema>;

/* -------------------------------------------------------------------------- */
/* 1d. Cross-exhibit consistency gate — operationalizes the A5 lineup          */
/* -------------------------------------------------------------------------- */

/**
 * A **cluster-level** check, not per-exhibit: shuffle the cluster's hero frames
 * with the exemplar frames; the human marks any that read as the weakest, and any
 * inconsistency in opening grammar (hero present/absent, masthead structure)
 * across the cluster is a blocking finding. This is the only way "the journey's
 * first node has the weakest opening" becomes visible.
 */
export const ClusterConsistencySchema = z.object({
  schemaVersion: z.literal(RUBRIC_VERSION),
  cluster: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewer: z.enum(["human", "agent-panel"]),
  /** Exhibits whose hero read as the weakest in the shuffled lineup. */
  weakestReads: z.array(z.string()).default([]),
  /** Opening-grammar inconsistencies across the cluster (blocking). */
  openingGrammarBreaks: z.array(z.string()).default([]),
  verdict: VerdictSchema,
});

export type ClusterConsistency = z.infer<typeof ClusterConsistencySchema>;

/* -------------------------------------------------------------------------- */
/* Floors + completeness predicates (pure)                                     */
/* -------------------------------------------------------------------------- */

export function registerFloor(dimension: RegisterDimensionKey): number {
  return REGISTER_DIMENSIONS.find((d) => d.key === dimension)!.floor;
}

export type FloorBreach = {
  dimension: RegisterDimensionKey;
  score: Score;
  floor: number;
};

/** Register sub-scores that sit below their flagship floor. */
export function registerBreaches(card: Scorecard): FloorBreach[] {
  return card.register
    .map((s) => ({ dimension: s.dimension, score: s.score, floor: registerFloor(s.dimension) }))
    .filter((b) => b.score < b.floor);
}

/** A scorecard is *complete* when it can actually gate flagship: every register
 * dimension scored, the hero + assessment specs present, and a verdict rendered.
 * An incomplete scorecard cannot certify flagship (docs/06 red line #6). */
export function scorecardComplete(card: Scorecard): { complete: boolean; missing: string[] } {
  const missing: string[] = [];
  const scored = new Set(card.register.map((s) => s.dimension));
  for (const d of REGISTER_DIMENSIONS) {
    if (!scored.has(d.key)) missing.push(`register:${d.key}`);
  }
  if (!card.hero) missing.push("hero-spec");
  if (!card.assessment) missing.push("assessment-form");
  return { complete: missing.length === 0, missing };
}

/**
 * The full flagship gate over a *complete* scorecard: every register dimension at
 * or above its floor, the hero spec passing, the assessment-form passing, and the
 * verdict an "advance". Returns the blocking reasons so the caller can report
 * them. (Completeness + freshness are checked separately, with fs context.)
 */
export function flagshipBlockers(card: Scorecard): string[] {
  const blockers: string[] = [];
  for (const b of registerBreaches(card)) {
    blockers.push(`${b.dimension} ${b.score} < floor ${b.floor}`);
  }
  if (card.hero && !heroPasses(card.hero)) {
    const failed = HERO_CHECKS.filter((c) => card.hero![c.key] !== true).map((c) => c.key);
    blockers.push(`hero spec fails: ${failed.join(", ")}`);
  }
  if (card.assessment && !assessmentPasses(card.assessment)) {
    const failed = ASSESSMENT_CHECKS.filter((c) => card.assessment![c.key] !== true).map((c) => c.key);
    blockers.push(`assessment form fails: ${failed.join(", ")}`);
  }
  if (card.verdict.decision === "hold") {
    blockers.push(...card.verdict.blocking);
  }
  return blockers;
}

/** True only when a complete scorecard clears every flagship floor and gate. */
export function meetsFlagship(card: Scorecard): boolean {
  return scorecardComplete(card).complete && flagshipBlockers(card).length === 0;
}
