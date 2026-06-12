import type { Domain } from "./schema";

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
