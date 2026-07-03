import type { FailureGallery } from "@/lib/failure/schema";
import { attentionPinned } from "./experiment";

export const attentionFailures: FailureGallery = {
  nodeId: "attention",
  intro:
    "Attention fails when routing stops being content-dependent — uniform weights, frozen patterns, or geometry that makes every key look equally (un)helpful.",
  cards: [
    {
      id: "uniform-routing",
      primitive: "underfitting",
      title: "Uniform softmax — every key gets the same weight",
      trigger: "Zero out all logits so softmax returns 1/n on every key regardless of query.",
      symptom:
        "Each query blends the whole sentence equally — sat hears as much of mat as of cat, so the contextual vector becomes a generic average.",
      diagnosis:
        "Without score diversity, attention cannot focus. The mechanism collapses to bag-of-words mixing.",
      repair:
        "Restore learned Q/K projections (or fix scaling) so different queries produce different score patterns.",
      boundary:
        "Uniform attention is a useful debug baseline — not a viable learned model.",
    },
    {
      id: "query-ignored",
      primitive: "spurious-features",
      title: "Frozen pattern — queries stop mattering",
      trigger: "Reuse the same attention row for every query token instead of computing query-specific scores.",
      symptom:
        "Every position receives the same mix of values — verbs, articles, and nouns all route identically.",
      diagnosis:
        "Content-dependent routing requires query vectors that change with position. A fixed row throws away the question side of Q/K/V.",
      repair:
        "Compute scores per query row from distinct query vectors; verify rows differ on held-out sentences.",
      boundary:
        "Some architectures add fixed positional bias — that is additive signal, not replacing query-specific scores entirely.",
    },
    {
      id: "bad-embedding-geometry",
      primitive: "distribution-shift",
      title: "Flat keys — every dot product looks the same",
      trigger: "Feed attention keys from broken or one-hot embeddings where no key stands out for the query.",
      symptom: `Even with softmax, peaks are tiny — sat→cat falls from ${attentionPinned.satToCat.weight.toFixed(
        2,
      )} toward uniform and the model copies noise.`,
      diagnosis:
        "Attention reads geometry from embeddings and learned projections. Garbage keys make routing random.",
      repair:
        "Fix the embedding/projection stack upstream; inspect entropy of attention rows during training.",
      boundary:
        "Low entropy is not always good — over-peaked attention can ignore useful context. The failure is flat, not selective.",
    },
  ],
};
