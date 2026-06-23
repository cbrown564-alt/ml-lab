import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Feature-scaling concept check. The misconceptions: that the crawl is a step-size
 * bug you can brute-force, that scaling changes the data, and that every model needs it.
 */
export const featureScalingCheck: ConceptCheck = {
  nodeId: "feature-scaling",
  items: [
    {
      id: "why-crawl",
      kind: "choice",
      prompt: "On raw units the descent zig-zags and crawls. What about the surface forces this?",
      options: [
        {
          label: "The bowl is steep in one direction and shallow in another, so one step size can't suit both",
          correct: true,
          feedback:
            "Exactly — a large condition number. The step has to stay small enough not to fly up the steep wall, which means it barely moves along the shallow valley, so it zig-zags.",
        },
        {
          label: "The learning rate was simply set too low",
          feedback:
            "Raising it doesn't help — past the stretched bowl's low stability ceiling the descent diverges. The crawl is a conditioning problem, not a step-size one.",
        },
        {
          label: "Gradient descent always zig-zags; it's how the algorithm works",
          feedback:
            "On a round bowl it walks almost straight in. The zig-zag is specific to a stretched, ill-conditioned surface — which is what raw units create.",
        },
      ],
      difficulty: 2,
      targets: ["scaling:conditioning"],
    },
    {
      id: "what-standardising-does",
      kind: "choice",
      prompt: "Standardising the input subtracts its mean and divides by its spread. What does that do to the loss surface?",
      options: [
        {
          label: "It rounds the bowl — equal curvature in every direction, condition number near 1",
          correct: true,
          feedback:
            "Right. Centring removes the tilt and unit variance equalises the steepness, so the stretched valley becomes a round bowl the descent can walk straight down.",
        },
        {
          label: "It moves the minimum closer to the start so there's less ground to cover",
          feedback:
            "It changes the bowl's shape, not the distance to the floor. The win is a round bowl that tolerates a big step, not a shorter walk.",
        },
        {
          label: "It changes the data, so the model learns a different (easier) problem",
          feedback:
            "The data and the relationship are unchanged — only their units. The same line is learned; the surface it's learned on is just kinder to walk.",
        },
      ],
      difficulty: 2,
      targets: ["scaling:rounds-bowl"],
    },
    {
      id: "bigger-step-predict",
      kind: "predict",
      setup: "Raw units, and the descent is crawling. You decide to speed it up by raising the learning rate.",
      prompt: "Crank the learning rate up on the raw-units descent and run. The most likely result is…",
      options: [
        {
          label: "It diverges — the stretched bowl's stability ceiling is too low for the bigger step",
          correct: true,
          feedback:
            "Right. The crawl can't be brute-forced: a step big enough to make progress along the valley overshoots the steep walls and the loss explodes. You have to fix the conditioning instead.",
        },
        {
          label: "It converges much faster — bigger steps always cover more ground",
          feedback:
            "Only on a well-conditioned surface. On the stretched bowl the bigger step flies up the steep walls and diverges — speeding up here breaks it.",
        },
        {
          label: "Nothing changes — the learning rate doesn't affect a crawl",
          feedback:
            "It changes a great deal: below the ceiling it crawls, above it diverges. The stretched bowl just makes that ceiling very low.",
        },
      ],
      verify: "On raw units, raise η past ~0.08 and run — watch the loss explode rather than fall.",
      difficulty: 3,
      targets: ["scaling:low-ceiling"],
    },
    {
      id: "break-raw",
      kind: "experiment-task",
      prompt: "Break it on purpose: on raw units, raise the learning rate and run until the descent diverges.",
      taskEvent: "feature-scaling:diverged-on-raw",
      feedback:
        "You've felt why the crawl can't be cured with a bigger step — the stretched bowl punishes it. Standardising is the move that raises the ceiling.",
      difficulty: 1,
      targets: ["scaling:break"],
    },
    {
      id: "transfer-knn",
      kind: "transfer",
      scenario:
        "A colleague's k-nearest-neighbours model weighs house age (years, 0–100) and lot size (square feet, 0–50,000). It performs oddly — predictions seem to depend almost entirely on lot size, ignoring age.",
      prompt:
        "From what the bowl taught you: what's the cause, what's the fix, and why won't 'a better model' or 'more data' rescue it? Write it in your own words.",
      open: {
        placeholder:
          "e.g. lot size's range is ~500× age's, so in the distance it… the fix is… more data won't help because…",
        answer:
          "Lot size ranges 0–50,000 while age ranges 0–100, so in the Euclidean distance k-NN uses, lot size's magnitude swamps age entirely — 'nearest' is decided almost only by lot size. The fix is the same one-line move the bowl needed: standardise both features (subtract the mean, divide by the spread) so they weigh comparably. Switching models or collecting more data won't help — k-NN doesn't learn feature weights, and any method that compares features by magnitude (distances, gradients, ridge penalties) inherits the same scaling problem.",
      },
      difficulty: 3,
      targets: ["scaling:transfer-distance"],
    },
  ],
};
