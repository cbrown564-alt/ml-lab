import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Gradient descent, told as a scroll spine (Stream 2). The hook walks in the
 * fog; the landscape beat lifts it to reveal the loss surface; the rule beat
 * names the one-line update; then two failure regimes — too timid, over the
 * edge — and a closing beat on the single knob behind all three. The sticky
 * graphic switches between the line view and the surface view per beat
 * (see spine.ts); the prose lives here so the narration has one source (C3).
 */

export const gradientDescentNarrative: ExhibitNarrative = {
  nodeId: "gradient-descent",
  hook: [
    "Imagine a hillside in fog so thick you can see nothing — no valley, no horizon, only the ground beneath your boots. You want the lowest point in the whole landscape, and the one thing you can always sense is the tilt of the ground where you stand. So you step in the steepest downhill direction, feel again, and repeat.",
    "That is the entire algorithm. No map, no overview, no cleverness — only slope, step, repeat, thousands of times over. On the right, a flat line that knows nothing is about to learn exactly this way. Press play and watch its loss fall by whole powers of ten.",
  ],
  story: [
    {
      id: "the-landscape",
      heading: "The invisible landscape",
      paragraphs: [
        "Switch to the surface to see what that walk was crossing. Every spot on this map is one candidate line — slope left to right, intercept up and down — and its shade is the loss: how badly that line fits the data. Good lines sit in the valley; hopeless ones glare from the bright peaks.",
        "The walker never sees this map. Drawing it would mean scoring every possible line, the very labour we are trying to avoid. It only ever feels the tilt underfoot — the gradient — and the purple path is the trail those blind, local steps leave across the whole landscape.",
      ],
    },
    {
      id: "slope-step-repeat",
      heading: "Slope, step, repeat",
      paragraphs: [
        "One step is almost embarrassingly simple. The gradient points the way uphill, so the update walks the opposite way: the new parameters are the old ones minus the learning rate times the gradient. That single minus sign is the entire “descent” in gradient descent.",
        "Notice the gift hidden in the rule. Where the surface is steep the gradient is large and the strides are long; near the valley floor it shrinks and the walk slows itself precisely where care is wanted. The fast-fall-then-crawl shape of the loss curve is this self-throttling, drawn in loss.",
      ],
    },
    {
      id: "too-timid",
      heading: "Too timid",
      paragraphs: [
        "Now make the stride tiny. The gradient still points the right way, but at this learning rate the walker only shuffles — the dot barely leaves where it began, and thousands of steps would pass before it reached the valley. Undertraining is not a broken model; it is an unfinished walk.",
        "Nudge the learning rate up mid-walk and watch the descent wake. Nothing about the data or the landscape changed — only the length of the step.",
      ],
    },
    {
      id: "over-the-edge",
      heading: "Over the edge",
      paragraphs: [
        "Bigger steps learn faster, so why not enormous ones? With a stride this long, each step sails clean over the valley and lands higher up the far wall than where it set out. The loss does not fall; it compounds upward, and the path rockets off the edge of the map.",
        "That runaway has a name — divergence — and it is the most common way a training run dies. The fix is humbling: take smaller steps.",
      ],
    },
    {
      id: "the-one-knob",
      heading: "One knob behind it all",
      paragraphs: [
        "You have now seen all three regimes, and the data never changed across any of them — only the stride. Too short and the walk freezes; too long and it explodes; between them lies a band where descent is both quick and stable.",
        "That is why the learning rate is the first hyperparameter every practitioner learns to respect, and usually the first one they blame. The same fog, the same slope, the same step scale up untouched to models with billions of parameters.",
      ],
    },
  ],
  fieldNotes: [
    "Real training sets are too large to measure the slope exactly, so practice uses stochastic gradient descent: estimate the gradient from a small random batch and take the slightly noisy step anyway.",
    "Modern optimizers — momentum, Adam — are this same walk with memory and per-parameter stride adjustment bolted on. The fog, the slope, and the step survive intact.",
    "When a training run diverges and the loss curve rockets upward, the first question asked in any ML team is the one this exhibit taught: what's the learning rate?",
  ],
};
