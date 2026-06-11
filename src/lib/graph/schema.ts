import { z } from "zod";

/**
 * Knowledge-graph schemas — the single source of truth for graph data shapes.
 * See docs/03-data-model.md. All content under content/graph/ must satisfy
 * these schemas; `npm run validate` enforces this plus structural rules
 * (prerequisite DAG, no dangling edges, journey coherence) at build time.
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

export const EDGE_TYPES = [
  "prerequisite",
  "generalizes",
  "specializes",
  "contrasts",
  "applies",
  "composes",
  "sequel",
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
  .refine((e) => e.type !== "contrasts" || !!e.note, {
    message: "contrasts edges require a learner-facing note — the comparison is the content",
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
