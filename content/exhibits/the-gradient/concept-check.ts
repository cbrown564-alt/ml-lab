import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * The-gradient concept check. Misconceptions: that a zero gradient always means the
 * global optimum, that the gradient "knows" where the best peak is, and that the
 * gradient runs along the contour rather than across it.
 */
export const theGradientCheck: ConceptCheck = {
  nodeId: "the-gradient",
  items: [
    {
      id: "zero-gradient-meaning",
      kind: "choice",
      prompt: "A greedy climb stopped where the gradient is zero, on the shorter hill. What does a zero gradient actually tell you?",
      options: [
        {
          label: "You're at a stationary point — a peak, a valley, or a saddle — not necessarily the global best",
          correct: true,
          feedback:
            "Right. ∇f = 0 means no direction is uphill *locally*. That's true at the global summit, but equally at a lower local peak or a saddle — the gradient can't tell them apart.",
        },
        {
          label: "You've reached the highest point on the whole surface",
          feedback:
            "Only on a single-hill (convex) landscape. Here the climb stopped on the shorter hill — a zero gradient marks a *local* stationary point, not the global best.",
        },
        {
          label: "The function is flat everywhere",
          feedback:
            "The gradient is zero only *at that point*, not everywhere — the surface still rises toward the taller hill across the valley. The gradient just can't see that far.",
        },
      ],
      difficulty: 2,
      targets: ["grad:stationary"],
    },
    {
      id: "perpendicular-recall",
      kind: "choice",
      prompt: "How does the gradient sit relative to the contour line (the set of equal-height neighbours) through a point?",
      options: [
        {
          label: "Perpendicular to it — height is constant along the contour, so steepest change is straight across",
          correct: true,
          feedback:
            "Exactly. Along the contour the directional derivative is zero; the steepest direction is the one that leaves it most directly, at a right angle.",
        },
        {
          label: "Parallel to it — it runs along the contour",
          feedback:
            "Along the contour the height doesn't change at all — that's the direction of *zero* slope. The gradient is the steepest direction, which runs across the contour, not along it.",
        },
        {
          label: "It depends on the surface — sometimes along, sometimes across",
          feedback:
            "It's always perpendicular, on any smooth surface. The argument is general: height is constant along a contour, so the steepest direction must be square to it.",
        },
      ],
      difficulty: 2,
      targets: ["grad:perpendicular"],
    },
    {
      id: "magnitude-predict",
      kind: "predict",
      setup: "You drag the point from a steep slope toward a peak, watching the gradient arrow.",
      prompt: "What happens to the arrow's length as you approach the summit?",
      options: [
        {
          label: "It shrinks toward zero — the slope flattens out at the top",
          correct: true,
          feedback:
            "Right. The arrow's length is the slope, and the surface flattens as it nears a peak, so the gradient shrinks to the zero vector exactly at the summit.",
        },
        {
          label: "It grows longer — you're getting closer to the important point",
          feedback:
            "The arrow's length is the steepness, not the importance. Near a peak the surface flattens, so the gradient gets *shorter*, reaching zero at the top.",
        },
        {
          label: "It stays the same length the whole way",
          feedback:
            "The length tracks the local slope, which changes as you move — steep on the flank, flat at the summit. It shrinks to zero at the peak.",
        },
      ],
      verify: "The arrow length is |∇f|, the local slope — it vanishes at a flat summit.",
      difficulty: 2,
      targets: ["grad:magnitude"],
    },
    {
      id: "break-local-trap",
      kind: "experiment-task",
      prompt: "Break it on purpose: release a greedy climb from the lower-left basin and watch it get trapped on the shorter hill — the gradient vanishes, but it isn't the highest point.",
      taskEvent: "the-gradient:local-max-trap",
      feedback:
        "You've seen the gradient's blind spot: it's purely local. Which summit a greedy run reaches is decided by where it started, not by the gradient — the reason training is repeated from many initialisations.",
      difficulty: 1,
      targets: ["grad:break"],
    },
    {
      id: "break-vanishing-gradient",
      kind: "experiment-task",
      prompt: "Now the other failure: drag the start far out onto the dark flat and release. Watch the climb crawl — the gradient is tiny far from any peak, so each step barely moves.",
      taskEvent: "the-gradient:vanishing-gradient",
      feedback:
        "That's a vanishing gradient — small not because you've arrived but because the surface is flat, so descent starves of signal. It's the boundary the trap card names: a small gradient is fine at an optimum, and stuck everywhere else.",
      difficulty: 1,
      targets: ["grad:break-vanishing"],
    },
    {
      id: "transfer-training-plateau",
      kind: "transfer",
      scenario:
        "A team trains the same neural network from five different random initialisations. The runs settle at noticeably different final training losses, and each one's loss stops improving while its gradient norm goes to nearly zero.",
      prompt: "From what you've learned about the gradient, what's happening, and what does it justify?",
      options: [
        {
          label:
            "The loss landscape is non-convex with many stationary points; each run is captured by a different basin — which justifies trying multiple initialisations and keeping the best",
          correct: true,
          feedback:
            "That's the transfer: a near-zero gradient is a stationary point, not necessarily the global minimum. Different seeds land in different basins, so running several and keeping the best is the standard response.",
        },
        {
          label: "The learning rate is too high, so every run overshoots the same minimum",
          feedback:
            "Overshooting would show as unstable or rising loss, not runs that *settle* with vanishing gradients. Settling at different low points with ∇≈0 is the signature of different local optima, not overshoot.",
        },
        {
          label: "There isn't enough training data, so the model can't find the minimum",
          feedback:
            "More data changes the landscape's shape but not the core fact that a non-convex surface has many stationary points. Different seeds settling differently is an *optimisation* (initialisation) effect, not a data-volume one.",
        },
      ],
      difficulty: 3,
      targets: ["grad:transfer-nonconvex"],
    },
  ],
};
