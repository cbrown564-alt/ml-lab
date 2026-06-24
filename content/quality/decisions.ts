import { z } from "zod";
import { REGISTER_DIMENSIONS, RegisterDimensionEnum, type RegisterDimensionKey } from "./rubric";

/**
 * "This, not that" as a **declarative instrument** (docs/08 Part 3/6 — /review v2).
 *
 * The first cut was a freeform markdown textarea: taste recorded as prose the loop
 * can't act on cleanly, and a decision demanded on every exhibit whether or not
 * one was warranted. This is the fix: a decision is a **slot** — one alternative to
 * resolve — carrying its candidates (A / B / …), the chosen one, and the rejected
 * ones with the reason. The human just *picks*; the choice is machine-readable, so
 * the autonomous loop reads it back and never re-proposes a rejected direction
 * (`npm run brief`). Slots are not demanded everywhere — they're auto-derived for
 * the register dimensions that scored **below floor**, which is exactly where an
 * alternative rendering is worth weighing.
 *
 * Pure (no fs, no React): safe to import from server components, the client panel,
 * and the brief. The IO lives in `src/app/review/_lib/store.ts`.
 */

export const DECISIONS_VERSION = 1 as const;

/** What kind of alternative is being weighed — drives how a candidate renders. */
export const DECISION_KINDS = ["copy", "hero", "graphic"] as const;
export type DecisionKind = (typeof DECISION_KINDS)[number];

/**
 * Which kind of alternative a below-floor register dimension calls for. A weak hero
 * dim wants competing hero compositions; a weak annotation/atmosphere/motion/colour
 * dim wants competing renderings of the graphic; copy slots are added by hand or by
 * the loop where the prose, not the picture, is what's under review.
 */
export const DIMENSION_DECISION_KIND: Record<RegisterDimensionKey, DecisionKind> = {
  "hero-as-protagonist": "hero",
  "mechanism-in-the-picture": "hero",
  "annotation-integration": "graphic",
  "atmosphere-finish": "graphic",
  motion: "graphic",
  "colour-discipline": "graphic",
};

/** One competing rendering. Copy candidates carry `text`; hero/graphic carry a
 * docs-relative `frame` PNG (under captures/.../variants or exemplars). */
export const DecisionCandidateSchema = z.object({
  /** Stable id within the slot — "A", "B", … */
  id: z.string().min(1),
  /** Copy alternative: the rendered text. */
  text: z.string().optional(),
  /** Hero/graphic alternative: a docs-relative PNG path. */
  frame: z.string().optional(),
  /** Optional one-line gloss of what this candidate is trying. */
  label: z.string().optional(),
});
export type DecisionCandidate = z.infer<typeof DecisionCandidateSchema>;

export const DecisionSlotSchema = z.object({
  /** Stable slot id — the dimension it lifts, or a free-decision slug. */
  id: z.string().min(1),
  kind: z.enum(DECISION_KINDS),
  /** The below-floor register dim this lifts (auto-derived), if any. */
  dimension: RegisterDimensionEnum.optional(),
  /** What's being decided — "Which hero composition reads as the protagonist?" */
  prompt: z.string().min(1),
  candidates: z.array(DecisionCandidateSchema).default([]),
  /** The chosen candidate id, or null = undecided (no decision forced). */
  chosen: z.string().nullable().default(null),
  /** The taste rationale: why this, why not the rest. */
  why: z.string().optional(),
  /** Inspiration: exemplar frame / principle. */
  refs: z.string().optional(),
});
export type DecisionSlot = z.infer<typeof DecisionSlotSchema>;

export const DecisionsSchema = z.object({
  schemaVersion: z.literal(DECISIONS_VERSION),
  exhibit: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "exhibit is a kebab-case node id"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date is YYYY-MM-DD"),
  slots: z.array(DecisionSlotSchema).default([]),
});
export type Decisions = z.infer<typeof DecisionsSchema>;

/** A slot is resolved when a chosen candidate is set and actually exists. */
export function slotResolved(slot: DecisionSlot): boolean {
  return slot.chosen != null && slot.candidates.some((c) => c.id === slot.chosen);
}

/** The human-readable label for a register dimension (for slot prompts). */
function dimensionLabel(key: RegisterDimensionKey): string {
  return REGISTER_DIMENSIONS.find((d) => d.key === key)?.label ?? key;
}

/** The default decision slot for a below-floor register dimension. */
export function slotForDimension(dimension: RegisterDimensionKey): DecisionSlot {
  const kind = DIMENSION_DECISION_KIND[dimension];
  const noun = kind === "hero" ? "hero composition" : kind === "copy" ? "copy" : "rendering";
  return {
    id: dimension,
    kind,
    dimension,
    prompt: `${dimensionLabel(dimension)} scored below floor — which ${noun} lifts it?`,
    candidates: [],
    chosen: null,
  };
}
