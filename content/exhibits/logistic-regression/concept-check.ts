import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Logistic-regression concept check. The misconceptions: that logistic regression is
 * a nonlinear model, that training harder fixes a curved problem, and that the loss
 * and the metric are the same thing.
 */
export const logisticRegressionCheck: ConceptCheck = {
  nodeId: "logistic-regression",
  items: [
    {
      id: "why-line-fails-curve",
      kind: "choice",
      prompt: "On the parabola-split data, logistic regression plateaus around 78% and can't do better. Why can't more training rescue it?",
      options: [
        {
          label: "The model draws one straight line, and no straight line follows a curve — it's a shape limit, not an optimiser one",
          correct: true,
          feedback:
            "Right. The score b + w·x is linear, so the boundary is always straight. The true split is a parabola; gradient descent finds the best straight line, which miscuts the arms.",
        },
        {
          label: "The learning rate is too low; a bigger step would converge to the right boundary",
          feedback:
            "There is no right straight boundary to converge to. Any learning rate finds the best line, and the best line still cuts straight across a curved split.",
        },
        {
          label: "It needs more data; with enough points the line would follow the curve",
          feedback:
            "More data makes the impossibility clearer, not better — a straight line can't bend into a parabola no matter how many points you add.",
        },
      ],
      difficulty: 2,
      targets: ["logreg:linear"],
    },
    {
      id: "what-x2-does",
      kind: "choice",
      prompt: "Adding the single feature x₁² lets the model fit the parabola. What did that change?",
      options: [
        {
          label: "A straight line in the expanded space (x₁, x₂, x₁²) is a curved boundary in the original — the model is still linear, the features bent",
          correct: true,
          feedback:
            "Exactly. The parabola x₂ = a·x₁² + c is linear in (x₁², x₂), so a flat boundary in the expanded space is the parabola back in the plane. The classifier stays linear; the feature map did the bending.",
        },
        {
          label: "It made logistic regression a nonlinear model",
          feedback:
            "The model is still linear — in the new features. The nonlinearity lives in the feature map x→(x₁,x₂,x₁²), not in the classifier, which still draws a flat boundary in the expanded space.",
        },
        {
          label: "It added a second line, and two lines can bracket the curve",
          feedback:
            "It added a feature, not a line. The boundary is still a single surface — but now curved, because x₁² bends it. One well-chosen feature, not two lines.",
        },
      ],
      difficulty: 3,
      targets: ["logreg:features"],
    },
    {
      id: "loss-vs-metric",
      kind: "choice",
      prompt: "Logistic regression trains on log-loss but you report accuracy. Why not just train on accuracy directly?",
      options: [
        {
          label: "Accuracy is flat and full of ties — it gives gradient descent no slope; log-loss is smooth and rewards calibrated confidence",
          correct: true,
          feedback:
            "Right. Nudging the weights usually doesn't flip any label, so accuracy's gradient is zero almost everywhere. Log-loss changes smoothly with confidence, so descent has a direction to follow.",
        },
        {
          label: "Accuracy and log-loss are the same thing, so it doesn't matter which you use",
          feedback:
            "They're different: log-loss cares how confident each prediction is, accuracy only whether it's right. You optimise the smooth one and report the interpretable one.",
        },
        {
          label: "Accuracy can't be computed during training, only afterward",
          feedback:
            "You can compute accuracy any time — it's just useless for gradient descent because it's piecewise-constant. The issue is its flat gradient, not availability.",
        },
      ],
      difficulty: 2,
      targets: ["logreg:log-loss"],
    },
    {
      id: "break-curve",
      kind: "experiment-task",
      prompt: "Break it on purpose: on the curved-boundary data, work the Raw ↔ Add-x₁² toggle and watch the straight line miscut the parabola before the feature fixes it.",
      taskEvent: "logistic-regression:linear-fails-curve",
      feedback:
        "You've met the linear classifier's hard limit — a straight line on a curved problem. The fix isn't a better optimiser; it's a feature (or a model) that can bend.",
      difficulty: 1,
      targets: ["logreg:break"],
    },
    {
      id: "transfer-curved",
      kind: "transfer",
      scenario:
        "A colleague's logistic-regression model predicts equipment failure from operating temperature. It does poorly, because failures actually happen at BOTH very low temperatures (brittle) and very high ones (overheating) — but not in the comfortable middle.",
      prompt:
        "From what the parabola taught you: what's happening, what's the cheapest fix to try first, and why won't more data or a bigger model help? Write it in your own words.",
      open: {
        placeholder:
          "e.g. failure vs temperature is … so a straight boundary … the cheap fix is … more data won't help because …",
        answer:
          "Failure is a U-shaped (curved) function of temperature — high at both extremes, low in the comfortable middle — and a model linear in temperature alone can only draw a straight boundary, so it can't separate 'middle' from 'both ends'. The cheapest fix is the x₁² move from the parabola: add a temperature-squared feature so the boundary can bend, and keep the interpretable logistic model. A deep network would work but is overkill for one known curve, and more failure examples won't help — a structurally linear model can't represent 'high at both ends' at any sample size.",
      },
      difficulty: 3,
      targets: ["logreg:transfer-curve"],
    },
  ],
};
