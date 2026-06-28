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
        "Break it on purpose: drag Tree depth to the maximum and watch training accuracy climb to 100% while the gap to the held-out score yawns open — the boundary turning jagged with a few single-point islands.",
      taskEvent: "decision-trees:overfit-by-depth",
      feedback:
        "You just watched overfitting happen as a picture, not a statistic. The deepest tree is the most accurate on training and not the best on new data — depth is a knob to tune on held-out data, not to max out.",
      difficulty: 1,
      targets: ["tree:break"],
    },
    {
      id: "instability-by-resample",
      kind: "experiment-task",
      prompt:
        "Break it a second way: in Break it, switch to 'Resample the data' and click Resample & refit a few times. Watch the first cut and the whole boundary jump from draw to draw — while the held-out score swings far less and never collapses.",
      taskEvent: "decision-trees:instability-by-resample",
      feedback:
        "That is high variance you can see: a single tree's shape is unstable even when its score isn't. The cure is to average many trees, each grown on its own resample — bagging, a random forest — which is exactly where the cluster goes next.",
      difficulty: 1,
      targets: ["tree:instability"],
    },
    {
      id: "transfer-instability",
      kind: "transfer",
      scenario:
        "A hospital builds a model to recommend whether to admit a patient to intensive care. Regulators require that for every individual decision, a clinician can be shown the exact chain of reasons behind it ('admit because heart-rate > X and lactate > Y'). The team's single decision tree is accurate, but each month they retrain it the top split changes and the admit/observe map shifts, which unsettles the clinicians. A data scientist proposes replacing the tree with a 400-tree random forest to stabilize the decisions.",
      prompt:
        "Is the forest the right fix here? Say what you would do and why — and name the tradeoff you are accepting. Write it in your own words.",
      open: {
        placeholder:
          "e.g. a forest would stabilize it because … but here that breaks … so instead I'd … and the tradeoff is …",
        answer:
          "No — the forest is the wrong fix here, even though it would work on the instability. The tree is unstable because it is a high-variance model: the top split sits on a near-tie, so each month's slightly different data tips it a different way and the whole tree reshuffles. Averaging 400 trees (bagging) really would average that variance away and give a stable map — but it destroys exactly what this setting requires. A forest's decision is a vote across hundreds of trees; you cannot recite that to a clinician as a single chain of reasons, so it fails the regulator's per-decision explainability rule. The right move is to keep one readable tree and attack its variance directly: constrain it — cap the depth and require larger minimum leaves — so the near-tied root resolves more stably and the top split flips less (and, if it still wanders, pin that split where clinical knowledge says it belongs). A shallower, regularized tree is both steadier across retrains and still a chain of yes/no questions a clinician can read aloud. The tradeoff: a constrained single tree is a little less accurate and flexible than a forest — and here that is the right price, because explainability is a hard requirement, not a nicety.",
      },
      difficulty: 3,
      targets: ["tree:transfer-instability"],
    },
  ],
};
