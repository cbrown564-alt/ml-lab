import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * what-is-ml concept check. Misconceptions: that ML is programming the rules directly,
 * that a clever algorithm can overcome bad data, and that a good fit to the training data
 * is what matters.
 */
export const whatIsMlCheck: ConceptCheck = {
  nodeId: "what-is-ml",
  items: [
    {
      id: "the-inversion",
      kind: "choice",
      prompt: "What is the essential difference between conventional programming and supervised machine learning?",
      options: [
        {
          label: "Programming: you write the rule and apply it to data. ML: you give data and answers, and the machine finds the rule",
          correct: true,
          feedback:
            "Right — that's the inversion. Instead of specifying how to do the task, you show examples of the task done, and the machine searches for a rule that reproduces them.",
        },
        {
          label: "Machine learning is just faster, automatically-generated traditional code",
          feedback:
            "It's not faster code-writing — it's a different input. You do not specify every decision rule directly; you specify the data, representation, model family, and objective from which a rule is fitted.",
        },
        {
          label: "Machine learning doesn't use data; it reasons from first principles",
          feedback:
            "The opposite — data is the whole point. ML learns the rule from examples; with no data there's nothing to learn from.",
        },
      ],
      difficulty: 1,
      targets: ["wml:inversion"],
    },
    {
      id: "biased-data-why",
      kind: "choice",
      prompt: "Trained on systematically mislabelled data, the model fit its own data well but failed on the real population. Why couldn't a better algorithm fix it?",
      options: [
        {
          label: "The model has no notion of truth beyond the examples — it faithfully learns whatever pattern the data contains, bias and all",
          correct: true,
          feedback:
            "Right. Learning means reproducing the examples; if the examples are skewed, the best fit is the skewed rule. The training objective rewards agreement with the labels, not an external ground truth — so the fix has to be the data, not the model.",
        },
        {
          label: "The algorithm was too simple — a neural network would have ignored the bias",
          feedback:
            "A more powerful model fits the biased data better, not less — it has even more capacity to reproduce the skew. Complexity doesn't grant a sense of what's true.",
        },
        {
          label: "It needed more of the same (biased) data to average out the error",
          feedback:
            "More biased data deepens the bias — it's systematic, not random noise, so it doesn't average away. You need representative data, not more skewed data.",
        },
      ],
      difficulty: 2,
      targets: ["wml:garbage-in"],
    },
    {
      id: "labels-predict",
      kind: "predict",
      setup: "You have a pile of photos and want a model that labels each as cat or dog.",
      prompt: "What must you supply for the machine to learn this rule (supervised learning)?",
      options: [
        {
          label: "The photos paired with their correct cat/dog labels — examples of the answer",
          correct: true,
          feedback:
            "Right. Supervised learning needs inputs with their correct outputs; the model searches for a rule that reproduces those answers, then applies it to new photos.",
        },
        {
          label: "A written description of how to tell cats from dogs",
          feedback:
            "That's the rule — and the whole reason to use ML is that you can't write it. You supply labelled examples instead, and the machine derives the rule.",
        },
        {
          label: "Just the photos — the machine figures out the categories on its own",
          feedback:
            "Photos with no labels let it find clusters, but not which is 'cat' and which is 'dog'. To learn your labels it needs examples carrying those answers.",
        },
      ],
      verify: "Supervised learning needs inputs paired with correct answers — the labels.",
      difficulty: 2,
      targets: ["wml:supervised"],
    },
    {
      id: "break-bias",
      kind: "experiment-task",
      prompt: "Break it on purpose: turn up the label bias and watch the learned rule drift away from the truth — high on its own biased data, failing on the real population.",
      taskEvent: "what-is-ml:biased-data",
      feedback:
        "You've seen the catch in the power: the machine learns whatever's in the examples. Its rule is a mirror of the data — which is why so much of the craft is the data, not the algorithm.",
      difficulty: 1,
      targets: ["wml:break"],
    },
    {
      id: "transfer-hiring",
      kind: "transfer",
      scenario:
        "A company trains a résumé-screening model on a decade of its own hiring decisions to predict who to interview. The model is accurate on held-out historical résumés, but in use it systematically rejects qualified candidates from one group.",
      prompt:
        "From what you've learned about where a model's rule comes from: what's the most likely cause, and what would actually address it (and what would not)? Write it in your own words.",
      open: {
        placeholder:
          "e.g. the model learned its rule from… so the high accuracy means… the real fix is…",
        answer:
          "The model writes its rule from its examples — and biased historical labels are one likely cause, though sampling, proxy variables, the target definition, threshold choice, or deployment shift can also produce group disparities. High held-out accuracy is no defense: it measures agreement with those same labels, so a model that reproduces past bias can score well. A bigger model or regularization won't fix a skewed objective — those change how well it fits, not what it was taught. The real work is upstream: audit labels, sampling, and the objective (what counts as a 'good' hire), because the model reflects the examples and choices behind it.",
      },
      difficulty: 3,
      targets: ["wml:transfer-bias"],
    },
  ],
};
