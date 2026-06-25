import type { FailureGallery } from "@/lib/failure/schema";

/**
 * The-gradient failure gallery. The live failure is the local-optimum trap (greedy
 * ascent climbs the nearest hill); the other is the vanishing gradient that stalls a
 * climb to a crawl. Both are the gradient's blindness beyond the local slope.
 */
export const theGradientFailures: FailureGallery = {
  nodeId: "the-gradient",
  cards: [
    {
      id: "local-optimum-trap",
      primitive: "bad-initialisation",
      title: "Trapped at a local optimum",
      trigger: "Follow the gradient greedily from a start point on a landscape with more than one hill.",
      symptom: "The climb stops where the gradient vanishes — but on the shorter hill, not the tallest. A different start reaches a different, better summit.",
      diagnosis: "The gradient sees only the local slope. A zero gradient marks a stationary point (a peak, a valley, or a saddle) — not necessarily the global best — so a greedy run is captured by whichever basin it started in.",
      repair: "Initialisation decides the basin: run from several random starts and keep the best, or add momentum so the step can carry through shallow dips. (Re-initialising is exactly why training is repeated from many seeds.)",
      boundary: "On a concave objective, any local maximum is global. Equivalently, on a convex objective being minimized, any local minimum is global. The trap requires a non-concave/non-convex landscape.",
    },
    {
      id: "vanishing-gradient",
      primitive: "vanishing-exploding-gradients",
      title: "A vanishing gradient stalls the climb",
      trigger: "Sit on a flat plateau (or a saturated region), where the slope is nearly zero, and step by a multiple of the gradient.",
      symptom: "The steps shrink to almost nothing and progress crawls — the optimizer looks stuck even though it isn't at an optimum.",
      diagnosis: "Gradient descent moves by η·∇f, so where the gradient is tiny the step is tiny. Long flat stretches (and saturating activations, in deep nets) starve the update of signal.",
      repair: "Normalise inputs and use activations/initialisations that keep gradients healthy; momentum and adaptive methods (e.g. Adam) carry speed across flats; skip/residual connections keep a gradient path open in deep networks.",
      boundary: "A small gradient at a true optimum is correct and desired — the failure is a small gradient far from one, where you still need to move.",
    },
  ],
};
