import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * Gradient-descent concept check. The misconceptions here are the ones the
 * three scenarios were built to confront: bigger-is-faster, flat-means-broken,
 * and gradient-points-downhill.
 */
export const gradientDescentCheck: ConceptCheck = {
  nodeId: "gradient-descent",
  items: [
    {
      id: "lr-too-big",
      kind: "choice",
      prompt:
        "In “Over the edge,” a learning rate of 1 made the loss explode. What actually went wrong at each step?",
      options: [
        {
          label: "The step was so large it overshot the valley and landed higher up the far side",
          correct: true,
          feedback:
            "Exactly — each step still moved in the downhill direction, but so far that it passed the bottom and climbed the opposite wall, ending up worse than it started. Repeat that and the loss compounds upward.",
        },
        {
          label: "The algorithm started moving uphill instead of downhill",
          feedback:
            "The direction was never wrong — every step still pointed downhill from where it stood. The step *length* was the problem: it sailed past the bottom and ended up higher on the far wall.",
        },
        {
          label: "Large learning rates make the gradient itself larger",
          feedback:
            "The gradient depends only on where you are on the loss surface, not on the learning rate. The learning rate only scales how far you move along it — and moving too far is exactly what diverged.",
        },
      ],
      difficulty: 2,
      targets: ["gd:divergence-mechanism"],
    },
    {
      id: "why-loss-flattens",
      kind: "choice",
      prompt:
        "With a good learning rate, the loss fell fast at first and then crawled. Why do the steps shrink near the bottom?",
      options: [
        {
          label: "The gradient gets smaller as the surface flattens, so each step covers less ground",
          correct: true,
          feedback:
            "Right — the step size is learning rate × gradient, and near a minimum the gradient approaches zero. Descent slows itself down exactly where precision matters.",
        },
        {
          label: "The algorithm reduces the learning rate as it goes",
          feedback:
            "Not here — the learning rate stayed exactly where you set it (schedules that decay it do exist, but you didn't use one). The shrinking steps came from the shrinking gradient near the bottom.",
        },
        {
          label: "The model runs out of steps in its budget",
          feedback:
            "The crawl happens long before any budget runs out — and it would happen with an unlimited budget too. It's the gradient vanishing near the minimum that shortens the steps.",
        },
      ],
      difficulty: 2,
      targets: ["gd:gradient-magnitude"],
    },
    {
      id: "gradient-direction",
      kind: "choice",
      prompt: "Which way does the gradient itself point, and why do we subtract it?",
      options: [
        {
          label: "It points uphill — toward steepest increase — so stepping downhill means going the opposite way",
          correct: true,
          feedback:
            "Right. The gradient is the direction of steepest *ascent* of the loss; the minus sign in the update rule is the entire “descent” in gradient descent.",
        },
        {
          label: "It points downhill, and subtracting is just a convention",
          feedback:
            "It's the reverse: the gradient points uphill. The subtraction isn't cosmetic — without it you'd be doing gradient *ascent* and maximizing your loss.",
        },
        {
          label: "It points toward the minimum from anywhere on the surface",
          feedback:
            "Only on perfectly round bowls. In general the gradient points in the locally steepest uphill direction, which is usually not the straight line to the minimum — that's why descent curves its way down.",
        },
      ],
      difficulty: 1,
      targets: ["gd:gradient-direction"],
    },
    {
      id: "double-the-stride",
      kind: "predict",
      setup:
        "Stay on “Watch it learn” — learning rate 0.06, which converges (with a zigzag) just fine. You're about to double the stride.",
      prompt:
        "Set the learning rate to 0.12 — twice the step size — and restart the walk. After a few hundred steps, the loss will be…",
      options: [
        {
          label: "Lower, sooner — bigger steps cover the same ground in half the time",
          feedback:
            "That's true right up until the step size crosses this surface's stability limit — which sits, inconveniently, between 0.06 and 0.12. Past it, every step overshoots more than it gains.",
        },
        {
          label: "About the same — the walk converges either way, just along a different path",
          feedback:
            "There's a cliff between these two rates, not a gentle trade-off. Below the critical step size the walk converges; above it, each step lands higher than the last and the loss explodes.",
        },
        {
          label: "Astronomically worse — 0.12 is past this surface's speed limit, and the walk explodes",
          correct: true,
          feedback:
            "Right — and this is the unsettling part: the zigzagging 0.06 was already most of the way to the critical step size (≈0.077). The boundary between converging and exploding is a line you cross, not a slope you climb.",
        },
      ],
      verify:
        "Drag the learning-rate knob to 0.12, restart the descent, and play. Then lift the fog and watch the path rocket off the map.",
      difficulty: 3,
      targets: ["gd:stability-threshold"],
    },
    {
      id: "go-over-the-edge",
      kind: "experiment-task",
      prompt:
        "Break it on purpose: find a learning rate that makes the descent diverge, press play, and watch the first overshoot happen.",
      taskEvent: "gradient-descent:diverged",
      feedback:
        "You've met the failure mode that haunts every real training run — loss climbing by powers of ten, each step landing higher than the last. Now you know its face, and the knob that causes it.",
      difficulty: 1,
      targets: ["gd:divergence"],
    },
  ],
};
