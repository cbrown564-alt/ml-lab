import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Decision-tree failure gallery. The two walls of a single tree: grown deep it overfits
 * (a box around every noisy point), and even grown well it is unstable — resample the
 * data and the greedy splits jump, redrawing the whole boundary. The second card is the
 * motivation for the entire rest of the cluster: forests and boosting are trees, averaged.
 */
export const decisionTreesFailures: FailureGallery = {
  nodeId: "decision-trees",
  intro:
    "A tree's freedom is its danger. Both failures below come from the same place — nobody constrains where it splits or when it stops.",
  cards: [
    {
      id: "memorize-the-noise",
      primitive: "overfitting",
      title: "A box around every point",
      trigger:
        "Let the tree grow without a depth limit (or with a tiny minimum leaf size) on noisy data — drag depth to the maximum.",
      symptom:
        "Training accuracy hits a perfect 100%, the boundary turns visibly jagged, and tiny single-point islands sprout in the other class's territory. Held-out accuracy drops below the shallow tree's.",
      diagnosis:
        "High variance. With no brake, recursion only stops when every leaf is pure, so the tree carves a box around each stray point — fitting this sample's noise, not the underlying shape.",
      repair:
        "Add a brake: cap max depth, require a minimum number of points per leaf, or prune low-gain cuts. Tune the depth on a validation set — the best held-out score is at a shallow setting, not the deepest.",
      boundary:
        "If the true boundary really is intricate and you have plenty of clean data, a deeper tree is the right call — depth is a knob to tune, not a number to always shrink.",
      scenarioId: "two-moons",
    },
    {
      id: "redraw-on-a-whisper",
      primitive: "seed-sensitivity",
      title: "Move the data, redraw the tree",
      trigger:
        "Resample the training set — drop a few points, or draw a fresh bootstrap sample — and refit. Repeat with a different sample.",
      symptom:
        "The top split, and often the whole tree below it, changes. When two candidate cuts are nearly tied in gain, a handful of points decides which one wins, and the entire boundary lurches.",
      diagnosis:
        "A tree is a high-variance estimator: greedy, hard splits mean a small change in the data flips a near-tie at the root, and that choice cascades. The shape is unstable even when the accuracy is fine.",
      repair:
        "Average many trees built on resampled data so the idiosyncratic splits cancel and the shared signal survives — that is exactly bagging, and it is what a random forest does. Boosting tackles the bias side the same building block.",
      boundary:
        "If you need a model a person can read aloud as a chain of questions, one shallow tree's interpretability is worth its instability — an averaged forest is far harder to explain.",
    },
  ],
};
