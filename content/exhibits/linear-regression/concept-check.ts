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
  ],
};
