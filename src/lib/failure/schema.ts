import { z } from "zod";

/**
 * The failure-gallery primitive (docs/03-data-model.md §2, docs/07-failure-taxonomy.md).
 *
 * A failure gallery is not a list of caveats — it is the "Break it" mode of the
 * product promise (See it · Run it · Break it · Explain it). Each card is a
 * structured diagnosis bound to a reusable taxonomy id, so the *same* failure is
 * recognisable wherever it recurs across exhibits. That recurrence is itself a
 * teaching device, and the structure (Trigger → Symptom → Diagnosis → Repair →
 * Boundary) is the pedagogy.
 */

/** Reusable failure primitives. Ids are kebab-case and stable forever; add one
 * to docs/07-failure-taxonomy.md and here before an exhibit may reference it. */
export const FAILURE_PRIMITIVES = [
  "small-samples",
  "outliers",
  "feature-scaling",
  "collinearity",
  "overfitting",
  "underfitting",
  "data-leakage",
  "class-imbalance",
  "threshold-choice",
  "distribution-shift",
  "spurious-features",
  "bad-initialisation",
  "vanishing-exploding-gradients",
  "seed-sensitivity",
  "miscalibration",
  "metric-gaming",
] as const;

export type FailurePrimitive = (typeof FAILURE_PRIMITIVES)[number];

export const FailureCardSchema = z.object({
  /** Exhibit-local id. */
  id: z.string().min(1),
  /** The shared taxonomy primitive this card is an instance of. */
  primitive: z.enum(FAILURE_PRIMITIVES),
  title: z.string().min(1),
  /** What the learner changes (sample size, scale, noise, seed, distribution). */
  trigger: z.string().min(1),
  /** The visible failure (unstable boundary, diverging loss, brittle prediction). */
  symptom: z.string().min(1),
  /** The prompt: what changed, and which assumption failed? */
  diagnosis: z.string().min(1),
  /** Regularisation, rescaling, a better split, a different metric or model. */
  repair: z.string().min(1),
  /** When the repair itself is the wrong move. */
  boundary: z.string().min(1),
  /** Optional: the ExperimentSpec scenario that stages this failure live. */
  scenarioId: z.string().optional(),
});

export type FailureCard = z.infer<typeof FailureCardSchema>;

export const FailureGallerySchema = z.object({
  nodeId: z.string().min(1),
  /** One framing line for the gallery as a whole. */
  intro: z.string().optional(),
  cards: z.array(FailureCardSchema).min(1),
});

export type FailureGallery = z.infer<typeof FailureGallerySchema>;
