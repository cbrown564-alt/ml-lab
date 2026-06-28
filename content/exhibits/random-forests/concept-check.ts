import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Random-forest concept check. The misconceptions: that the number of trees is a
 * complexity knob that overfits, that the randomness exists to make each tree better
 * (it makes each worse — the gain is decorrelation), and that averaging can fix bias.
 * The open transfer applies the decorrelation insight to a broken config where the
 * obvious move (add more trees) is wrong.
 */
export const randomForestsCheck: ConceptCheck = {
  nodeId: "random-forests",
  items: [
    {
      id: "more-trees-safe",
      kind: "choice",
      prompt:
        "You grow a forest from 10 trees to 500; held-out accuracy rises a little, then stops changing. A colleague warns that going further will start to overfit, like a too-deep tree. Are they right?",
      options: [
        {
          label:
            "No — adding trees only reduces variance toward a floor; it never adds capacity to fit noise, so the curve flattens rather than turning back down",
          correct: true,
          feedback:
            "Right. The tree count appears only in the variance term, divided — it can shrink variance but can't manufacture capacity. Overfitting would come from deeper trees, not more of them. The held-out curve plateaus; it never makes a U.",
        },
        {
          label: "Yes — every model overfits if you make it big enough, and 500 trees is a very big model",
          feedback:
            "Size isn't capacity here. 500 trees is 500 averages of the same kind of model, which shrinks variance; it doesn't add the flexibility that overfits. A forest's capacity to fit noise lives in each tree's depth, not in the count.",
        },
        {
          label: "Yes, but only because the trees are deep; with shallow trees more would always be safe",
          feedback:
            "Adding trees is safe regardless of their depth — averaging deep trees is exactly what cancels their overfitting. Depth raises each tree's variance; more trees average it away. The count never compounds overfitting, deep trees or not.",
        },
      ],
      difficulty: 2,
      targets: ["forest:more-safe"],
    },
    {
      id: "why-randomness",
      kind: "choice",
      prompt:
        "Why does a random forest use bootstrap samples and random feature subsets, instead of just growing the same best tree many times?",
      options: [
        {
          label:
            "Averaging only cancels the part of the trees' errors that differs between them — identical trees make identical errors, so their average is no better than one. The randomness makes them disagree, which is what averaging needs.",
          correct: true,
          feedback:
            "Exactly. Var(average) falls only as the trees decorrelate; at correlation 1 you gain nothing. The bootstrap and feature subsets lower that correlation — they make each tree a bit worse on its own but make the crowd far better.",
        },
        {
          label: "To make each individual tree more accurate, so an average of better trees is better",
          feedback:
            "Backwards: the randomness makes each tree LESS accurate on its own (it sees less data and fewer features). The forest still wins, because the gain comes from the trees disagreeing, not from each being good.",
        },
        {
          label: "To save computation — random subsets mean each tree trains on less, so the forest is faster",
          feedback:
            "Speed is a side effect, not the reason. Even with unlimited compute you would still inject randomness, because without decorrelation the average of many identical trees is just one tree.",
        },
      ],
      difficulty: 3,
      targets: ["forest:decorrelation"],
    },
    {
      id: "variance-not-bias",
      kind: "choice",
      prompt:
        "A forest of very shallow stumps underfits badly, and adding thousands more stumps doesn't help. Why can't more trees rescue it?",
      options: [
        {
          label:
            "Averaging shrinks variance, not bias — stumps are high-bias and average to the same wrong shape, since the mean of many copies has the expected value of one copy",
          correct: true,
          feedback:
            "Right. The forest's bias equals a single stump's bias, and no amount of averaging changes an expected value. The fix is deeper trees (lower bias), with the forest controlling their variance — not more stumps.",
        },
        {
          label: "The stumps need more training data; with enough data even shallow trees fit any shape",
          feedback:
            "A stump can only make one or two cuts no matter how much data it sees — it's bias from too little flexibility, which data can't fix. Only deeper trees can reach the shape.",
        },
        {
          label: "There aren't enough features; adding engineered features would let the stumps fit it",
          feedback:
            "The moons are already separable in these two features — a deep tree fits them fine. The stumps' problem is depth, not features: one cut can't follow a curve.",
        },
      ],
      difficulty: 2,
      targets: ["forest:variance-not-bias"],
    },
    {
      id: "grow-the-crowd",
      kind: "experiment-task",
      prompt:
        "Grow the crowd: drag Trees in the forest from one up to the maximum. Watch the single tree's jagged staircase blur into a smooth boundary as the held-out score climbs and then flattens — and never falls.",
      taskEvent: "random-forests:grow-the-crowd",
      feedback:
        "You watched variance reduction happen: many overfit trees averaging into one steady model. The held-out curve flattened instead of turning down — proof that the number of trees is a safe knob, unlike a single tree's depth.",
      difficulty: 1,
      targets: ["forest:break"],
    },
    {
      id: "transfer-decorrelation",
      kind: "transfer",
      scenario:
        "A teammate is disappointed: their 500-tree random forest is barely more accurate than a single decision tree on the same data. Digging in, you find they configured it to turn OFF bootstrap sampling and to consider ALL features at every split — so every one of the 500 trees was grown on the same data with the same greedy rule, making them essentially identical. Their plan is to add another 500 trees.",
      prompt:
        "Will adding more trees help? Explain what's actually wrong and what the cheap fix is — in your own words.",
      open: {
        placeholder:
          "e.g. the 500 trees are identical because … so their average is … adding more would … the real fix is …",
        answer:
          "No — adding more trees won't help. A forest cuts error by averaging trees whose mistakes differ; this 'forest' is 500 near-identical trees, so their predictions are almost perfectly correlated and the average is just the single tree again. In the variance formula ρ ≈ 1, so Var stays at one tree's variance no matter how many you stack — doubling to 1,000 identical trees changes nothing. The fix isn't more trees, it's disagreement: turn bootstrap sampling back on and restrict each split to a random subset of features, so the trees see different data and ask different questions. That decorrelation is the whole mechanism — once the trees differ (ρ drops), even the original 500 will average into something far better than one tree, and the variance can finally fall toward its floor.",
      },
      difficulty: 3,
      targets: ["forest:transfer-decorrelation"],
    },
  ],
};
