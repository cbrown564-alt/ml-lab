import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Linear-regression concept check. Each distractor is a misconception we
 * expect learners to actually hold after the experiment; feedback speaks to
 * the misconception. Retrieval practice, not recognition theater.
 */
export const linearRegressionCheck: ConceptCheck = {
  nodeId: "linear-regression",
  items: [
    {
      id: "what-is-minimized",
      kind: "choice",
      prompt:
        "The line of best fit you dragged points around is “best” in exactly what sense?",
      options: [
        {
          label: "It passes through as many points as possible",
          feedback:
            "A tempting reading, but the line usually passes through none of the points. It's judged by how close it gets to all of them, not how many it hits.",
        },
        {
          label: "It makes the sum of squared vertical distances to the points as small as possible",
          correct: true,
          feedback:
            "Right — those dashed residual segments are the distances being squared and summed, and no other line gets that total lower.",
        },
        {
          label: "It minimizes the perpendicular distance from each point to the line",
          feedback:
            "Close, but the residuals you saw were vertical, not perpendicular: regression treats x as given and only counts error in the predicted y. (Perpendicular distance is a different method — total least squares.)",
        },
      ],
      difficulty: 1,
      targets: ["linreg:what-is-minimized"],
    },
    {
      id: "why-outliers-tyrannize",
      kind: "choice",
      prompt:
        "In the outlier scenario, one rogue point dragged the whole line off the trend. What gives a single point that much power?",
      options: [
        {
          label: "Squaring makes a big error count far more than several small ones",
          correct: true,
          feedback:
            "Exactly. An error of 10 contributes 100; ten errors of 1 contribute 10 in total. The line will trade accuracy on many points to appease one huge mistake.",
        },
        {
          label: "Points further from the line are weighted by the algorithm",
          feedback:
            "No explicit weighting exists — every point enters the same formula. The outsized influence falls out of squaring the residual, not from any special treatment.",
        },
        {
          label: "Outliers change the average of x, which moves the line",
          feedback:
            "An outlier in y barely moves the average of x at all. Its power comes from its huge squared residual, which dominates the total the line is minimizing.",
        },
      ],
      difficulty: 2,
      targets: ["linreg:squared-error-sensitivity"],
    },
    {
      id: "residual-meaning",
      kind: "choice",
      prompt: "A point has a residual of −3. What does that tell you?",
      options: [
        {
          label: "The line predicts 3 units higher than the point's actual value",
          correct: true,
          feedback:
            "Right — residual is actual minus predicted, so a negative residual means the prediction overshoots the truth.",
        },
        {
          label: "The point is 3 units to the left of the line",
          feedback:
            "Residuals are measured vertically — in the y direction only. Regression never measures error sideways, because x is treated as given.",
        },
        {
          label: "The point is an outlier and should be removed",
          feedback:
            "A residual of −3 is just a measurement of miss, not a verdict. Whether that's an outlier depends entirely on how big the other residuals are.",
        },
      ],
      difficulty: 1,
      targets: ["linreg:interpret-residuals"],
    },
    {
      id: "double-the-distance",
      kind: "predict",
      setup:
        "Load “The tyranny of the outlier” and switch the error view to Squares. Find the biggest penalty square.",
      prompt:
        "If that rogue point wanders twice as far from the line, the area of its penalty square will be…",
      options: [
        {
          label: "About twice as big — twice the miss, twice the penalty",
          feedback:
            "That's how it would work if the loss were the plain distance. But the penalty is the square of the miss: double the residual and the area goes up fourfold. That nonlinearity is the whole story of this exhibit.",
        },
        {
          label: "About four times as big — the penalty is the square of the miss",
          correct: true,
          feedback:
            "Right — side doubles, area quadruples. That's why the line capitulates to outliers: pleasing one point at residual 20 is worth disappointing four hundred points at residual 1.",
        },
        {
          label: "About the same — the line refits to absorb the move",
          feedback:
            "The line does chase the outlier a little, but with thirty points anchoring it, the refit absorbs only a sliver of the move. The square still roughly quadruples — go watch it.",
        },
      ],
      verify:
        "Drag that rogue point to twice its distance from the line and watch its square. (The line will chase it a little — that's the tyranny part.)",
      difficulty: 2,
      targets: ["linreg:squared-error-sensitivity"],
    },
    {
      id: "evict-the-outliers",
      kind: "experiment-task",
      prompt:
        "Make the tyranny stop: on “The tyranny of the outlier,” deal with both rogue points — drag them back to the trend, or double-click them out — until the MSE drops below 2.",
      taskEvent: "linear-regression:outliers-tamed",
      feedback:
        "The line snapped back to the crowd the moment the giant penalties vanished — squared error's obsession works in reverse, too. (In real work you'd investigate an outlier before deleting it; sometimes the rogue point is the discovery.)",
      difficulty: 2,
      targets: ["linreg:outlier-influence"],
    },
    {
      id: "transfer-house-prices",
      kind: "transfer",
      scenario:
        "You're predicting house prices. Most homes cluster around the median, but the dataset includes a handful of mansions that sold for fifty times that. Your least-squares line predicts the ordinary homes noticeably too high.",
      prompt:
        "Why does a few mansions pull the whole line up, and what's the cleanest fix that keeps the ordinary homes well-predicted?",
      options: [
        {
          label:
            "The mansions' huge squared residuals dominate the loss; a robust loss (or modelling the extremes separately) stops a few points from dictating the line",
          correct: true,
          feedback:
            "That's the transfer: it's the same tyranny-of-the-outlier mechanism in the wild. Squared error lets the mansions' enormous residuals outvote the crowd, so robustifying — or segmenting them out — restores the fit on ordinary homes.",
        },
        {
          label: "The model needs more features to explain the mansions",
          feedback:
            "More features won't stop squared error from over-weighting the mansions' extreme residuals — the line would still trade the crowd's accuracy to appease them. The issue is the loss, not the feature set.",
        },
        {
          label: "Collect more mansion sales so the model learns them properly",
          feedback:
            "That amplifies the problem: more high-value extremes pull even harder on a squared-error fit. The fix is to stop the extremes from dominating the loss, not to add more of them.",
        },
      ],
      difficulty: 3,
      targets: ["linreg:transfer-robustness"],
    },
  ],
};
