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
      id: "why-line-fails-xor",
      kind: "choice",
      prompt: "On XOR, logistic regression lands at chance. Why can't more training rescue it?",
      options: [
        {
          label: "The model draws one straight line, and no straight line separates XOR — it's a shape limit, not an optimiser one",
          correct: true,
          feedback:
            "Right. The score b + w·x is linear, so the boundary is always straight. XOR needs a curve; gradient descent finds the best straight line, which is no good.",
        },
        {
          label: "The learning rate is too low for XOR; a bigger step would converge to the right boundary",
          feedback:
            "There is no right straight boundary to converge to. Any learning rate finds the best line, and the best line still splits two corners wrongly.",
        },
        {
          label: "XOR needs more data; with enough points the line would separate it",
          feedback:
            "More XOR data makes the impossibility clearer, not better — a straight line can't separate the four corners no matter how many points you add.",
        },
      ],
      difficulty: 2,
      targets: ["logreg:linear"],
    },
    {
      id: "what-x1x2-does",
      kind: "choice",
      prompt: "Adding the single feature x₁·x₂ lets the model solve XOR. What did that change?",
      options: [
        {
          label: "A straight line in the expanded space (x₁, x₂, x₁x₂) is a curved boundary in the original — the model is still linear, the features bent",
          correct: true,
          feedback:
            "Exactly. x₁x₂ is positive in the class-1 corners and negative in the class-0 ones, so a threshold on it is the XOR. The classifier stays linear; the feature map did the bending.",
        },
        {
          label: "It made logistic regression a nonlinear model",
          feedback:
            "The model is still linear — in the new features. The nonlinearity lives in the feature map x→(x₁,x₂,x₁x₂), not in the classifier, which still draws a flat boundary in the expanded space.",
        },
        {
          label: "It added a second line, and two lines can box in the corners",
          feedback:
            "It added a feature, not a line. The boundary is still a single surface — but now curved, because x₁x₂ bends it. One well-chosen feature, not two lines.",
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
      id: "break-xor",
      kind: "experiment-task",
      prompt: "Break it on purpose: train logistic regression on XOR with the raw coordinates and watch it fail at chance.",
      taskEvent: "logistic-regression:linear-fails-xor",
      feedback:
        "You've met the linear classifier's hard limit — a straight line on a curved problem. The fix isn't a better optimiser; it's a feature (or a model) that can bend.",
      difficulty: 1,
      targets: ["logreg:break"],
    },
    {
      id: "transfer-curved",
      kind: "transfer",
      scenario:
        "A colleague's logistic-regression spam filter does well overall but completely fails on one cluster of emails that are spam only when two features co-occur (a certain sender *and* a certain link), though neither feature alone is suspicious.",
      prompt: "From what XOR taught you, what's happening, and what's the cheapest fix to try first?",
      options: [
        {
          label:
            "It's an interaction the linear model can't capture — add the product of those two features (or an interaction term) so the boundary can bend",
          correct: true,
          feedback:
            "That's the transfer: 'spam only when both' is an XOR-like interaction, invisible to a model that's linear in each feature alone. The cheap fix is exactly the x₁·x₂ move — an interaction feature.",
        },
        {
          label: "The model is underpowered — replace it with a deep neural network",
          feedback:
            "A network would work, but it's overkill for a known two-feature interaction. The cheap, interpretable fix is to add that one interaction feature and keep the logistic model.",
        },
        {
          label: "It needs more spam examples of that cluster to learn the pattern",
          feedback:
            "More data won't help a model that's structurally linear in each feature — it can't represent 'both but not either' at any sample size. An interaction feature can.",
        },
      ],
      difficulty: 3,
      targets: ["logreg:transfer-interaction"],
    },
  ],
};
