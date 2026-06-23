import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * What a regression task *is*: supervised learning where the target is a continuous
 * quantity, so a good answer is a close one — scored by distance. Told apart from
 * classification (a categorical target, scored right/wrong) by the kind of thing you're
 * predicting. The task framing comes first; it dictates the output, the loss, the metric.
 */
export const regressionTaskNarrative: ExhibitNarrative = {
  nodeId: "regression-task",
  hook: [
    "Before any model, any line, any maths, there's a question: what are you actually predicting? Get that wrong and everything downstream — the output, the loss, the metric — is pointed at the wrong target. A regression task is one specific kind of question, and naming it is the first real step.",
    "Here are examples with a continuous answer attached — study hours and the exam score that followed. A regression task is: given the hours, predict the score.",
  ],
  story: [
    {
      id: "anatomy",
      heading: "Examples in, a number out",
      paragraphs: [
        "Supervised learning starts with labelled examples: each one a set of features (here, study hours) paired with a known answer (the score). The job is a function that turns features into the answer, so that for a new student — whose score you don't yet know — you can predict it. What makes it a *regression* task is the answer's type: a continuous quantity, a number on a scale, not a category.",
      ],
    },
    {
      id: "distance",
      heading: "“Good” means close",
      paragraphs: [
        "Because the answer is a number, a prediction is rarely exactly right — and that's fine. What matters is how far off it is. The error of one prediction is the distance between it and the truth; the quality of the whole model is the total of those distances. That's what you felt predicting by hand: not right-or-wrong, but near-or-far. Minimising that total distance is the entire job of a regression model.",
      ],
    },
    {
      id: "classification-contrast",
      heading: "Change the target, change the task",
      paragraphs: [
        "Now split the same scores at a pass line. The question becomes pass or fail: a category, not a number. The prediction is no longer a point on a scale but one of two labels, and “off by 4 points” stops meaning anything — a guess is simply right or wrong. That's a classification task, and accuracy, not distance, is its score. Same students, same features; the *target's type* is what made it a different problem.",
      ],
    },
    {
      id: "framing-first",
      heading: "The framing dictates everything",
      paragraphs: [
        "Continuous target → regression → predict a number → score by distance. Categorical target → classification → predict a class → score by accuracy. The choice isn't cosmetic: it sets what the model outputs, which loss it minimises, and which metric tells you whether it's any good. Choosing the framing — and the metric that matches it — is a decision you make before training anything.",
      ],
    },
  ],
  fieldNotes: [
    "The line between the two tasks can be a judgement call. “How many days until churn?” is regression; “will they churn this month?” is classification — same underlying reality, framed by what decision you need. Pick the framing the decision actually requires, not the one that's easiest to score.",
    "Mismatching the metric to the task is a classic own-goal: grading a regression model by exact-match accuracy makes an excellent model look worthless (it's almost never exactly right), and grading a classifier by distance is meaningless. The metric has to measure the kind of error the task can make.",
  ],
};
