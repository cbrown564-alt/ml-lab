import type { Domain, EdgeType } from "./schema";

/** Learner-facing names for graph enums (ids stay kebab-case forever). */
const DOMAIN_LABELS: Record<Domain, string> = {
  supervised: "Supervised",
  unsupervised: "Unsupervised",
  "deep-learning": "Deep Learning",
  "nlp-and-llms": "NLP & LLMs",
  vision: "Vision",
  reinforcement: "Reinforcement",
  generative: "Generative",
  "ml-practice": "ML Practice",
  "linear-algebra": "Linear Algebra",
  calculus: "Calculus",
  probability: "Probability",
  statistics: "Statistics",
  "software-engineering": "Software Engineering",
  "data-engineering": "Data Engineering",
};

export const domainLabel = (domain: Domain): string => DOMAIN_LABELS[domain];

export const kindLabel = (kind: string): string =>
  kind.charAt(0).toUpperCase() + kind.slice(1);

/** Status as a learner-facing quality claim ("Interactive", "Flagship"). */
export const statusLabel = kindLabel;

/**
 * Learner-facing meaning of a typed edge, from the viewpoint of the node whose
 * placard is being read. `dir` is the edge direction relative to that node:
 * `out` when it is the edge's `from`, `in` when it is the `to`. So the same
 * `requires` edge reads "requires" on the dependent node and "unlocks" on its
 * prerequisite — the graph explains *why* a neighbour is a neighbour.
 */
const EDGE_RELATION: Record<EdgeType, { out: string; in: string }> = {
  requires: { out: "unlocks", in: "requires" },
  generalises: { out: "generalises into", in: "generalises" },
  special_case_of: { out: "generalises into", in: "special case" },
  optimised_by: { out: "optimised by", in: "optimises" },
  evaluated_by: { out: "evaluated by", in: "evaluates" },
  fails_when: { out: "fails when", in: "breaks" },
  often_confused_with: { out: "often confused with", in: "often confused with" },
  implemented_using: { out: "implemented using", in: "implements" },
  mathematical_basis: { out: "underpins", in: "underpinned by" },
  used_inside: { out: "used inside", in: "built from" },
  alternative_to: { out: "alternative to", in: "alternative to" },
};

export const edgeRelationLabel = (type: EdgeType, dir: "in" | "out"): string =>
  EDGE_RELATION[type][dir];
