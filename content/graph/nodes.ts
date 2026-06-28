import type { ConceptNode } from "@/lib/graph/schema";

/**
 * Phase 1 knowledge-graph nodes. Seeded as the regression cluster plus its
 * immediate neighborhood (docs/05-roadmap.md: ship connected clusters, never
 * scattered islands). All start as stubs; status advances only through
 * exhibit acceptance review (docs/06-evaluation-criteria.md).
 */
export const nodes: ConceptNode[] = [
  {
    id: "what-is-ml",
    title: "What is Machine Learning?",
    oneLiner: "Programs that improve from data instead of being told the rules.",
    domain: "ml-practice",
    tags: ["framing"],
    kind: "concept",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel after a two-round review
    // (the hand-rule-vs-learned doorway, biased-data Break-it). The lab's front door.
    status: "flagship",
  },
  {
    id: "the-dataset",
    title: "The Dataset",
    oneLiner: "Rows of experience: features, targets, and everything that can go wrong with them.",
    domain: "ml-practice",
    tags: ["data", "framing"],
    kind: "concept",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (the coordinated
    // table↔scatter, the one-bad-row Break-it). The last node to land — the journey is
    // complete: all 15 Foundations nodes are flagship.
    status: "flagship",
  },
  {
    id: "regression-task",
    title: "Regression",
    oneLiner: "Predicting a number — the task behind forecasts, prices, and dosages.",
    domain: "supervised",
    tags: ["task"],
    kind: "task",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green); the metric-mismatch lesson verified honest on screen.
    status: "flagship",
  },
  {
    id: "linear-regression",
    title: "Linear Regression",
    oneLiner: "The straight line that started it all — fitting, residuals, and why squared error.",
    domain: "supervised",
    tags: ["regression", "geometry"],
    kind: "algorithm",
    phase: 1,
    depth: "core",
    // Advanced by the flagship acceptance review
    // (docs/reviews/flagship-acceptance-review.md).
    status: "flagship",
  },
  {
    id: "loss-functions",
    title: "Loss Functions",
    oneLiner: "How a model knows it's wrong: turning disagreement into a number to shrink.",
    domain: "ml-practice",
    tags: ["optimization"],
    kind: "concept",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green). First regression-cluster scale-out node.
    status: "flagship",
  },
  {
    id: "gradient-descent",
    title: "Gradient Descent",
    oneLiner: "Rolling downhill on the loss surface — the engine under nearly everything.",
    domain: "ml-practice",
    tags: ["optimization", "geometry"],
    kind: "algorithm",
    phase: 1,
    depth: "core",
    // Advanced by the flagship acceptance review
    // (docs/reviews/flagship-acceptance-review.md).
    status: "flagship",
  },
  {
    id: "train-test-generalization",
    title: "Train, Validate, Test & Generalize",
    oneLiner: "The only score that matters is on data the model has never seen.",
    domain: "ml-practice",
    tags: ["evaluation"],
    kind: "practice",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green) after a two-round review.
    status: "flagship",
  },
  {
    id: "overfitting-regularization",
    title: "Overfitting & Regularization",
    oneLiner: "When a model memorizes instead of learns — and how to make it stop.",
    domain: "ml-practice",
    tags: ["evaluation", "regularization"],
    kind: "concept",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green).
    status: "flagship",
  },
  {
    id: "logistic-regression",
    title: "Logistic Regression",
    oneLiner: "A line that draws a boundary: from numbers to probabilities to decisions.",
    domain: "supervised",
    tags: ["classification"],
    kind: "algorithm",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green). Opens the classification cluster.
    status: "flagship",
  },
  {
    id: "classification-task",
    title: "Classification",
    oneLiner: "Predicting a category — spam or not, cat or dog, benign or malignant.",
    domain: "supervised",
    tags: ["task"],
    kind: "task",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green).
    status: "flagship",
  },
  {
    id: "neural-network-fundamentals",
    title: "Neural Network Fundamentals",
    oneLiner: "Stack simple units, add nonlinearity, and watch arbitrary shapes become learnable.",
    domain: "deep-learning",
    tags: ["deep-learning"],
    kind: "algorithm",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel after a two-round review
    // (the live XOR trainer + capacity/overfitting, the W₂W₁x→line widget). The capstone.
    status: "flagship",
  },
  {
    id: "feature-scaling",
    title: "Feature Scaling",
    oneLiner: "Why a model that ignores units crawls and zig-zags — and how standardizing the inputs fixes it.",
    domain: "ml-practice",
    tags: ["data", "optimization"],
    kind: "technique",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green).
    status: "flagship",
  },
  {
    id: "bias-variance",
    title: "Bias & Variance",
    oneLiner: "Too simple underfits, too complex overfits — and the U-shaped test error in between.",
    domain: "ml-practice",
    tags: ["evaluation"],
    kind: "concept",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green).
    status: "flagship",
  },
  {
    id: "data-leakage",
    title: "Data Leakage",
    oneLiner: "When information from the answer sneaks into the features — and the validation score that lies.",
    domain: "ml-practice",
    tags: ["data", "evaluation"],
    kind: "practice",
    phase: 1,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green).
    status: "flagship",
  },
  {
    id: "decision-trees",
    title: "Decision Trees",
    oneLiner:
      "Twenty questions for data: a staircase of yes/no splits that bends to any boundary — and memorizes if you let it.",
    domain: "supervised",
    tags: ["classification", "trees"],
    kind: "algorithm",
    phase: 1,
    depth: "core",
    // Opens the trees cluster, bridged off logistic's "use a model that bends on its
    // own" failure card. The depth knob is the cluster's cleanest bias–variance demo
    // (held-out peaks at depth 2, then the staircase memorizes), and Break-it carries
    // both failures hands-on (overfit-by-depth + resample instability). The non-circular
    // panel (designer register-3 cleared / teacher both-legs-taught) advanced it to
    // interactive; flagship awaits the owner's human re-judge (red line #6).
    status: "interactive",
  },
  {
    id: "random-forests",
    title: "Random Forests",
    oneLiner:
      "Grow a crowd of disagreeing trees and average their votes — the wobble cancels and the jagged boundary smooths.",
    domain: "supervised",
    tags: ["classification", "trees", "ensembles"],
    kind: "algorithm",
    phase: 1,
    depth: "core",
    // The cure for the single tree's high variance (decision-trees ended on the resample
    // instability). Bagging + feature randomness → decorrelated trees whose errors cancel
    // on average. Stub until the non-circular panel clears it.
    status: "stub",
  },
  {
    id: "the-gradient",
    title: "The Gradient",
    oneLiner: "The direction of steepest ascent — calculus's gift to optimization.",
    domain: "calculus",
    tags: ["optimization", "geometry"],
    kind: "math",
    phase: 3,
    depth: "core",
    // Flagship: all four acts, cleared the non-circular panel (register 3 visual,
    // integrity + pedagogy green), with the contour-stroke + vanishing-gradient trigger
    // applied as the reviewers' push-to-exemplar recommendations.
    status: "flagship",
  },
];
