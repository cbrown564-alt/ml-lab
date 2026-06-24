import { z } from "zod";

/**
 * Knowledge-graph schemas — the single source of truth for graph data shapes.
 * See docs/03-data-model.md. All content under content/graph/ must satisfy
 * these schemas; `npm run validate` enforces this plus structural rules
 * (requires DAG, no dangling edges, journey coherence) at build time.
 */

export const DOMAINS = [
  "supervised",
  "unsupervised",
  "deep-learning",
  "nlp-and-llms",
  "vision",
  "reinforcement",
  "generative",
  "ml-practice",
  "linear-algebra",
  "calculus",
  "probability",
  "statistics",
  "software-engineering",
  "data-engineering",
] as const;

export const NODE_KINDS = [
  "algorithm",
  "concept",
  "task",
  "technique",
  "math",
  "practice",
] as const;

export const EXHIBIT_STATUSES = [
  "stub",
  "readable",
  "interactive",
  "flagship",
] as const;

/**
 * Pedagogical edge types (docs/03-data-model.md). The type carries a
 * learner-facing meaning so the graph can explain *why* a connection matters,
 * not merely that one exists. `requires` drives the DAG, recommendations, and
 * journey coherence; the rest are lateral or forward relationships authored as
 * the territory grows. Learner-facing labels live in lib/graph/labels.ts.
 */
export const EDGE_TYPES = [
  "requires", // a prerequisite mechanism or representation (drives the DAG)
  "generalises", // a broader formulation of the current concept
  "special_case_of", // a constrained instance of another concept
  "optimised_by", // the method used to fit or search it
  "evaluated_by", // the metric or diagnostic used to judge it
  "fails_when", // a condition that violates an assumption (→ failure taxonomy)
  "often_confused_with", // a nearby idea that produces a common misconception
  "implemented_using", // a computational primitive or system component
  "mathematical_basis", // the maths that makes the mechanism legible
  "used_inside", // a larger architecture or workflow containing the concept
  "alternative_to", // a competing method under a comparable task
] as const;

const nodeId = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "node ids are kebab-case and stable forever");

export const ConceptNodeSchema = z.object({
  id: nodeId,
  title: z.string().min(1),
  oneLiner: z.string().min(1).max(160),
  domain: z.enum(DOMAINS),
  tags: z.array(z.string()),
  kind: z.enum(NODE_KINDS),
  phase: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  depth: z.enum(["core", "advanced"]),
  status: z.enum(EXHIBIT_STATUSES),
});

export const ConceptEdgeSchema = z
  .object({
    from: nodeId,
    to: nodeId,
    type: z.enum(EDGE_TYPES),
    strength: z.enum(["hard", "soft"]),
    note: z.string().optional(),
  })
  .refine((e) => e.type !== "often_confused_with" || !!e.note, {
    message:
      "often_confused_with edges require a learner-facing note — naming the misconception is the content",
  });

export const JourneyStopSchema = z.object({
  nodeId,
  framing: z.string().optional(),
  optional: z.boolean().optional(),
});

export const JourneySchema = z.object({
  id: nodeId,
  title: z.string().min(1),
  audience: z.string().min(1),
  description: z.string().min(1),
  stops: z.array(JourneyStopSchema).min(2),
});

export type ConceptNode = z.infer<typeof ConceptNodeSchema>;
export type ConceptEdge = z.infer<typeof ConceptEdgeSchema>;
export type Journey = z.infer<typeof JourneySchema>;
export type Domain = (typeof DOMAINS)[number];
export type EdgeType = (typeof EDGE_TYPES)[number];
