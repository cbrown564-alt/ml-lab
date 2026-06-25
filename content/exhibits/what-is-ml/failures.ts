import type { FailureGallery } from "@/lib/failure/schema";

/**
 * what-is-ml failure gallery. Both failures are the flip side of "the rule comes from the
 * data": biased examples produce a biased rule, and too few examples produce a rule that
 * fits the handful seen rather than the population.
 */
export const whatIsMlFailures: FailureGallery = {
  nodeId: "what-is-ml",
  cards: [
    {
      id: "biased-data",
      primitive: "distribution-shift",
      title: "Biased examples, biased predictions",
      trigger: "Train on examples whose labels (or sampling) are systematically skewed away from the real population.",
      symptom: "The model scores well on its own data but misjudges the true population; its rule drifts toward the bias, and the people the bias touched are the ones it gets wrong.",
      diagnosis: "The training objective rewards agreement with the examples, not agreement with an external ground truth the system was never given — so it reproduces whatever pattern is in the examples, including skew. Good fit to biased data is the problem.",
      repair: "Fix the data, not the model: collect representative, correctly labeled examples. No algorithm recovers a signal the data doesn't contain.",
      boundary: "If the training data genuinely matches where the model will be used, there's no shift — the failure is a mismatch between the examples and the population the rule faces.",
    },
    {
      id: "too-few-examples",
      primitive: "small-samples",
      title: "Too few examples to learn from",
      trigger: "Give the machine only a handful of examples and ask it to learn a general rule.",
      symptom: "The rule fits the few points it saw but swings wildly with each new example and generalises poorly — it learned the sample, not the pattern.",
      diagnosis: "Learning a rule from data needs enough data to pin the rule down; from too few examples, many different rules fit equally well and the machine can't tell which is real.",
      repair: "Gather more representative examples, or constrain the family of rules (a simpler model, regularisation) so the few examples determine it.",
      boundary: "How many is enough depends on noise, dimensionality, model flexibility, and the accuracy required — not a fixed count for every task.",
    },
  ],
};
