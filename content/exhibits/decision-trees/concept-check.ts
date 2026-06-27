import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Decision-tree concept check. The misconceptions: that the staircase boundary is a
 * not-yet-finished smooth curve, that 100% training accuracy is the goal, and that a
 * split is chosen for balance rather than purity. The experiment-task drives the
 * overfit-by-depth loop; the open transfer applies the instability lesson (the
 * seed-sensitivity failure) to a brand-new domain it never walked through.
 */
export const decisionTreesCheck: ConceptCheck = {
  nodeId: "decision-trees",
  items: [
    {
      id: "why-staircase",
      kind: "choice",
      prompt:
        "On the two-moons data the tree's boundary looks like a staircase of horizontal and vertical segments, not a smooth curve. Why that shape?",
      options: [
        {
          label:
            "Every split tests one feature against a threshold, so each cut is an axis-aligned line — the boundary can only be built from horizontal and vertical pieces, which approximate the curve as steps",
          correct: true,
          feedback:
            "Right. A split is 'is xⱼ ≤ t?', which is a line perpendicular to one axis. Stack many of them and you get a staircase that hugs the curve — never a true diagonal or arc, just finer and finer steps.",
        },
        {
          label:
            "The tree hasn't finished training — with more iterations the staircase would smooth into the curve",
          feedback:
            "There are no iterations to run. A tree is built greedily in one pass of splits; it has no step size and nothing that smooths. Deeper only means more, smaller steps — never a smooth arc.",
        },
        {
          label:
            "Trees can only draw straight boundaries, the same limitation logistic regression has",
          feedback:
            "The opposite is true: a tree bends where a single line can't. Each cut is straight, but assembled across many boxes the boundary turns corners and chases the curve — that staircase is the bending logistic regression couldn't do.",
        },
      ],
      difficulty: 2,
      targets: ["tree:staircase"],
    },
    {
      id: "hundred-percent",
      kind: "choice",
      prompt:
        "Your fully grown tree gets 100% accuracy on the training data. A teammate says that proves it's the best model. What's the flaw in that reasoning?",
      options: [
        {
          label:
            "100% training accuracy measures memorization, not generalization — a tree grown to pure leaves has boxed in every noisy point, and its held-out score is usually worse than a shallower tree's",
          correct: true,
          feedback:
            "Exactly. Perfect training accuracy is the symptom of overfitting, not a sign of quality. The only score that counts is on data the tree never saw, and there the shallow tree — which ignored the noise — wins.",
        },
        {
          label:
            "Nothing is wrong — 100% accuracy is the goal, and a tree that reaches it has solved the problem",
          feedback:
            "This is the trap the exhibit is built around. Any tree can hit 100% on training by carving a box per point. That tells you it memorized this sample; it says nothing about new data, which is all that matters.",
        },
        {
          label:
            "The tree just needs more training data to confirm the 100% is real before trusting it",
          feedback:
            "More data would actually expose the problem — the memorized boxes would start misclassifying the new points. The issue isn't confirmation; it's that perfect training accuracy comes from overfitting.",
        },
      ],
      difficulty: 2,
      targets: ["tree:overfit"],
    },
    {
      id: "best-split",
      kind: "choice",
      prompt:
        "At each node the tree tries every possible cut and keeps the 'best' one. Best by what measure?",
      options: [
        {
          label:
            "The largest drop in size-weighted Gini impurity — the cut that makes the two resulting boxes as close to single-class as possible",
          correct: true,
          feedback:
            "Right. Gini impurity scores how mixed a box is; the tree greedily takes the cut that removes the most impurity, weighting each child by its size. Purer children, the most of them — that's the whole criterion.",
        },
        {
          label:
            "The cut that splits the points most evenly, putting roughly half on each side",
          feedback:
            "Balance isn't the goal — purity is. A cut that peels off a small but perfectly single-class group can beat a perfectly balanced 50/50 cut that leaves both sides just as mixed as before.",
        },
        {
          label: "The cut placed at the average value of the feature it tests",
          feedback:
            "The threshold isn't fixed at the mean. The tree considers every threshold between sorted values and picks the one that maximizes purity gain — which is rarely the feature's average.",
        },
      ],
      difficulty: 2,
      targets: ["tree:gini"],
    },
    {
      id: "overfit-by-depth",
      kind: "experiment-task",
      prompt:
        "Break it on purpose: drag Tree depth to the maximum and watch training accuracy climb to 100% while the held-out score peaks early and then falls — the boundary filling with single-point islands.",
      taskEvent: "decision-trees:overfit-by-depth",
      feedback:
        "You just watched overfitting happen as a picture, not a statistic. The deepest tree is the most accurate on training and not the best on new data — depth is a knob to tune on held-out data, not to max out.",
      difficulty: 1,
      targets: ["tree:break"],
    },
    {
      id: "transfer-instability",
      kind: "transfer",
      scenario:
        "A bank retrains a single decision tree on its loan data every month. Most months the very first question the tree asks flips — one month it splits on income, the next on debt-to-income — and the approved/denied map shifts noticeably, even though overall accuracy barely moves. Compliance is alarmed that 'the model keeps changing its mind.'",
      prompt:
        "From what the tree taught you: what's going on, why does accuracy stay roughly flat while the boundary lurches, and what's the fix — and what does the fix cost? Write it in your own words.",
      open: {
        placeholder:
          "e.g. two candidate first questions are nearly tied in gain, so … accuracy stays flat because … the fix is … but it costs …",
        answer:
          "A single tree is a high-variance model. Two candidate root splits (income vs debt-to-income) must be nearly tied in impurity gain, so a small month-to-month change in the data flips which one wins — and because that choice cascades, the whole boundary below it is redrawn. Accuracy barely moves because both near-tied splits are about equally good, so different-looking trees can have similar held-out scores; the shape is unstable even when the score is not. The fix is to stop relying on one tree: average many trees grown on resampled data (a random forest / bagging) so the idiosyncratic splits cancel and only the shared signal survives, giving a far more stable decision map. The cost is interpretability — you can no longer recite a single chain of questions to compliance; a forest's vote across hundreds of trees is much harder to explain than one shallow tree. (Constraining the tree — capping depth, requiring larger leaves — reduces but does not remove the instability.)",
      },
      difficulty: 3,
      targets: ["tree:transfer-instability"],
    },
  ],
};
