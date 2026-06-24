import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Bias–variance as one knob's story: too stiff misses the shape (bias), too
 * flexible memorises the noise (variance), and the only honest score — on data the
 * model never saw — is lowest in between. The decomposition arrives in Run it.
 */
export const biasVarianceNarrative: ExhibitNarrative = {
  nodeId: "bias-variance",
  hook: [
    "You can make a model fit the training data perfectly — just give it enough flexibility and it will thread a curve through every last point. The catch is that the only score that matters is on data it has never seen, and a model that memorises its training set is often worse there than a cruder one that didn't.",
    "Here is a smooth truth, sampled with a little noise. One knob — how wiggly the curve is allowed to be — and two scores: the error on the points you trained on, and the error on points you held back. Watch them part ways.",
  ],
  story: [
    {
      id: "underfit",
      heading: "Too stiff to see the shape",
      paragraphs: [
        "Start simple: a straight line. It can't bend to follow the curve, so it misses the shape everywhere — and it misses the training points and the held-out points by about the same amount. Both errors are high together. That shared, stubborn error is bias: the model is too rigid to represent the truth, and no amount of data fixes it.",
      ],
    },
    {
      id: "overfit",
      heading: "Flexible enough to memorise",
      paragraphs: [
        "Now give it more freedom. As the degree climbs, the curve bends closer to the training points, and the training error keeps dropping — all the way to zero, where it threads every single dot. But look what the curve does between the dots: it lunges and overshoots, contorting to hit noise it should have ignored. It hasn't learned the shape; it has memorised the sample.",
      ],
    },
    {
      id: "the-sweet-spot",
      heading: "The honest score is U-shaped",
      paragraphs: [
        "That's the tradeoff in one picture. Training error only ever falls. But test error — the honest one, on points the model never saw — starts high (too stiff), drops as the model gains just enough flexibility to catch the real shape, then climbs again as the extra flexibility goes into chasing noise. Lowest in the middle. The art is finding that degree without peeking at the test set.",
      ],
    },
    {
      id: "decomposition",
      heading: "Bias, variance, and irreducible noise",
      paragraphs: [
        "Underneath, the expected error splits into three parts: bias² (how far the model's average prediction sits from the truth), variance (how much the fit jitters as the training sample changes), and the noise you can never remove. Simple models are all bias; flexible ones are all variance; the sweet spot is the smallest total. More data shrinks variance, which is why it lets you afford a more complex model.",
      ],
    },
  ],
  fieldNotes: [
    "You never actually see the test error while choosing — that would be peeking. In practice you hold out a validation set, or use cross-validation, to estimate the U and pick the degree, then report the real test error once, at the end.",
    "Every capacity knob lives on this curve: tree depth, the number of neighbours in k-NN, hidden units in a network, training epochs. Regularisation (next door) is the other lever — it lets a flexible model behave like a simpler one without changing its degree.",
  ],
};
