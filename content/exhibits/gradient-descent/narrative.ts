import type { ExhibitNarrative } from "@/lib/narrative/schema";

export const gradientDescentNarrative: ExhibitNarrative = {
  nodeId: "gradient-descent",
  hook: [
    "Imagine standing on a hillside in fog so thick you can see nothing — no valley, no horizon, only the ground under your boots. You want the lowest point of the landscape. The one thing you can always sense is the tilt of the ground where you stand. So you take a step in the steepest downhill direction, feel again, and repeat.",
    "That is the entire algorithm. No map, no overview, no cleverness — just slope, step, repeat, thousands of times. It sounds too primitive to matter, and it trains essentially everything: the line below, and by the same logic, models with billions of parameters. The experiment puts the fog, the hillside, and the stride length under your control.",
  ],
  story: [
    {
      id: "the-landscape",
      heading: "The invisible landscape",
      paragraphs: [
        "Where does the hillside come from? Every possible line — every pair of slope and intercept — is a place, and the altitude of that place is the loss: how badly that line fits the data. Good lines live in valleys; terrible lines live on peaks. Training is travel across this landscape, and the training curve you watched is the altimeter log of the journey.",
        "The model never sees the whole landscape — computing it everywhere would mean trying every possible line, which is exactly what we're trying to avoid. It only ever measures the tilt underfoot: the gradient.",
      ],
    },
    {
      id: "the-step",
      heading: "Slope, step, repeat",
      paragraphs: [
        "The gradient points in the direction of steepest ascent, so the update rule walks the other way: new parameters equal old parameters minus the learning rate times the gradient. That minus sign is the entire “descent” in gradient descent.",
        "Notice what the rule buys for free: where the surface is steep, the gradient is large and the steps are long; near the valley floor, the gradient shrinks and the walk slows itself down precisely where care is needed. The fast-fall-then-crawl shape of your training curve is this self-throttling, drawn in loss.",
      ],
    },
    {
      id: "the-stride",
      heading: "One knob to rule the walk",
      paragraphs: [
        "The learning rate is stride length, and you've now seen all three of its regimes. Too small, and the walk is technically correct but practically frozen — “too timid” would take thousands of steps to cross a landscape it could cross in fifty. Too large, and each stride sails over the valley and lands higher up the opposite wall; the loss compounds upward and explodes. In between sits a band where descent is quick and stable.",
        "Nothing about the data changed across your three scenarios — only the stride. That is why the learning rate is the first hyperparameter every practitioner learns to respect, and usually the first one they blame.",
      ],
    },
  ],
  fieldNotes: [
    "Real training sets are too large to measure the slope exactly, so practice uses stochastic gradient descent: estimate the gradient from a small random batch and take the slightly noisy step anyway.",
    "Modern optimizers — momentum, Adam — are this same walk with memory and per-parameter stride adjustment bolted on. The fog, the slope, and the step survive intact.",
    "When a training run diverges and the loss curve rockets upward, the first question asked in any ML team is the one this exhibit taught: what's the learning rate?",
  ],
};
